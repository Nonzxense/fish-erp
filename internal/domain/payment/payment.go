package payment

import (
	"fish/internal/domain/common"
	"time"
)

type Payment struct {
	ID uint `json:"id" gorm:"primaryKey"`

	PartyID string `json:"partyId"`

	Amount common.Money `json:"amount"`

	Direction PaymentDirection `json:"direction"`

	PaymentDate time.Time `json:"paymentDate"`
	Method      string    `json:"method"`
	Note        *string   `json:"note"`
}

type PaymentAllocation struct {
	ID uint `json:"id" gorm:"primaryKey"`

	PaymentID uint    `json:"paymentId"`
	Payment   Payment `json:"payment"`

	ReferenceType string `json:"referenceType"`
	ReferenceID   string `json:"referenceId"`

	AllocatedAmount common.Money `json:"allocatedAmount"`
}

type UnpaidInvoice struct {
	ReferenceType string
	ReferenceID   string

	TotalAmount common.Money
	PaidAmount  common.Money

	CreatedAt time.Time
}

const (
	RefTruckInvoice        = "truck_invoice"
	RefFishSaleInvoice     = "fish_sale_invoice"
	RefFishPurchaseInvoice = "fish_purchase_invoice"
)

type PaymentDirection string

const (
	PaymentIn  PaymentDirection = "in"
	PaymentOut PaymentDirection = "out"
)

type PaymentStatus string

const (
	PaymentPaid      = "paid"
	PaymentPending   = "pending"
	PaymentPartial   = "partial"
	PaymentCancelled = "cancelled"
)
