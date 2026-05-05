import { Dayjs } from "dayjs";
import { truckinvoice } from "../../../../../wailsjs/go/models";

export interface TruckInvoiceFormModalProps {
  isOpen: boolean
  onClose: () => void
  onChange: () => Promise<void>
  truckInvoice?: truckinvoice.TruckInvoice
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
  customers: CustomerContainer[]
}

export type HelperWage = {
  name: string
  wage: number
}

export type OtherExpense = {
  description: string
  amount: number
}

export type Item = {
  qty: number
  price: number
}

export type CustomerContainer = {
  customerId: string

  big: Item
  small: Item
  foamBig: Item
  foamMid: Item
  foamSmall: Item

  status: string
}
