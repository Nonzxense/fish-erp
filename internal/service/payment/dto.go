package payment

import (
	"fish/internal/constants"
	"fish/internal/domain/common"
	"time"
)

type PaymentInput struct {
	PartyID string `json:"partyId" validate:"required"`

	Amount common.Money `json:"amount" validate:"required"`

	Direction constants.PaymentDirection `json:"direction" validate:"oneof=in out,required"`

	PaymentDate time.Time `json:"paymentDate" validate:"required"`
	Method      string    `json:"method" validate:"required"`
	Note        *string   `json:"note"`
}
