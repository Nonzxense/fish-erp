package invoice

import (
	"fish/internal/domain/container"
	"fish/internal/domain/party"
)

type FishPurchaseInvoice struct {
	BaseInvoice
	SupplierID  string      `json:"supplierId" gorm:"column:supplier_id"`
	Supplier    party.Party `json:"supplier" gorm:"foreignKey:SupplierId"`
	Fishes      []container.FishPurchaseDetail
	TotalAmount float64 `json:"totalAmount"`
}
