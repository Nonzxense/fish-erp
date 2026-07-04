package truckinvoice

type ShippingPrices struct {
	ID           uint  `gorm:"primaryKey" json:"-"`
	PlasticLarge int64 `json:"plasticLarge"`
	PlasticSmall int64 `json:"plasticSmall"`
	FoamLarge    int64 `json:"foamLarge"`
	FoamMedium   int64 `json:"foamMedium"`
	FoamSmall    int64 `json:"foamSmall"`
}
