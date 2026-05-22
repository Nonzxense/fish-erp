package dto

import (
	paymentDomain "fish/internal/domain/payment"
	"time"
)

type PayInvoiceInput struct {
	PaymentInput
	ReferenceID   string `json:"referenceId"`
	ReferenceType string `json:"referenceType"`
}

type PaymentInput struct {
	PartyID string `json:"partyId" validate:"required"`

	Amount float64 `json:"amount" validate:"required"`

	Direction paymentDomain.PaymentDirection `json:"direction" validate:"oneof=in out,required"`

	PaymentDate time.Time `json:"paymentDate" validate:"required"`
	Method      string    `json:"method" validate:"required"`
	Note        *string   `json:"note"`
}
