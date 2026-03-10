package main

import (
	"fish/internal/domain"
	"fish/internal/service/transaction"
)

func (a *App) CreateTransaction(input transaction.CreateTransactionInput) error {
	return a.transactionService.CreateTransaction(input)
}

func (a *App) GetTransactions(filter *domain.TransactionFilter) ([]domain.Transaction, error) {
	return a.transactionService.GetTransactions(filter)
}

func (a *App) GetTransactionSummary() (domain.TransactionSummary, error) {
	return a.transactionService.GetTransactionSummary()
}