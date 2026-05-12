package invoice

import (
	"fish/internal/domain/common"
	"fish/internal/domain/container"
	"fish/internal/domain/party"
)

type FishPurchaseInvoice struct {
	BaseInvoice
	SupplierID  string                         `json:"supplierId" gorm:"column:supplier_id"`
	Supplier    party.Party                    `json:"supplier" gorm:"foreignKey:SupplierId"`
	Fishes      []container.FishPurchaseDetail `json:"items" gorm:"foreignKey:InvoiceId;constraint:OnDelete:CASCADE"`
	TotalAmount common.Money                   `json:"totalAmount"`
}
