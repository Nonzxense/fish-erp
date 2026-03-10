package repository

import (
	"fish/internal/domain"
	"gorm.io/gorm"
)

type TransactionRepository struct {
	db *gorm.DB
}

func NewTransactionRepository(db *gorm.DB) *TransactionRepository {
	return &TransactionRepository{db: db}
}

func (r *TransactionRepository) Create(tx *domain.Transaction) error {
	return r.db.Create(tx).Error
}

func (r *TransactionRepository) FindAll(filter *domain.TransactionFilter) ([]domain.Transaction, error) {
	var transactions []domain.Transaction
	query := r.db.Model(&domain.Transaction{})

	if filter != nil {
		if filter.Type != nil {
			query = query.Where("type = ?", *filter.Type)
		}

		if filter.Category != nil {
			query = query.Where("category = ?", *filter.Category)
		}

		if filter.FromDate != nil {
			query = query.Where("occurred_at >= ?", *filter.FromDate)
		}

		if filter.ToDate != nil {
			query = query.Where("occurred_at <= ?", *filter.ToDate)
		}

		if filter.MinAmount != nil {
			query = query.Where("amount >= ?", *filter.MinAmount)
		}

		if filter.MaxAmount != nil {
			query = query.Where("amount <= ?", *filter.MaxAmount)
		}
	}

	err := query.
		Order("occurred_at DESC").
		Find(&transactions).Error

	return transactions, err
}

func (r *TransactionRepository) FindSummary() (domain.TransactionSummary, error) {
	var summary domain.TransactionSummary

	err := r.db.Model(&domain.Transaction{}).
		Select(`
			COALESCE(SUM(CASE WHEN type = 'income' THEN amount END), 0) AS total_income,
			COALESCE(SUM(CASE WHEN type = 'expense' THEN amount END), 0) AS total_expense
		`).
		Scan(&summary).Error

	summary.Profit = summary.TotalIncome - summary.TotalExpense

	return summary, err
}
