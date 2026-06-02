package dto

import "time"

type ContainerListDTO struct {
	ID          uint   `json:"id"`
	Name        string `json:"name"`
	ContainerNo uint   `json:"containerNo"`
	Color       string `json:"color"`
	Type        string `json:"type"`
}

type ContainerAtCustomerDTO struct {
	ID          uint   `json:"id"`
	Name        string `json:"name"`
	ContainerNo uint   `json:"containerNo"`
	Color       string `json:"color"`
	Type        string `json:"type"`

	AssignedAt *time.Time `json:"assignedAt"`
}

type CustomerWithContainerDTO struct {
	ID   string `json:"id"`
	Name string `json:"name"`

	Containers []ContainerAtCustomerDTO `json:"containers"`
}
