package main

import (
	"fish/internal/domain"
	invoiceDomain "fish/internal/domain/invoice"
	"fish/internal/service/invoice"
)

func (a *App) CreateFishSaleInvoice(input invoice.CreateFishSaleInvoiceInput) error {
	return a.invoiceService.CreateFishSaleInvoice(input)
}

func (a *App) GetFishSaleInvoices(filter *invoiceDomain.InvoiceFilter) (domain.PageResult[invoiceDomain.FishSaleInvoice], error) {
	return a.invoiceService.GetFishSaleInvoices(filter)
}

func (a *App) UpdateFishSaleInvoice(id string, input invoice.CreateFishSaleInvoiceInput) error {
	return a.invoiceService.UpdateFishSaleInvoice(id, input)
}

func (a *App) DeleteFishSaleInvoices(ids []string) error {
	return a.invoiceService.DeleteFishSaleInvoices(ids)
}