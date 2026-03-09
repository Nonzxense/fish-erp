package main

import (
	"fish/internal/domain"
	"fish/internal/service/transaction"
	"fmt"
)

func (a *App) CreateTransaction(input transaction.CreateTransactionInput) error {
	return a.transactionService.CreateTransaction(input)
}

func (a *App) GetTransactions(filter *domain.TransactionFilter) ([]domain.Transaction, error) {
	fmt.Println(filter)
	return a.transactionService.GetTransactions(filter)
}