import { Dayjs } from "dayjs"

export interface TransactionFilter {
  type?: string
  category?: string
  fromDate?: string | null
  toDate?: string | null
  minAmount?: number
  maxAmount?: number

}

export type TransactionFilterFormValues = {
  type?: string
  category?: string
  occurredAt?: [Dayjs, Dayjs]
}
