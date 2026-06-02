import { dto } from "../../../../../wailsjs/go/models"

export interface ContainerFormModalProp {
  isOpen: boolean
  onClose: () => void
  onChange: () => Promise<void>
  container?: dto.ContainerListDTO | null
}

export type ContainerFormValues = {
  containerNo: number
  name: string
  type: string
  color: string
  status?: string
}