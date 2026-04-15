package main

import (
	"fish/internal/domain"
	invoiceDomain "fish/internal/domain/invoice"
	"fish/internal/service/invoice"
)

func (a *App) CreateFishTradeInvoice(input invoice.CreateFishTradeInvoiceInput) error {
	return a.invoiceService.CreateFishTradeInvoice(input)
}

func (a *App) GetFishTradeInvoices(filter *invoiceDomain.InvoiceFilter) (domain.PageResult[invoiceDomain.FishTradeInvoice], error) {
	return a.invoiceService.GetFishTradeInvoices(filter)
}
