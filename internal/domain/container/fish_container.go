package container

type FishContainer struct {
	ID          uint         `json:"id" gorm:"primaryKey"`
	InvoiceId   string       `json:"invoiceId" gorm:"column:invoice_id;not null"`
	ContainerID uint         `json:"containerId" gorm:"column:container_id;not null"`
	Fishes      []FishDetail `json:"fishes" gorm:"foreignKey:FishContainerID;constraint:OnDelete:CASCADE"`
}

type FishDetail struct {
	ID              uint    `gorm:"primaryKey"`
	FishContainerID uint    `gorm:"index"`
	Name            string  `json:"name" gorm:"column:fish_name;not null"`
	WeightKg        float64 `json:"weightKg" gorm:"column:weight_kg;not null"`
	PricePerKg      float64 `json:"pricePerKg" gorm:"column:price_per_kg;not null"`
}
