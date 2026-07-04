import { Dayjs } from "dayjs";

export interface TruckInvoiceFormModalProps {
  isOpen: boolean
  onClose: () => void
  onChange: () => Promise<void>
  id?: string
}

export type TruckInvoiceFormValues = {
  occurredAt: Dayjs
  type: string
  status: string
  note?: string
  carPlate: string
  driverName: string
  driverWage: number
  helpers: HelperWage[]
  otherExpenses: OtherExpense[]
  shippingInvoices: ShippingInvoice[]
}

export type HelperWage = {
  name: string
  amount: number
}

export type OtherExpense = {
  description: string
  amount: number
}

export type Item = {
  qty: number
  price: number
}

export type ShippingInvoice = {
  customerId: string

  'foam-l': Item
  'foam-m': Item
  'foam-s': Item
  'plastic-l': Item
  'plastic-s': Item

  status: string

  totalAmount: number
}
