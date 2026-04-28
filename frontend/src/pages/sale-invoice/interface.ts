import { Dayjs } from "dayjs"

export interface InvoiceFilter {
  id?: string
  customerName?: string
  status?: string
  fromDate?: string | null
  toDate?: string | null
}

export type InvoiceFilterFormValues = {
  id?: string
  customerName?: string
  dateRange?: [Dayjs, Dayjs]
}
