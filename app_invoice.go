package main

import (
	"fish/internal/domain"
	invoiceDomain "fish/internal/domain/invoice"
	"fish/internal/service/invoice"
)

func (a *App) CreateFishSaleInvoice(input invoice.CreateFishSaleInvoiceInput) error {
	return a.invoiceService.CreateFishSaleInvoice(input)
}

func (a *App) CreateFishPurchaseInvoice(input invoice.CreateFishPurchaseInvoiceInput) error {
	return a.invoiceService.CreateFishPurchaseInvoice(input)
}

func (a *App) GetFishSaleInvoices(filter *invoiceDomain.InvoiceFilter) (domain.PageResult[invoiceDomain.FishSaleInvoice], error) {
	return a.invoiceService.GetFishSaleInvoices(filter)
}

func (a *App) GetFishPurchaseInvoices(filter *invoiceDomain.InvoiceFilter) (domain.PageResult[invoiceDomain.FishPurchaseInvoice], error) {
	return a.invoiceService.GetFishPurchaseInvoices(filter)
}

func (a *App) GetFishTradeInvoiceSummary(invoiceType string) (invoiceDomain.FishTradeInvoiceSummary, error) {
	return a.invoiceService.GetFishTradeInvoiceSummary(invoiceType)
}

func (a *App) UpdateFishSaleInvoice(id string, input invoice.CreateFishSaleInvoiceInput) error {
	return a.invoiceService.UpdateFishSaleInvoice(id, input)
}

func (a *App) UpdateFishPurchaseInvoice(id string, input invoice.CreateFishPurchaseInvoiceInput) error {
	return a.invoiceService.UpdateFishPurchaseInvoice(id, input)
}

func (a *App) ChangeInvoiceStatus(invoiceType string, id string, status string) error {
	return a.invoiceService.ChangeInvoiceStatus(invoiceType, id, status)
}

func (a *App) DeleteFishSaleInvoices(ids []string) error {
	return a.invoiceService.DeleteFishSaleInvoices(ids)
}
