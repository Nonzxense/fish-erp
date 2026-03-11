import { Dayjs } from "dayjs"

export interface Transaction {
  id: string
  billId?: string
  type: 'income' | 'expense'
  category?: string
  amount: number
  occurredAt: Dayjs
  note?: string
}

export interface TransactionFilter {
  type?: string
  category?: string
  fromDate?: string | null
  toDate?: string | null
  minAmount?: number
  maxAmount?: number
  convertValues?: () => TransactionFilter
}

export type TransactionFilterFormValues = {
  type?: string
  category?: string
  occurredAt?: [Dayjs, Dayjs]
}
