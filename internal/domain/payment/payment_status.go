package payment

import (
	"fish/internal/domain/common"
)

func GetPaymentStatus(totalAmount, paidAmount common.Money) string {
	remainingAmount := totalAmount - paidAmount
	if remainingAmount <= 0 {
		return PaymentPaid
	} else if remainingAmount == totalAmount {
		return PaymentPending
	} else {
		return PaymentPartial
	}
}
