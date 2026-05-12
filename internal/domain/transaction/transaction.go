package transaction

import (
	"fish/internal/domain/common"
	"time"
)

type Transaction struct {
	ID         string       `json:"id" gorm:"primaryKey"`
	Amount     common.Money `json:"amount"`
	Type       string       `json:"type" gorm:"type:text;check:type IN ('income', 'expense')"`
	OccurredAt time.Time    `json:"occurredAt"`
	InvoiceID  *string      `json:"invoiceId" gorm:"default:null"`
	Category   *string      `json:"category,omitempty"`
	Note       *string      `json:"note,omitempty"`
}
