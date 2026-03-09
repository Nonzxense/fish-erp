import { Dayjs } from "dayjs"
import { Dispatch, SetStateAction } from "react"

export interface TransactionFormModalProp {
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
  onChange: () => Promise<void>
}

export type TransactionFormValues = {
  occurredAt: Dayjs
  type: string
  amount: number
  category?: string
  note?: string
}