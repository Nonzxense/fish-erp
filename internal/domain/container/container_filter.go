package container

import "fish/internal/domain"

type ContainerFilter struct {
	ID     *int    `json:"id"`
	Type   *string `json:"type"`
	Color  *string `json:"color"`
	Status *string `json:"status"`
	domain.Pagination
}
