import { TagProps } from "antd"

export const getTransactionTypeColor = (
  type: string
): TagProps['color'] => {
  switch (type.toLowerCase()) {
    case 'income':
      return 'green'
    case 'expense':
      return 'red'
  }
}