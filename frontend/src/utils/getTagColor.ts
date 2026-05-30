import { TagProps } from "antd"
import { PAYMENT_CANCELLED, PAYMENT_IN, PAYMENT_OUT, PAYMENT_PAID, PAYMENT_PARTIAL, PAYMENT_PENDING } from "./constants"

export const getTransactionTypeColor = (
  type?: string
): TagProps['color'] => {
  if (!type) return 'default'

  switch (type.toLowerCase()) {
    case 'income':
      return 'success'
    case 'expense':
      return 'error'
    default:
      return 'default'
  }
}

export const getPaidStatusColor = (
  status?: string
): TagProps['color'] => {
  if (!status) return 'default'

  switch (status.toLowerCase()) {
    case PAYMENT_PAID:
      return 'success'
    case PAYMENT_PENDING:
      return 'warning'
    case PAYMENT_PARTIAL:
      return 'processing'
    case PAYMENT_CANCELLED:
      return 'error'
    default:
      return 'default'
  }
}

export const getPaymentDirectionType = (
  direction: string
): 'success' | 'danger' | 'secondary' => {
  switch (direction) {
    case PAYMENT_IN:
      return 'success'
    case PAYMENT_OUT:
      return 'danger'
    default:
      return 'secondary'
  }
}