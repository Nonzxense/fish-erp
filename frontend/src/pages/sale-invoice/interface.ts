import { Dayjs } from "dayjs"

export interface InvoiceFilter {
  id?: string
  partyName?: string
  status?: string
  fromDate?: string | null
  toDate?: string | null
}

export type InvoiceFilterFormValues = {
  id?: string
  partyName?: string
  dateRange?: [Dayjs, Dayjs]
}
