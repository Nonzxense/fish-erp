package main

import (
	"fish/internal/domain"
	"fish/internal/service/container"
)

func (a *App) CreateContainer(input container.CreateContainerInput) error {
	return a.containerService.CreateContainer(input)
}

func (a *App) GetContainers() (domain.PageResult[domain.Container], error) {
	return a.containerService.GetContainers()
}
