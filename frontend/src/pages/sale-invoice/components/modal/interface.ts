export interface SaleInvoiceFormModalProps {
  isOpen: boolean
  onClose: () => void
  onChange: () => Promise<void>
}

export type SaleInvoiceFormValues = {

}

export interface Fish {
  name: string
  weight: number
  price: number
}