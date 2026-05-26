package main

import (
	"fish/internal/domain"
	paymentDomain "fish/internal/domain/payment"
	"fish/internal/dto"
)

func (a *App) AllocatePaymentFIFO(input dto.PaymentInput) error {
	return a.paymentService.AllocatePaymentFIFO(input)
}

func (a *App) PayInvoice(input dto.PayInvoiceInput) error {
	return a.paymentService.PayInvoice(input)
}

func (a *App) GetPaymentsByPartyID(partyID string) (domain.PageResult[paymentDomain.Payment], error) {
	return a.paymentService.GetPaymentsByPartyID(partyID)
}

func (a *App) RollbackPayment(paymentID uint) error {
	return a.paymentService.RollbackPayment(paymentID)
}
