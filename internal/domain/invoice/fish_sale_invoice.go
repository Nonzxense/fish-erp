package invoice

import (
	"fish/internal/domain/common"
	"fish/internal/domain/container"
	"fish/internal/domain/party"
)

type FishSaleInvoice struct {
	BaseInvoice
	CustomerID  string                    `json:"customerId" gorm:"column:customer_id;index"`
	Customer    party.Party               `json:"customer" gorm:"foreignKey:CustomerID"`
	Items       []container.FishContainer `json:"items" gorm:"foreignKey:InvoiceId;constraint:OnDelete:CASCADE"`
	TotalAmount common.Money              `json:"totalAmount" gorm:"default:0;column:total_amount"`
	PaidAmount  common.Money              `json:"paidAmount" gorm:"default:0;column:paid_amount"`
}
