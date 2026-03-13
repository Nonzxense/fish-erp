package repository

import (
	"fish/internal/domain"

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

func (r *ContainerRepository) FindAll() ([]domain.Container, int64, error) {
	var container []domain.Container
	var total int64

	query := r.db.Model(&domain.Container{})

	// if filter != nil {
	// 	if filter.Type != nil {
	// 		query = query.Where("type = ?", *filter.Type)
	// 	}

	// 	if filter.Category != nil {
	// 		query = query.Where("category = ?", *filter.Category)
	// 	}

	// 	if filter.FromDate != nil {
	// 		query = query.Where("occurred_at >= ?", *filter.FromDate)
	// 	}

	// 	if filter.ToDate != nil {
	// 		query = query.Where("occurred_at <= ?", *filter.ToDate)
	// 	}

	// 	if filter.MinAmount != nil {
	// 		query = query.Where("amount >= ?", *filter.MinAmount)
	// 	}

	// 	if filter.MaxAmount != nil {
	// 		query = query.Where("amount <= ?", *filter.MaxAmount)
	// 	}
	// }

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// if filter.Page > 0 && filter.PageSize > 0 {
	// 	offset := (filter.Page - 1) * filter.PageSize
	// 	query = query.Offset(offset).Limit(filter.PageSize)
	// }

	err := query.
		Find(&container).
		Error

	return container, total, err
}
