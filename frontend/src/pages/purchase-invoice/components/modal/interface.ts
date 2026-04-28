import { invoice } from "../../../../../wailsjs/go/models"

export interface PurchaseInvoiceFormModalProps {
  isOpen: boolean
  onClose: () => void
  onChange: () => Promise<void>
  purchaseInvoice?: invoice.FishPurchaseInvoice
}