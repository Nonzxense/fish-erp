package container

type FishContainer struct {
	ID          string       `json:"id" gorm:"primaryKey"`
	InvoiceId   string       `json:"invoiceId" gorm:"column:invoice_id;not null"`
	ContainerID uint         `json:"containerId" gorm:"column:container_id;not null"`
	Fishes      []FishDetail `json:"fishes" gorm:"column:fishes;not null"`
}

type FishDetail struct {
	FishName   string  `json:"fishName" gorm:"column:fish_name;not null"`
	WeightKg   float64 `json:"weightKg" gorm:"column:weight_kg;not null"`
	PricePerKg float64 `json:"pricePerKg" gorm:"column:price_per_kg;not null"`
}
