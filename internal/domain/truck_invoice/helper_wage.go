package truckinvoice

import "fish/internal/domain/common"

type HelperWage struct {
	ID        uint         `json:"id" gorm:"primaryKey"`
	InvoiceID string       `json:"invoiceId" gorm:"column:invoice_id;not null"`
	Name      string       `json:"name" gorm:"not null"`
	Amount    common.Money `json:"amount" gorm:"not null;default:0"`
}
