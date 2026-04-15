package repository

import (
	containerDomain "fish/internal/domain/container"
	domain "fish/internal/domain/invoice"
	transaction "fish/internal/domain/transaction"
	"fish/internal/ptr"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type InvoiceRepository struct {
	db *gorm.DB
}

func NewInvoiceRepository(db *gorm.DB) *InvoiceRepository {
	return &InvoiceRepository{db: db}
}

func (r *InvoiceRepository) CreateFishTradeInvoice(invoice *domain.FishTradeInvoice) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(invoice).Error; err != nil {
			return err
		}

		t := &transaction.Transaction{
			ID:          uuid.NewString(),
			Amount:      invoice.TotalAmount,
			OccurredAt:  time.Now(),
			InvoiceID:   &invoice.ID,
			InvoiceType: ptr.String("sale"),
			Category:    ptr.String("trade"),
			Note:        ptr.String("Auto-generated from Fish Trade Invoice: " + invoice.ID),
		}

		if err := tx.Create(t).Error; err != nil {
			return err
		}

		containerIDs := make([]uint, 0, len(invoice.Items))

		for _, fishContainer := range invoice.Items {
			containerIDs = append(containerIDs, fishContainer.ContainerID)
		}

		if err := tx.Model(&containerDomain.Container{}).
			Where("id IN ?", containerIDs).
			Updates(containerDomain.Container{
				Status: ptr.String("with_customer"),
			}).Error; err != nil {
			return err
		}

		return nil
	})
}

func (r *InvoiceRepository) CreateInvoice(invoice *domain.BaseInvoice) error {
	return r.db.Create(invoice).Error
}

func (r *InvoiceRepository) FindAllFishTradeInvoices(filter *domain.InvoiceFilter) ([]domain.FishTradeInvoice, int64, error) {
	var invoices []domain.FishTradeInvoice
	var total int64

	query := r.db.Model(&domain.FishTradeInvoice{}).
		Joins("LEFT JOIN parties ON parties.id = fish_trade_invoices.customer_id")

	if filter != nil {
		if filter.Type != nil {
			query = query.Where("fish_trade_invoices.type = ?", *filter.Type)
		}

		if filter.Name != nil {
			query = query.Where("parties.name LIKE ?", "%"+*filter.Name+"%")
		}

		if filter.FromDate != nil {
			query = query.Where("fish_trade_invoices.created_at >= ?", *filter.FromDate)
		}

		if filter.ToDate != nil {
			query = query.Where("fish_trade_invoices.created_at <= ?", *filter.ToDate)
		}
	}

	err := query.
		Preload("Customer").
		Order("fish_trade_invoices.created_at DESC").
		Find(&invoices).
		Error

	return invoices, total, err
}
