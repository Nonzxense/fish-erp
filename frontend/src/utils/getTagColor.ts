import { TagProps } from "antd"

export const getTransactionTypeColor = (
  type?: string
): TagProps['color'] => {
  if (!type) return 'default'

  switch (type.toLowerCase()) {
    case 'income':
      return 'green'
    case 'expense':
      return 'red'
    default:
      return 'default'
  }
}