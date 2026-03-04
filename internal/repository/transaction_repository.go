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

func (r *TransactionRepository) FindAll() ([]domain.Transaction, error) {
	var transactions []domain.Transaction
	err := r.db.
		Order("occurred_at DESC").
		Find(&transactions).Error

	return transactions, err
}
