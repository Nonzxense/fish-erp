package main

import (
	"fish/internal/domain"
	"fish/internal/service/transaction"
	"time"
)

func (a *App) CreateTransaction(input transaction.CreateTransactionInput) error {
	return a.transactionService.CreateTransaction(input)
}

func (a *App) GetTransactions(filter *domain.TransactionFilter) ([]domain.Transaction, error) {
	return a.transactionService.GetTransactions(filter)
}

func (a *App) GetTransactionSummary(fromDate *time.Time, toDate *time.Time) (domain.TransactionSummary, error) {
	return a.transactionService.GetTransactionSummary(fromDate, toDate)
}

func (a *App) UpdateTransaction(id string, transaction transaction.CreateTransactionInput) error {
	return a.transactionService.UpdateTransaction(id, transaction)
}

func (a *App) DeleteTransactions(ids []string) error {
	return a.transactionService.DeleteTransactions(ids)
}
