import { PAYMENT_PAID, PAYMENT_PARTIAL, PAYMENT_PENDING } from "./constants"

export const getPaymentStatus = (totalAmount: number, paidAmount: number): string => {
  const remainingAmount = totalAmount - paidAmount
  if (remainingAmount <= 0) {
    return PAYMENT_PAID
  }
  else
    if (remainingAmount === totalAmount) {
      return PAYMENT_PENDING
    } else
      return PAYMENT_PARTIAL
} 