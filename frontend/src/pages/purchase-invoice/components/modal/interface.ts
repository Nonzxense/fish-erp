import { Dayjs } from "dayjs"
import { invoice } from "../../../../../wailsjs/go/models"
import { Fish } from "../../../sale-invoice/components/modal/interface"

export interface PurchaseInvoiceFormModalProps {
  isOpen: boolean
  onClose: () => void
  onChange: () => Promise<void>
  purchaseInvoice?: invoice.FishPurchaseInvoice
}

export interface PurchaseInvoiceFormValues {
  createdAt: Dayjs
  type: string
  status: string
  note?: string
  supplierId: string
  newSupplierName?: string
  fishes: Fish[] 
}