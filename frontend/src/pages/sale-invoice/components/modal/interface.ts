export interface SaleInvoiceFormModalProps {
  isOpen: boolean
  onClose: () => void
  onChange: () => Promise<void>
}

export type SaleInvoiceFormValues = {
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