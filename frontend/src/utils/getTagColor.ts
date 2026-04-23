import { TagProps } from "antd"

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
    case 'paid':
      return 'success'
    case 'pending':
      return 'warning'
    default:
      return 'default'
  }
}