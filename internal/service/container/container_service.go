package container

import (
	"fish/internal/domain"
	containerDomain "fish/internal/domain/container"
	"fish/internal/dto"
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
		ContainerNo: input.ContainerNo,
		Name:        input.Name,
		Color:       input.Color,
		Type:        input.Type,
		Status:      input.Status,
	}
	return s.repo.CreateContainer(container)
}

func (s *ContainerService) List(filter *containerDomain.ContainerFilter) (domain.PageResult[containerDomain.Container], error) {
	containers, total, err := s.repo.List(filter)

	pageResult := domain.PageResult[containerDomain.Container]{
		Data:  containers,
		Total: total,
	}

	return pageResult, err
}

func (s *ContainerService) ListAtStore() ([]dto.ContainerListDTO, error) {
	return s.repo.ListAtStore()
}

func (s *ContainerService) ListAtCustomer() ([]dto.CustomerWithContainerDTO, error) {
	return s.repo.ListAtCustomer()
}

func (s *ContainerService) GetSummary() (containerDomain.ContainerSummary, error) {
	return s.repo.GetSummary()
}

func (s *ContainerService) UpdateContainer(id uint, input CreateContainerInput) error {
	container := &containerDomain.Container{
		ContainerNo: input.ContainerNo,
		Name:        input.Name,
		Color:       input.Color,
		Type:        input.Type,
		Status:      input.Status,
	}
	return s.repo.UpdateContainer(id, container)
}

func (s *ContainerService) DeleteContainers(ids []uint) error {
	return s.repo.DeleteContainers(ids)
}
