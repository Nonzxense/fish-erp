package container

type CreateContainerInput struct {
	ID     uint    `json:"id"`
	Color  string  `json:"color"`
	Type   string  `json:"type"`
	Status *string `json:"status"`
}

type CreateFishContainerInput struct {
	ContainerID       uint                    `json:"containerId" validate:"required_if=IsNewContainer false"`
	IsNewContainer    bool                    `json:"isNewContainer"`
	NewContainerID    uint                    `json:"newContainerNo" validate:"required_if=IsNewContainer true"`
	NewContainerType  string                  `json:"newContainerType"`
	NewContainerColor string                  `json:"newContainerColor"`
	Fishes            []CreateFishDetailInput `json:"fishes" validate:"required,dive"`
}

type CreateFishDetailInput struct {
	FishName   string  `json:"fishName" validate:"required"`
	WeightKg   float64 `json:"weightKg" validate:"required,gt=0"`
	PricePerKg float64 `json:"pricePerKg" validate:"required,gt=0"`
}
