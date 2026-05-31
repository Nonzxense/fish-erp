package container

type Container struct {
	ID          uint    `json:"id" gorm:"primaryKey"`
	Name        string  `json:"name"`
	ContainerNo uint    `json:"containerNo"`
	Color       string  `json:"color"`
	Type        string  `json:"type" gorm:"type:text;check:type IN ('plastic_l','plastic_s','foam_l','foam_m','foam_s')"`
	Status      *string `json:"status" gorm:"type:text;check:status IN ('at_store','with_customer','lost')"`
}
