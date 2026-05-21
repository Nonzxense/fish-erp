package main

import (
	"fish/internal/domain"
	paymentDomain "fish/internal/domain/payment"
	"fish/internal/service/payment"
)

func (a *App) AllocatePaymentFIFO(input payment.PaymentInput) error {
	return a.paymentService.AllocatePaymentFIFO(input)
}

func (a *App) GetPaymentsByPartyID(partyID string) (domain.PageResult[paymentDomain.Payment], error) {
	return a.paymentService.GetPaymentsByPartyID(partyID)
}
