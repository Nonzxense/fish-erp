package container

type ContainerSummary struct {
	Total          float64 `json:"total"`
	AtStore      float64 `json:"atStore"`
	WithCustomer float64 `json:"withCustomer"`
}
