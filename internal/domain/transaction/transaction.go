package transaction

import "time"

type Transaction struct {
	ID          string    `json:"id" gorm:"primaryKey"`
	Amount      float64   `json:"amount"`
	Type        string    `json:"type"`
	OccurredAt  time.Time `json:"occurredAt"`
	InvoiceID   *string   `json:"invoiceId" gorm:"default:null"`
	InvoiceType *string   `json:"invoiceType" gorm:"default:null"`
	Category    *string   `json:"category,omitempty"`
	Note        *string   `json:"note,omitempty"`
}
