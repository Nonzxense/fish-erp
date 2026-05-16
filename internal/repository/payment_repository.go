package repository

import (
	"fish/internal/constants"
	"fish/internal/domain/common"
	invoiceDomain "fish/internal/domain/invoice"
	paymentDomain "fish/internal/domain/payment"
	truckInvoiceDomain "fish/internal/domain/truck_invoice"
	"fmt"

	"gorm.io/gorm"
)

type PaymentRepository struct {
	db *gorm.DB
}

func NewPaymentRepository(db *gorm.DB) *PaymentRepository {
	return &PaymentRepository{db: db}
}

func (r *PaymentRepository) CreatePayment(tx *gorm.DB, payment *paymentDomain.Payment) error {
	return tx.Create(payment).Error
}

func (r *PaymentRepository) ApplyPayment(tx *gorm.DB, refType, refId string, allocation common.Money) error {
	var model any
	switch refType {
	case constants.RefFishPurchaseInvoice:
		model = &invoiceDomain.FishPurchaseInvoice{}
	case constants.RefFishSaleInvoice:
		model = &invoiceDomain.FishSaleInvoice{}
	case constants.RefTruckInvoice:
		model = &truckInvoiceDomain.CustomerContainer{}
	default:
		return fmt.Errorf("invalid reference type.")
	}

	if err := tx.Model(model).
		Where("id = ?", refId).
		Update(
			"paid_amount",
			gorm.Expr("paid_amount + ?", allocation),
		).Error; err != nil {
		return err
	}

	return nil

}

func (r *PaymentRepository) CreateAllocation(tx *gorm.DB, refType, refId string, allocation common.Money, paymentId uint) error {
	paymentAllocation := paymentDomain.PaymentAllocation{
		PaymentID:       paymentId,
		ReferenceType:   refType,
		ReferenceID:     refId,
		AllocatedAmount: allocation,
	}

	if err := tx.
		Create(&paymentAllocation).Error; err != nil {
		return err
	}

	return nil
}

func (r *PaymentRepository) GetUnpaidInvoicesByPartyID(
	partyID string,
) ([]paymentDomain.UnpaidInvoice, error) {

	var result []paymentDomain.UnpaidInvoice

	var sales []invoiceDomain.FishSaleInvoice
	var purchases []invoiceDomain.FishPurchaseInvoice
	var truckCustomers []truckInvoiceDomain.CustomerContainer

	err := r.db.
		Where("paid_amount < total_amount").
		Where("customer_id = ?", partyID).
		Order("created_at ASC").
		Find(&sales).Error

	if err != nil {
		return nil, err
	}

	err = r.db.
		Where("paid_amount < total_amount").
		Where("supplier_id = ?", partyID).
		Order("created_at ASC").
		Find(&purchases).Error

	if err != nil {
		return nil, err
	}

	err = r.db.
		Model(&truckInvoiceDomain.CustomerContainer{}).
		Joins("JOIN truck_invoices ON truck_invoices.id = customer_containers.invoice_id").
		Where("customer_containers.paid_amount < customer_containers.total_amount").
		Where("customer_containers.customer_id = ?", partyID).
		Preload("TruckInvoice").
		Order("truck_invoices.created_at ASC").
		Find(&truckCustomers).Error

	if err != nil {
		return nil, err
	}

	for _, s := range sales {
		result = append(result, paymentDomain.UnpaidInvoice{
			ReferenceType: constants.RefFishSaleInvoice,
			ReferenceID:   s.ID,

			TotalAmount: s.TotalAmount,
			PaidAmount:  s.PaidAmount,

			CreatedAt: s.CreatedAt,
		})
	}

	for _, p := range purchases {
		result = append(result, paymentDomain.UnpaidInvoice{
			ReferenceType: constants.RefFishPurchaseInvoice,
			ReferenceID:   p.ID,

			TotalAmount: p.TotalAmount,
			PaidAmount:  p.PaidAmount,

			CreatedAt: p.CreatedAt,
		})
	}

	for _, tc := range truckCustomers {
		result = append(result, paymentDomain.UnpaidInvoice{
			ReferenceType: constants.RefTruckInvoice,
			ReferenceID:   tc.ID,

			TotalAmount: tc.TotalAmount,
			PaidAmount:  tc.PaidAmount,

			CreatedAt: tc.TruckInvoice.CreatedAt,
		})
	}

	return result, nil
}
