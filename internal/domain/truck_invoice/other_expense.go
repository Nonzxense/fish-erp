package truckinvoice

import "fish/internal/domain/common"

type OtherExpense struct {
	ID          uint         `json:"id" gorm:"primaryKey"`
	InvoiceID   string       `json:"invoiceId" gorm:"column:invoice_id;not null"`
	Description string       `json:"description"`
	Amount      common.Money `json:"amount"`
}
