package repository

import (
	containerDomain "fish/internal/domain/container"
	domain "fish/internal/domain/invoice"
	transaction "fish/internal/domain/transaction"
	"fish/internal/utils/ptr"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type InvoiceRepository struct {
	db *gorm.DB
}

func NewInvoiceRepository(db *gorm.DB) *InvoiceRepository {
	return &InvoiceRepository{db: db}
}

func (r *InvoiceRepository) GetDB() *gorm.DB {
	return r.db
}

func (r *InvoiceRepository) CreateFishSaleInvoice(
	invoice *domain.FishSaleInvoice,
) error {
	return r.db.Transaction(func(tx *gorm.DB) error {

		// 1 invoice
		if err := tx.Omit("Items").Create(invoice).Error; err != nil {
			return err
		}

		// 2 transaction
		if err := r.syncInvoiceTransaction(tx, invoice); err != nil {
			return err
		}

		// 3 containers
		for i := range invoice.Items {
			item := &invoice.Items[i]
			item.InvoiceId = invoice.ID

			if err := tx.Omit("Fishes").Create(item).Error; err != nil {
				return err
			}

			// 4 fishes after container ID exists
			for j := range item.Fishes {
				item.Fishes[j].FishContainerID = item.ID
			}

			if len(item.Fishes) > 0 {
				if err := tx.Create(&item.Fishes).Error; err != nil {
					return err
				}
			}
		}

		return nil
	})
}

func (r *InvoiceRepository) CreateInvoice(invoice *domain.BaseInvoice) error {
	return r.db.Create(invoice).Error
}

func (r *InvoiceRepository) FindAllFishSaleInvoices(filter *domain.InvoiceFilter) ([]domain.FishSaleInvoice, int64, error) {
	var invoices []domain.FishSaleInvoice
	var total int64

	query := r.db.Model(&domain.FishSaleInvoice{}).
		Joins("LEFT JOIN parties ON parties.id = fish_sale_invoices.customer_id")

	if filter != nil {
		if filter.Type != nil {
			query = query.Where("fish_sale_invoices.type = ?", *filter.Type)
		}

		if filter.Name != nil {
			query = query.Where("parties.name LIKE ?", "%"+*filter.Name+"%")
		}

		if filter.FromDate != nil {
			query = query.Where("fish_sale_invoices.created_at >= ?", *filter.FromDate)
		}

		if filter.ToDate != nil {
			query = query.Where("fish_sale_invoices.created_at <= ?", *filter.ToDate)
		}
	}

	err := query.
		Preload("Customer").
		Preload("Items").
		Preload("Items.Fishes").
		Order("fish_sale_invoices.id DESC").
		Find(&invoices).
		Error

	return invoices, total, err
}

func (r *InvoiceRepository) UpdateFishSaleInvoice(
	id string,
	invoice *domain.FishSaleInvoice,
) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		var oldInvoice domain.FishSaleInvoice

		if err := tx.Preload("Items").
			First(&oldInvoice, "id = ?", id).Error; err != nil {
			return err
		}

		if err := r.syncInvoiceContainers(tx, &oldInvoice, invoice); err != nil {
			return err
		}

		if err := r.syncInvoiceTransaction(tx, invoice); err != nil {
			return err
		}

		// update invoice
		if err := tx.Model(&domain.FishSaleInvoice{}).
			Where("id = ?", id).
			Omit("id").
			Updates(invoice).Error; err != nil {
			return err
		}

		// delete old fish_details
		if err := tx.Exec(`
			DELETE FROM fish_details
			WHERE fish_container_id IN (
				SELECT id FROM fish_containers WHERE invoice_id = ?
			)
		`, id).Error; err != nil {
			return err
		}

		// delete old containers
		if err := tx.Where("invoice_id = ?", id).
			Delete(&containerDomain.FishContainer{}).Error; err != nil {
			return err
		}

		// recreate containers + fishes
		for i := range invoice.Items {
			item := &invoice.Items[i]
			item.InvoiceId = id

			fishes := item.Fishes
			item.Fishes = nil

			if err := tx.Create(item).Error; err != nil {
				return err
			}

			for j := range fishes {
				fishes[j].FishContainerID = item.ID
			}

			if len(fishes) > 0 {
				if err := tx.Create(&fishes).Error; err != nil {
					return err
				}
			}
		}

		return nil
	})
}

func (r *InvoiceRepository) DeleteFishSaleInvoices(ids []string) error {
	return r.db.Unscoped().
		Where("id IN ?", ids).
		Delete(&domain.FishSaleInvoice{}).Error
}

// --- Helpers ---

func (r *InvoiceRepository) syncInvoiceTransaction(
	tx *gorm.DB,
	invoice *domain.FishSaleInvoice,
) error {
	transactionTypes := map[string]string{
		"sale":     "income",
		"purchase": "expense",
	}

	t := transaction.Transaction{
		Amount:     invoice.TotalAmount,
		OccurredAt: invoice.CreatedAt,
		Category:   ptr.String("trade"),
		Type:       transactionTypes[invoice.Type],
		Note:       ptr.String("Auto-generated from Fish Trade Invoice: " + invoice.ID),
	}

	result := tx.Model(&transaction.Transaction{}).
		Where("invoice_id = ?", invoice.ID).
		Omit("Note").
		Updates(t)

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		t.ID = uuid.NewString()
		t.InvoiceID = &invoice.ID

		if err := tx.Create(&t).Error; err != nil {
			return err
		}
	}

	return nil
}

func (r *InvoiceRepository) syncInvoiceContainers(
	tx *gorm.DB,
	oldInvoice *domain.FishSaleInvoice,
	newInvoice *domain.FishSaleInvoice,
) error {
	oldMap := map[uint]bool{}
	newMap := map[uint]bool{}

	// nil safe
	if oldInvoice != nil {
		for _, item := range oldInvoice.Items {
			oldMap[item.ContainerID] = true
		}
	}

	if newInvoice != nil {
		for _, item := range newInvoice.Items {
			newMap[item.ContainerID] = true
		}
	}

	var removed []uint
	var added []uint

	for id := range oldMap {
		if !newMap[id] {
			removed = append(removed, id)
		}
	}

	for id := range newMap {
		if !oldMap[id] {
			added = append(added, id)
		}
	}

	// removed -> available
	if len(removed) > 0 {
		if err := tx.Model(&containerDomain.Container{}).
			Where("id IN ?", removed).
			Update("status", ptr.String("available")).Error; err != nil {
			return err
		}
	}

	// added -> with_customer
	if len(added) > 0 {
		if err := tx.Model(&containerDomain.Container{}).
			Where("id IN ?", added).
			Update("status", ptr.String("with_customer")).Error; err != nil {
			return err
		}
	}

	return nil
}
