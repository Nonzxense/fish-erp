package container

import "fish/internal/domain/common"

type FishContainer struct {
	ID          uint             `json:"id" gorm:"primaryKey"`
	InvoiceId   string           `json:"invoiceId" gorm:"column:invoice_id;not null"`
	ContainerID uint             `json:"containerId" gorm:"column:container_id;not null"`
	Fishes      []FishSaleDetail `json:"fishes" gorm:"foreignKey:FishContainerID;constraint:OnDelete:CASCADE"`
}

type FishSaleDetail struct {
	FishContainerID uint         `gorm:"index"`
	ID              uint         `gorm:"primaryKey"`
	Name            string       `json:"name" gorm:"column:fish_name;not null"`
	WeightKg        float64      `json:"weightKg" gorm:"column:weight_kg;not null"`
	PricePerKg      common.Money `json:"pricePerKg" gorm:"column:price_per_kg;not null"`
}

type FishPurchaseDetail struct {
	InvoiceId  string       `gorm:"index"`
	ID         uint         `gorm:"primaryKey"`
	Name       string       `json:"name" gorm:"column:fish_name;not null"`
	WeightKg   float64      `json:"weightKg" gorm:"column:weight_kg;not null"`
	PricePerKg common.Money `json:"pricePerKg" gorm:"column:price_per_kg;not null"`
}
