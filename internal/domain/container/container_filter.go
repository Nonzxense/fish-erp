package container

type ContainerFilter struct {
	ID       *int    `json:"id"`
	Type     *string `json:"type"`
	Color    *string `json:"color"`
	Status   *string `json:"status"`
	Page     int     `json:"page"`
	PageSize int     `json:"pageSize"`
}
