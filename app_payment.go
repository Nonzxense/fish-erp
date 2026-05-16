package main

import "fish/internal/service/payment"

func (a *App) AllocatePaymentFIFO(input payment.PaymentInput) error {
	return a.paymentService.AllocatePaymentFIFO(input)
}
