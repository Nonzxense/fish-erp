package repository

import (
	domain "fish/internal/domain/container"
	"fish/internal/dto"
	"slices"
	"strings"
	"time"

	"gorm.io/gorm"
)

type containerWithCustomerRow struct {
	ContainerID   uint
	ContainerName string
	ContainerNo   uint
	Color         string
	Type          string
	Status        *string

	CustomerID   string
	CustomerName string
	AssignedAt   time.Time
}

type ContainerRepository struct {
	db *gorm.DB
}

func NewContainerRepository(db *gorm.DB) *ContainerRepository {
	return &ContainerRepository{db: db}
}

func (r *ContainerRepository) CreateContainer(container *domain.Container) error {
	return r.db.Create(container).Error
}

func (r *ContainerRepository) List(filter *domain.ContainerFilter) ([]domain.Container, int64, error) {
	var containers []domain.Container
	var total int64

	query := r.db.Model(&domain.Container{})

	if filter != nil {
		if filter.Name != nil {
			query = query.Where("name LIKE ?", "%"+*filter.Name+"%")
		}

		if filter.ContainerNo != nil {
			query = query.Where("container_no = ?", *filter.ContainerNo)
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

func (r *ContainerRepository) ListAtStore() ([]dto.ContainerListDTO, error) {
	var containers []dto.ContainerListDTO

	if err := r.db.Model(&domain.Container{}).
		Where("current_customer_id IS NULL").
		Find(&containers).Error; err != nil {
		return nil, err
	}

	return containers, nil
}

func (r *ContainerRepository) ListAtCustomer() ([]dto.CustomerWithContainerDTO, error) {
	var rows []containerWithCustomerRow

	if err := r.db.
		Table("containers c").
		Select(`
			c.id as container_id,
			c.name as container_name,
			c.container_no,
			c.color,
			c.type,
			c.assigned_at,
			p.id as customer_id,
			p.name as customer_name
		`).
		Joins("JOIN parties p ON p.id = c.current_customer_id").
		Scan(&rows).Error; err != nil {
		return nil, err
	}

	customerMap := make(map[string]*dto.CustomerWithContainerDTO)

	for _, row := range rows {
		customer, exists := customerMap[row.CustomerID]
		if !exists {
			customer = &dto.CustomerWithContainerDTO{
				ID:         row.CustomerID,
				Name:       row.CustomerName,
				Containers: []dto.ContainerAtCustomerDTO{},
			}
			customerMap[row.CustomerID] = customer
		}

		customer.Containers = append(customer.Containers, dto.ContainerAtCustomerDTO{
			ID:          row.ContainerID,
			Name:        row.ContainerName,
			ContainerNo: row.ContainerNo,
			Color:       row.Color,
			Type:        row.Type,
			AssignedAt:  &row.AssignedAt,
		})
	}

	customers := make([]dto.CustomerWithContainerDTO, 0, len(customerMap))

	for _, customer := range customerMap {
		customers = append(customers, *customer)
	}

	slices.SortFunc(customers, func(a, b dto.CustomerWithContainerDTO) int {
		return strings.Compare(b.Name, a.Name)
	})

	return customers, nil
}

func (r *ContainerRepository) GetSummary() (domain.ContainerSummary, error) {
	var summary domain.ContainerSummary
	query := r.db.Model(&domain.Container{})

	err := query.
		Select(`
			COUNT(*) as total,
			COUNT(CASE WHEN current_customer_id IS NULL THEN 1 END) AS at_store,
			COUNT(CASE WHEN current_customer_id IS NOT NULL THEN 1 END) AS with_customer
		`).
		Scan(&summary).Error

	return summary, err
}

func (r *ContainerRepository) UpdateContainer(id uint, container *domain.Container) error {
	return r.db.
		Model(&domain.Container{}).
		Where("id = ?", id).
		Updates(container).Error
}

func (r *ContainerRepository) UpdateContainerStatus(id uint, status string) error {
	return r.db.
		Model(&domain.Container{}).
		Where("id = ?", id).
		Update("status", status).Error
}

func (r *ContainerRepository) DeleteContainers(ids []uint) error {
	return r.db.
		Where("id IN ?", ids).
		Delete(&domain.Container{}).Error
}
