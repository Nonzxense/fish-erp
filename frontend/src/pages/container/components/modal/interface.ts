import { container } from "../../../../../wailsjs/go/models"

export interface ContainerFormModalProp {
  isOpen: boolean
  onClose: () => void
  onChange: () => Promise<void>
  container?: container.Container | null
}

export type ContainerFormValues = {
  id: number
  type: string
  color: string
  status?: string
}