package container

import "fish/internal/domain"

type ContainerFilter struct {
	Name        *string `json:"name"`
	ContainerNo *int    `json:"containerNo"`
	Type        *string `json:"type"`
	Color       *string `json:"color"`
	Status      *string `json:"status"`
	domain.Pagination
}
