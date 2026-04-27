import { Dayjs } from "dayjs"
import { invoice } from "../../../../../wailsjs/go/models"

export interface SaleInvoiceFormModalProps {
  isOpen: boolean
  onClose: () => void
  onChange: () => Promise<void>
  saleInvoice?: invoice.FishSaleInvoice
}

export interface SaleInvoiceViewProps {
  isOpen: boolean
  onClose: () => void
  saleInvoice?: invoice.FishSaleInvoice
}

export type FishRow = {
  key: string
  type: 'fish'
  name: string
  weightKg: number
  pricePerKg: number
  amount: number
}

export type HeaderRow = {
  key: string
  type: 'header'
  containerId: number
}

export type RowData = HeaderRow | FishRow

export type SaleInvoiceFormValues = {
  createdAt: Dayjs
  type: string
  status: string
  note?: string
  customerId: string
  newCustomerName?: string
  containers: FishContainerFormValues[]
}

export type FishContainerFormValues = {
  containerId: number
  isNewContainer: boolean
  newContainerId?: number
  newContainerType?: string
  newContainerColor?: string
  fishes: Fish[]
}

export interface Fish {
  name: string
  weightKg: number
  pricePerKg: number
}