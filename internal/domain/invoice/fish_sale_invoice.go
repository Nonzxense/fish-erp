package invoice

import (
	"fish/internal/domain/container"
	"fish/internal/domain/party"
)

type FishSaleInvoice struct {
	BaseInvoice
	CustomerID  string                    `json:"customerId" gorm:"column:customer_id;index"`
	Customer    party.Party               `json:"customer" gorm:"foreignKey:CustomerID"`
	Items       []container.FishContainer `json:"items" gorm:"foreignKey:InvoiceId;constraint:OnDelete:CASCADE"`
	TotalAmount float64                   `json:"totalAmount"`
}
