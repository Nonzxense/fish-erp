import { Dayjs } from "dayjs"
import { party } from "../../../../../wailsjs/go/models"

export interface PartyFormModalProp {
  isOpen: boolean
  onClose: () => void
  onChange: () => Promise<void>
  party?: party.Party | null
}

export type PartyFormValues = {
  name: string
  note?: string
  phone?: string
}

export interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  party?: party.PartyWithDebt
}

export interface PaymentFormValues {
  amount: number
  paymentDate: Dayjs
  method: string
  note?: string
}