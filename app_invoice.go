package main

import (
	"fish/internal/service/invoice"
)

func (a *App) CreateFishTradeInvoice(input invoice.CreateFishTradeInvoiceInput) error {
	return a.invoiceService.CreateFishTradeInvoice(input)
}