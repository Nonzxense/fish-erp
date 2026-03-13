package container

import (
	"fish/internal/domain"
	"fish/internal/repository"
)

type ContainerService struct {
	repo *repository.ContainerRepository
}

func NewContainerService(repo *repository.ContainerRepository) *ContainerService {
	return &ContainerService{repo: repo}
}

func (s *ContainerService) CreateContainer(input CreateContainerInput) error {
	container := &domain.Container{
		ID:     input.ID,
		Color:  input.Color,
		Type:   input.Type,
		Status: input.Status,
	}
	return s.repo.CreateContainer(container)
}

func (s *ContainerService) GetContainers() (domain.PageResult[domain.Container], error) {
	tx, total, err := s.repo.FindAll()

	pageResult := domain.PageResult[domain.Container]{
		Data:  tx,
		Total: total,
	}

	return pageResult, err
}
