import { Dayjs } from "dayjs"
import {
  party as partyModel
} from "../../../wailsjs/go/models"

export interface PayableInvoice {
  id: string
  refType: string
  remainingAmount: number
}


export interface InvoicePaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  invoice: PayableInvoice
  party: partyModel.PartyWithDebt
}

export interface InvoicePaymentFormValues {
  amount: number
  paymentDate: Dayjs
  method: string
  note?: string
}