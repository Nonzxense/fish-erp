package transaction

import (
	"fish/internal/domain"
	"fish/internal/repository"
	"time"

	"github.com/google/uuid"
)

type TransactionService struct {
	repo *repository.TransactionRepository
}

func NewTransactionService(repo *repository.TransactionRepository) *TransactionService {
	return &TransactionService{repo: repo}
}

func (s *TransactionService) CreateTransaction(input CreateTransactionInput) error {
	tx := &domain.Transaction{
		ID:         uuid.NewString(),
		Type:       input.Type,
		Amount:     (input.Amount),
		Category:   input.Category,
		OccurredAt: input.OccurredAt,
		Note:       input.Note,
	}

	return s.repo.Create(tx)
}

func (s *TransactionService) GetTransactions(filter *domain.TransactionFilter) ([]domain.Transaction, error) {
	return s.repo.FindAll(filter)
}

func (s *TransactionService) GetTransactionSummary(fromDate *time.Time, toDate *time.Time) (domain.TransactionSummary, error) {
	return s.repo.FindSummary(fromDate, toDate)
}
