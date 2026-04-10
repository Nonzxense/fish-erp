package container

type CreateContainerInput struct {
	ID     int     `json:"id"`
	Color  string  `json:"color"`
	Type   string  `json:"type"`
	Status *string `json:"status"`
}
