package main

import (
	"fish/internal/domain"
	truckInvoiceDomain "fish/internal/domain/truck_invoice"
	truckinvoice "fish/internal/service/truck_invoice"
)

func (a *App) CreateTruckInvoice(input truckinvoice.CreateTruckInvoiceInput) error {
	return a.truckInvoiceService.Create(input)
}

func (a *App) GetTruckInvoices(filter truckInvoiceDomain.TruckInvoiceFilter) (domain.PageResult[truckInvoiceDomain.TruckInvoice], error) {
	return a.truckInvoiceService.GetTruckInvoices(filter)
}

func (a *App) GetTruckInvoice(id string) (truckInvoiceDomain.TruckInvoice, error) {
	return a.truckInvoiceService.GetTruckInvoice(id)
}
