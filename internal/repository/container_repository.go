package repository

import (
	domain "fish/internal/domain/container"

	"gorm.io/gorm"
)

type ContainerRepository struct {
	db *gorm.DB
}

func NewContainerRepository(db *gorm.DB) *ContainerRepository {
	return &ContainerRepository{db: db}
}

func (r *ContainerRepository) CreateContainer(container *domain.Container) error {
	return r.db.Create(container).Error
}

func (r *ContainerRepository) FindAll(filter *domain.ContainerFilter) ([]domain.Container, int64, error) {
	var containers []domain.Container
	var total int64

	query := r.db.Model(&domain.Container{})

	if filter != nil {
		if filter.ID != nil {
			query = query.Where("id = ?", *filter.ID)
		}

		if filter.Type != nil {
			query = query.Where("type = ?", *filter.Type)
		}

		if filter.Color != nil {
			query = query.Where("color = ?", *filter.Color)
		}

		if filter.Status != nil {
			query = query.Where("status = ?", *filter.Status)
		}
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if filter.Page > 0 && filter.PageSize > 0 {
		offset := (filter.Page - 1) * filter.PageSize
		query = query.Offset(offset).Limit(filter.PageSize)
	}

	err := query.
		Find(&containers).
		Error

	return containers, total, err
}

func (r *ContainerRepository) FindSummary() (domain.ContainerSummary, error) {
	var summary domain.ContainerSummary
	query := r.db.Model(&domain.Container{})

	err := query.
		Select(`
			COUNT(*) as total,
			COUNT(CASE WHEN status = 'at_store' THEN 0 END) as at_store,
			COUNT(CASE WHEN status = 'with_customer' THEN 0 END) as with_customer
		`).
		Scan(&summary).Error

	return summary, err
}

func (r *ContainerRepository) UpdateContainer(id int, container *domain.Container) error {
	return r.db.
		Model(&domain.Container{}).
		Where("id = ?", id).
		Updates(container).Error
}

func (r *ContainerRepository) DeleteContainers(ids []int) error {
	return r.db.
		Where("id IN ?", ids).
		Delete(&domain.Container{}).Error
}
