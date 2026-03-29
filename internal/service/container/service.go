package container

import (
	"fish/internal/domain"
	containerDomain "fish/internal/domain/container"
	"fish/internal/repository"
)

type ContainerService struct {
	repo *repository.ContainerRepository
}

func NewContainerService(repo *repository.ContainerRepository) *ContainerService {
	return &ContainerService{repo: repo}
}

func (s *ContainerService) CreateContainer(input CreateContainerInput) error {
	container := &containerDomain.Container{
		ID:     input.ID,
		Color:  input.Color,
		Type:   input.Type,
		Status: input.Status,
	}
	return s.repo.CreateContainer(container)
}

func (s *ContainerService) GetContainers(filter *containerDomain.ContainerFilter) (domain.PageResult[containerDomain.Container], error) {
	containers, total, err := s.repo.FindAll(filter)

	pageResult := domain.PageResult[containerDomain.Container]{
		Data:  containers,
		Total: total,
	}

	return pageResult, err
}

func (s *ContainerService) GetContainerSummary() (containerDomain.ContainerSummary, error) {
	return s.repo.FindSummary()
}

func (s *ContainerService) UpdateContainer(id int, input CreateContainerInput) error {
	container := &containerDomain.Container{
		ID:     id,
		Color:  input.Color,
		Type:   input.Type,
		Status: input.Status,
	}
	return s.repo.UpdateContainer(id, container)
}

func (s *ContainerService) DeleteContainers(ids []int) error {
	return s.repo.DeleteContainers(ids)
}
