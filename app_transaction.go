package main

import (
	"fish/internal/domain"
	"fish/internal/service/transaction"
)

func (a *App) CreateTransaction(input transaction.CreateTransactionInput) error {
	return a.transactionService.CreateTransaction(input)
}

func (a *App) GetTransactions() ([]domain.Transaction, error) {
	return a.transactionService.GetTransactions()
}
