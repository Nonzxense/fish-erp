package repository

import (
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
	case paymentDomain.RefFishPurchaseInvoice:
		model = &invoiceDomain.FishPurchaseInvoice{}
	case paymentDomain.RefFishSaleInvoice:
		model = &invoiceDomain.FishSaleInvoice{}
	case paymentDomain.RefTruckInvoice:
		model = &truckInvoiceDomain.ShippingInvoice{}
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
	var shipping []truckInvoiceDomain.ShippingInvoice

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
		Model(&truckInvoiceDomain.ShippingInvoice{}).
		Joins("JOIN truck_invoices ON truck_invoices.id = shipping_invoices.invoice_id").
		Where("shipping_invoices.paid_amount < shipping_invoices.total_amount").
		Where("shipping_invoices.customer_id = ?", partyID).
		Preload("TruckInvoice").
		Order("truck_invoices.created_at ASC").
		Find(&shipping).Error

	if err != nil {
		return nil, err
	}

	for _, s := range sales {
		result = append(result, paymentDomain.UnpaidInvoice{
			ReferenceType: paymentDomain.RefFishSaleInvoice,
			ReferenceID:   s.ID,

			TotalAmount: s.TotalAmount,
			PaidAmount:  s.PaidAmount,

			CreatedAt: s.CreatedAt,
		})
	}

	for _, p := range purchases {
		result = append(result, paymentDomain.UnpaidInvoice{
			ReferenceType: paymentDomain.RefFishPurchaseInvoice,
			ReferenceID:   p.ID,

			TotalAmount: p.TotalAmount,
			PaidAmount:  p.PaidAmount,

			CreatedAt: p.CreatedAt,
		})
	}

	for _, tc := range shipping {
		result = append(result, paymentDomain.UnpaidInvoice{
			ReferenceType: paymentDomain.RefTruckInvoice,
			ReferenceID:   tc.ID,

			TotalAmount: tc.TotalAmount,
			PaidAmount:  tc.PaidAmount,

			CreatedAt: tc.TruckInvoice.CreatedAt,
		})
	}

	return result, nil
}

func (r *PaymentRepository) GetPaymentsByPartyID(
	partyID string,
) ([]paymentDomain.Payment, int64, error) {
	var payments []paymentDomain.Payment
	var total int64

	baseQuery := r.db.
		Model(&paymentDomain.Payment{}).
		Where("party_id = ?", partyID)

	if err := baseQuery.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := baseQuery.
		Order("payment_date DESC").
		Find(&payments).Error; err != nil {
		return nil, 0, err
	}

	return payments, total, nil
}

func (r *PaymentRepository) GetPaymentTotalByPartyID(direction paymentDomain.PaymentDirection, partyID string) (common.Money, error) {
	var totalAmount common.Money

	if err := r.db.Model(&paymentDomain.Payment{}).
		Where("party_id = ? AND direction = ?", partyID, direction).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&totalAmount).Error; err != nil {
		return 0, err
	}

	return totalAmount, nil
}

func (r *PaymentRepository) GetAllocationsByPaymentID(paymentID uint) ([]paymentDomain.PaymentAllocation, error) {
	var allocations []paymentDomain.PaymentAllocation
	if err := r.db.Where("payment_id = ?", paymentID).Find(&allocations).Error; err != nil {
		return nil, err
	}
	return allocations, nil
}
