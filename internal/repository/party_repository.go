package repository

import (
	domain "fish/internal/domain/party"

	"gorm.io/gorm"
)

type PartyRepository struct {
	db *gorm.DB
}

func NewPartyRepository(db *gorm.DB) *PartyRepository {
	return &PartyRepository{db: db}
}

func (r *PartyRepository) CreateParty(party *domain.Party) error {
	return r.db.Create(party).Error
}

func (r *PartyRepository) UpdateParty(id int, party *domain.Party) error {
	return r.db.
		Model(&domain.Party{}).
		Where("id = ?", id).
		Updates(party).Error
}

func (r *PartyRepository) DeleteParties(ids []int) error {
	return r.db.
		Where("id IN ?", ids).
		Delete(&domain.Party{}).Error
}

func (r *PartyRepository) FindAll(filter *domain.PartyFilter) ([]domain.Party, int64, error) {
	var parties []domain.Party
	var total int64

	query := r.db.Model(&domain.Party{})

	if filter != nil {
		if filter.Name != nil {
			query = query.Where("name LIKE ?", "%"+*filter.Name+"%")
		}
		if filter.Phone != nil {
			query = query.Where("phone LIKE ?", "%"+*filter.Phone+"%")
		}
		if filter.Type != nil {
			query = query.Where("type = ?", filter.Type)
		}
	}
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Handle Pagination
	if filter.Page > 0 && filter.PageSize > 0 {
		offset := (filter.Page - 1) * filter.PageSize
		query = query.Offset(offset).Limit(filter.PageSize)
	}

	err := query.Find(&parties).Error

	return parties, total, err
}

func (r *PartyRepository) FindOne(id string) (domain.Party, error) {
	var party domain.Party
	err := r.db.Where("id = ?", id).First(&party).Error
	return party, err
}
