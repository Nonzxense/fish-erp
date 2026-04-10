import { Dayjs } from "dayjs"
import { transaction } from "../../../../../wailsjs/go/models"

export interface TransactionFormModalProp {
  isOpen: boolean
  onClose: () => void
  onChange: () => Promise<void>
  transaction?: transaction.Transaction | null
}

export type TransactionFormValues = {
  occurredAt: Dayjs
  type: string
  amount: number
  category?: string
  note?: string
}