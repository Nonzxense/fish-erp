package payment

import (
	"fish/internal/constants"
	"fish/internal/domain/common"
	"time"
)

type Payment struct {
	ID uint `gorm:"primaryKey"`

	PartyID string

	Amount common.Money

	Direction constants.PaymentDirection

	PaymentDate time.Time
	Method      string
	Note        *string
}

type PaymentAllocation struct {
	ID uint `gorm:"primaryKey"`

	PaymentID uint
	Payment   Payment

	ReferenceType string
	ReferenceID   string

	AllocatedAmount common.Money
}

type UnpaidInvoice struct {
	ReferenceType string
	ReferenceID   string

	TotalAmount common.Money
	PaidAmount  common.Money

	CreatedAt time.Time
}
