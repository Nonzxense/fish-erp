import { container } from "../../../../../wailsjs/go/models"

export interface ContainerFormModalProp {
  isOpen: boolean
  onClose: () => void
  onChange: () => Promise<void>
  container?: container.Container | null
}

export type ContainerFormValues = {
  containerNo: number
  name: string
  type: string
  color: string
  status?: string
}