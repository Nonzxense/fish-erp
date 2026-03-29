package main

import (
	"fish/internal/domain"
	containerDomain "fish/internal/domain/container"
	"fish/internal/service/container"
)

func (a *App) CreateContainer(input container.CreateContainerInput) error {
	return a.containerService.CreateContainer(input)
}

func (a *App) GetContainers(filter *containerDomain.ContainerFilter) (domain.PageResult[containerDomain.Container], error) {
	return a.containerService.GetContainers(filter)
}

func (a *App) GetContainerSummary() (containerDomain.ContainerSummary, error) {
	return a.containerService.GetContainerSummary()
}

func (a *App) UpdateContainer(id int, input container.CreateContainerInput) error {
	return a.containerService.UpdateContainer(id, input)
}

func (a *App) DeleteContainers(ids []int) error {
	return a.containerService.DeleteContainers(ids)
}
