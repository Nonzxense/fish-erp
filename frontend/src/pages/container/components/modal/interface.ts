import { domain } from "../../../../../wailsjs/go/models"

export interface ContainerFormModalProp {
  isOpen: boolean
  onClose: () => void
  onChange: () => Promise<void>
  container?: domain.Container | null
}

export type ContainerFormValues = {
  id: number
  type: string
  color: string
  status?: string
}