package repository

import (
	containerDomain "fish/internal/domain/container"
	domain "fish/internal/domain/invoice"
	transaction "fish/internal/domain/transaction"
	"fmt"

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

		// 2 containers
		for i := range invoice.Items {
			item := &invoice.Items[i]
			item.InvoiceId = invoice.ID

			if err := tx.Omit("Fishes").Create(item).Error; err != nil {
				return err
			}

			// 3 fishes after container ID exists
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

func (r *InvoiceRepository) CreateFishPurchaseInvoice(
	invoice *domain.FishPurchaseInvoice,
) error {
	return r.db.Transaction(func(tx *gorm.DB) error {

		if err := tx.Omit("Fishes").Create(invoice).Error; err != nil {
			return err
		}

		for i := range invoice.Fishes {
			invoice.Fishes[i].InvoiceId = invoice.ID
		}

		if len(invoice.Fishes) > 0 {
			if err := tx.Create(&invoice.Fishes).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

func (r *InvoiceRepository) CreateInvoice(invoice *domain.BaseInvoice) error {
	return r.db.Create(invoice).Error
}

func (r *InvoiceRepository) FindAllFishSaleInvoices(
	filter *domain.InvoiceFilter,
) ([]domain.FishSaleInvoice, int64, error) {

	var invoices []domain.FishSaleInvoice
	var total int64

	base := r.db.Model(&domain.FishSaleInvoice{}).
		Joins("LEFT JOIN parties ON parties.id = fish_sale_invoices.customer_id")

	query := applyInvoiceFilter(base, filter, "fish_sale_invoices")

	if err := countQuery(query, &total); err != nil {
		return nil, 0, err
	}

	err := query.
		Preload("Customer").
		Preload("Items").
		Preload("Items.Fishes").
		Order("fish_sale_invoices.id DESC").
		Find(&invoices).Error

	return invoices, total, err
}

func (r *InvoiceRepository) FindAllFishPurchaseInvoices(
	filter *domain.InvoiceFilter,
) ([]domain.FishPurchaseInvoice, int64, error) {

	var invoices []domain.FishPurchaseInvoice
	var total int64

	base := r.db.Model(&domain.FishPurchaseInvoice{}).
		Joins("LEFT JOIN parties ON parties.id = fish_purchase_invoices.supplier_id")

	query := applyInvoiceFilter(base, filter, "fish_purchase_invoices")

	if err := countQuery(query, &total); err != nil {
		return nil, 0, err
	}

	err := query.
		Preload("Supplier").
		Preload("Fishes").
		Order("fish_purchase_invoices.id DESC").
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

func (r *InvoiceRepository) UpdateFishPurchaseInvoice(
	id string,
	invoice *domain.FishPurchaseInvoice,
) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		var oldInvoice *domain.FishPurchaseInvoice

		if err := tx.Preload("Fishes").
			First(&oldInvoice, "id = ?", id).Error; err != nil {
			return err
		}

		if err := r.syncInvoiceFishDetails(tx, oldInvoice, invoice); err != nil {
			return err
		}

		if err := tx.Model(&domain.FishPurchaseInvoice{}).
			Where("id = ?", id).
			Omit("id").
			Updates(invoice).Error; err != nil {
			return err
		}

		return nil
	})
}

func (r *InvoiceRepository) DeleteFishSaleInvoices(ids []string) error {
	return r.db.Unscoped().
		Where("id IN ?", ids).
		Delete(&domain.FishSaleInvoice{}).Error
}

func (r *InvoiceRepository) ChangeInvoiceStatus(model interface{}, id string, newStatus string) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		var oldStatus string
		var transactionType string
		var category string

		switch model.(type) {
		case *domain.FishSaleInvoice:
			transactionType = "income"
			category = "ขายปลา"

		case *domain.FishPurchaseInvoice:
			transactionType = "expense"
			category = "ซื้อปลา"

		default:
			return fmt.Errorf("unsupported type")
		}

		if err := tx.Model(model).
			Select("status").
			Where("id = ?", id).
			Scan(&oldStatus).Error; err != nil {
			return err
		}

		if err := tx.Model(model).
			Where("id = ?", id).
			Update("status", newStatus).Error; err != nil {
			return err
		}

		return r.applyStatusTransition(
			oldStatus,
			newStatus,
			func() error {
				return r.createInvoiceTransactionByID(tx, model, id, transactionType, category)
			},
			func() error {
				return tx.Where("invoice_id = ?", id).
					Delete(&transaction.Transaction{}).Error
			},
		)
	})
}

func (r *InvoiceRepository) GetFishTradeInvoiceSummary(invoiceType string) (domain.FishTradeInvoiceSummary, error) {
	var summary domain.FishTradeInvoiceSummary
	var query *gorm.DB

	switch invoiceType {
	case "sale":
		query = r.db.Model(&domain.FishSaleInvoice{})
	case "purchase":
		query = r.db.Model(&domain.FishPurchaseInvoice{})
	default:
		return summary, fmt.Errorf("invalid invoice type")
	}

	err := query.
		Select(`
			COUNT(*) AS total_invoices,
			SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) AS paid,
			SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending
		`).
		Scan(&summary).Error

	return summary, err
}
