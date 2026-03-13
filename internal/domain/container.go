package domain

type Container struct {
	ID     int     `json:"id" gorm:"primaryKey"`
	Color  string  `json:"color"`
	Type   string  `json:"type" gorm:"type:text;check:type IN ('plastic_l','plastic_s','foam_l','foam_m','foam_s')"`
	Status *string `json:"status" gorm:"type:text;check:status IN ('at_store','with_customer','lost')"`
}
