import { Dayjs } from "dayjs"

export interface Transaction {
  id: string
  billId?: string
  type: 'income' | 'expense'
  category?: string
  amount: number
  occuredAt: Dayjs
  note?: string
}
