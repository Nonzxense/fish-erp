package repository

import (
	"fish/internal/domain/common"
	"fish/internal/domain/container"
	domain "fish/internal/domain/invoice"
	"fish/internal/domain/transaction"
	"fish/internal/utils/ptr"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func applyInvoiceFilter(query *gorm.DB, filter *domain.InvoiceFilter, table string) *gorm.DB {
	if filter == nil {
		return query
	}

	if filter.ID != nil {
		query = query.Where(table+".id LIKE ?", "%"+*filter.ID+"%")
	}

	if filter.PartyName != nil {
		query = query.Where("parties.name LIKE ?", "%"+*filter.PartyName+"%")
	}

	if filter.Status != nil {
		query = query.Where(table+".status = ?", *filter.Status)
	}

	if filter.FromDate != nil {
		query = query.Where(table+".created_at >= ?", *filter.FromDate)
	}

	if filter.ToDate != nil {
		query = query.Where(table+".created_at <= ?", *filter.ToDate)
	}

	return query
}

func countQuery(query *gorm.DB, total *int64) error {
	return query.Count(total).Error
}

func (r *InvoiceRepository) applyStatusTransition(
	oldStatus string,
	newStatus string,
	onPaid func() error,
	onUnpaid func() error,
) error {

	if oldStatus != "paid" && newStatus == "paid" {
		return onPaid()
	}

	if oldStatus == "paid" && newStatus != "paid" {
		return onUnpaid()
	}

	return nil
}

func (r *InvoiceRepository) createInvoiceTransaction(
	tx *gorm.DB,
	invoice *domain.FishSaleInvoice,
) error {
	t := transaction.Transaction{
		ID:         uuid.NewString(),
		InvoiceID:  &invoice.ID,
		Amount:     invoice.TotalAmount,
		OccurredAt: invoice.CreatedAt,
		Type:       "income",
		Category:   ptr.String("ขายปลา"),
		Note:       ptr.String("ใบเสร็จ " + invoice.ID),
	}

	return tx.Create(&t).Error
}

func (r *InvoiceRepository) createInvoiceTransactionByID(
	tx *gorm.DB,
	model interface{},
	id string,
	transactionType string,
	category string,
) error {

	var result struct {
		ID          string
		CreatedAt   time.Time
		TotalAmount common.Money
	}

	if err := tx.Model(model).
		Select("id, created_at, total_amount").
		Where("id = ?", id).
		Scan(&result).Error; err != nil {
		return err
	}

	t := transaction.Transaction{
		ID:         uuid.NewString(),
		InvoiceID:  &result.ID,
		Amount:     result.TotalAmount,
		OccurredAt: result.CreatedAt,
		Type:       transactionType,
		Category:   ptr.String(category),
		Note:       ptr.String("ใบเสร็จ " + result.ID),
	}

	return tx.Create(&t).Error
}

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

	if len(removed) > 0 {
		if err := tx.Model(&container.Container{}).
			Where("id IN ?", removed).
			Update("status", ptr.String("at_store")).Error; err != nil {
			return err
		}
	}

	if len(added) > 0 {
		if err := tx.Model(&container.Container{}).
			Where("id IN ?", added).
			Update("status", ptr.String("with_customer")).Error; err != nil {
			return err
		}
	}

	return nil
}

func (r *InvoiceRepository) syncInvoiceFishDetails(
	tx *gorm.DB,
	oldInvoice *domain.FishPurchaseInvoice,
	newInvoice *domain.FishPurchaseInvoice,
) error {
	oldMap := map[uint]bool{}
	newMap := map[uint]bool{}

	if oldInvoice != nil {
		for _, fish := range oldInvoice.Fishes {
			oldMap[fish.ID] = true
		}
	}

	if newInvoice != nil {
		for _, fish := range newInvoice.Fishes {
			newMap[fish.ID] = true
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

	if len(removed) > 0 {
		if err := tx.Model(&container.FishPurchaseDetail{}).
			Where("id IN ?", removed).
			Delete(&container.FishPurchaseDetail{}).Error; err != nil {
			return err
		}
	}

	if len(added) > 0 {
		for i := range newInvoice.Fishes {
			newInvoice.Fishes[i].InvoiceId = newInvoice.ID
		}

		if len(newInvoice.Fishes) > 0 {
			if err := tx.Create(&newInvoice.Fishes).Error; err != nil {
				return err
			}
		}
	}

	return nil
}
