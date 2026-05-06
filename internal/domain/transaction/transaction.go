package transaction

import "time"

type Transaction struct {
	ID          string    `json:"id" gorm:"primaryKey"`
	Amount      float64   `json:"amount"`
	Type        string    `json:"type" gorm:"type:text;check:type IN ('income', 'expense')"`
	OccurredAt  time.Time `json:"occurredAt"`
	InvoiceID   *string   `json:"invoiceId" gorm:"default:null"`
	Category    *string   `json:"category,omitempty"`
	Note        *string   `json:"note,omitempty"`
}
