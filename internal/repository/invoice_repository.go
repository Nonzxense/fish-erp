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
