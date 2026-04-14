package invoice

import (
	"fish/internal/domain/container"
	"fish/internal/domain/party"
)

type FishTradeInvoice struct {
	BaseInvoice
	CustomerID  string                    `json:"customerId" gorm:"column:customer_id"`
	Customer    party.Party               `json:"customer" gorm:"foreignKey:CustomerID"`
	Items       []container.FishContainer `json:"items" gorm:"foreignKey:InvoiceId"`
	TotalAmount float64                   `json:"totalAmount"`
}
