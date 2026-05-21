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

func (r *PartyRepository) FindAll(
	filter *domain.PartyFilter,
) ([]domain.PartyWithDebt, int64, error) {

	var parties []domain.PartyWithDebt
	var total int64

	fsiSubQuery := r.db.
		Table("fish_sale_invoices").
		Select(`
			customer_id,
			SUM(total_amount - paid_amount) as total_debt
		`).
		Where("paid_amount < total_amount").
		Group("customer_id")

	shiSubQuery := r.db.
		Table("shipping_invoices").
		Select(`
			customer_id,
			SUM(total_amount - paid_amount) as total_debt
		`).
		Where("paid_amount < total_amount").
		Group("customer_id")

	query := r.db.
		Table("parties").
		Select(`
			parties.id,
			parties.name,
			parties.phone,
			parties.note,
			COALESCE(fsi.total_debt, 0) +
			COALESCE(shi.total_debt, 0) as total_debt
		`).
		Joins(`
			LEFT JOIN (?) fsi
			ON parties.id = fsi.customer_id
		`, fsiSubQuery).
		Joins(`
			LEFT JOIN (?) shi
			ON parties.id = shi.customer_id
		`, shiSubQuery)

	if filter != nil {
		if filter.Name != nil {
			query = query.Where(
				"parties.name LIKE ?",
				"%"+*filter.Name+"%",
			)
		}

		if filter.Phone != nil {
			query = query.Where(
				"parties.phone LIKE ?",
				"%"+*filter.Phone+"%",
			)
		}

		if filter.Type != nil {
			query = query.Where(
				"parties.type = ?",
				*filter.Type,
			)
		}
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if filter.Page > 0 && filter.PageSize > 0 {
		offset := (filter.Page - 1) * filter.PageSize
		query = query.Offset(offset).Limit(filter.PageSize)
	}

	err := query.Scan(&parties).Error

	return parties, total, err
}

func (r *PartyRepository) GetByID(id string) (domain.Party, error) {
	var party domain.Party
	err := r.db.Model(&domain.Party{}).
		Where("id = ?", id).
		First(&party).Error

	if err != nil {
		return domain.Party{}, err
	}

	return party, nil
}

func (r *PartyRepository) GetByIDWithDebt(id string) (domain.PartyWithDebt, error) {
	var party domain.PartyWithDebt

	fsiSubQuery := r.db.
		Table("fish_sale_invoices").
		Select(`
			customer_id,
			SUM(total_amount - paid_amount) as total_debt
		`).
		Where("paid_amount < total_amount").
		Group("customer_id")

	shiSubQuery := r.db.
		Table("shipping_invoices").
		Select(`
			customer_id,
			SUM(total_amount - paid_amount) as total_debt
		`).
		Where("paid_amount < total_amount").
		Group("customer_id")

	query := r.db.
		Table("parties").
		Select(`
			parties.id,
			parties.name,
			parties.phone,
			parties.note,
			COALESCE(fsi.total_debt, 0) +
			COALESCE(shi.total_debt, 0) as total_debt
		`).
		Joins(`
			LEFT JOIN (?) fsi
			ON parties.id = fsi.customer_id
		`, fsiSubQuery).
		Joins(`
			LEFT JOIN (?) shi
			ON parties.id = shi.customer_id
		`, shiSubQuery)

	err := query.
		Where("id = ?", id).
		First(&party).Error

	if err != nil {
		return domain.PartyWithDebt{}, err
	}

	return party, nil
}
