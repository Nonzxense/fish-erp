package main

import (
	"fish/internal/domain"
	truckInvoiceDomain "fish/internal/domain/truck_invoice"
	truckinvoice "fish/internal/service/truck_invoice"
)

func (a *App) CreateTruckInvoice(input truckinvoice.CreateTruckInvoiceInput) error {
	return a.truckInvoiceService.Create(input)
}

func (a *App) UpdateTruckInvoice(id string, input truckinvoice.CreateTruckInvoiceInput) error {
	return a.truckInvoiceService.Update(id, input)
}

func (a *App) GetTruckInvoices(filter truckInvoiceDomain.TruckInvoiceFilter) (domain.PageResult[truckInvoiceDomain.TruckInvoice], error) {
	return a.truckInvoiceService.GetTruckInvoices(filter)
}

func (a *App) GetTruckInvoice(id string) (truckInvoiceDomain.TruckInvoice, error) {
	return a.truckInvoiceService.GetTruckInvoice(id)
}

func (a *App) GetShippingInvoicesByPartyID(partyID string) (domain.PageResult[truckInvoiceDomain.ShippingInvoice], error) {
	return a.truckInvoiceService.GetShippingInvoicesByPartyID(partyID)
}

func (a *App) GetSummary() (truckInvoiceDomain.TruckInvoiceSummary, error) {
	return a.truckInvoiceService.GetSummary()
}

func (a *App) GetShippingPrices() (truckInvoiceDomain.ShippingPrices, error) {
	return a.truckInvoiceService.GetShippingPrices()
}

func (a *App) UpdateShippingPrices(prices truckInvoiceDomain.ShippingPrices) error {
	return a.truckInvoiceService.UpdateShippingPrices(prices)
}
