package main

import (
	"fish/internal/domain"
	containerDomain "fish/internal/domain/container"
	"fish/internal/dto"
	"fish/internal/service/container"
)

func (a *App) CreateContainer(input container.CreateContainerInput) error {
	return a.containerService.CreateContainer(input)
}

func (a *App) GetContainers(filter *containerDomain.ContainerFilter) (domain.PageResult[containerDomain.Container], error) {
	return a.containerService.List(filter)
}

func (a *App) ListAtStore() ([]dto.ContainerListDTO, error) {
	return a.containerService.ListAtStore()
}

func (a *App) ListAtCustomer() ([]dto.CustomerWithContainerDTO, error) {
	return a.containerService.ListAtCustomer()
}

func (a *App) GetContainerSummary() (containerDomain.ContainerSummary, error) {
	return a.containerService.GetSummary()
}

func (a *App) UpdateContainer(id uint, input container.CreateContainerInput) error {
	return a.containerService.UpdateContainer(id, input)
}

func (a *App) DeleteContainers(ids []uint) error {
	return a.containerService.DeleteContainers(ids)
}
