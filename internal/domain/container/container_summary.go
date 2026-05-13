package container

type ContainerSummary struct {
	Total        int32 `json:"total"`
	AtStore      int32 `json:"atStore"`
	WithCustomer int32 `json:"withCustomer"`
}
