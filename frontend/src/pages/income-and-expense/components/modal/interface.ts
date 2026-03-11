import { Dayjs } from "dayjs"
import { domain } from "../../../../../wailsjs/go/models"

export interface TransactionFormModalProp {
  isOpen: boolean
  onClose: () => void
  onChange: () => Promise<void>
  transaction?: domain.Transaction | null
}

export type TransactionFormValues = {
  occurredAt: Dayjs
  type: string
  amount: number
  category?: string
  note?: string
}