package container

type CreateContainerInput struct {
	Name        string  `json:"name"`
	ContainerNo uint    `json:"containerNo"`
	Color       string  `json:"color"`
	Type        string  `json:"type"`
	Status      *string `json:"status"`
}

type CreateFishContainerInput struct {
	ContainerID uint `json:"containerId" validate:"required_if=IsNewContainer false"`

	IsNewContainer bool `json:"isNewContainer"`

	NewcontainerName  *string `json:"newContainerName" validate:"required_if=IsNewContainer true"`
	NewContainerID    *uint   `json:"newContainerId" validate:"required_if=IsNewContainer true"`
	NewContainerType  *string `json:"newContainerType" validate:"required_if=IsNewContainer true"`
	NewContainerColor *string `json:"newContainerColor" validate:"required_if=IsNewContainer true"`

	Fishes []CreateFishDetailInput `json:"fishes" validate:"required,dive"`
}

type CreateFishDetailInput struct {
	Name       string  `json:"name" validate:"required"`
	WeightKg   float64 `json:"weightKg" validate:"required,gt=0"`
	PricePerKg float64 `json:"pricePerKg" validate:"required,gt=0"`
}
