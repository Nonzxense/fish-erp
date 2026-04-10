import { party } from "../../../../../wailsjs/go/models"

export interface PartyFormModalProp {
  isOpen: boolean
  onClose: () => void
  onChange: () => Promise<void>
  party?: party.Party | null
}

export type PartyFormValues = {
  name: string
  note?: string
  phone?: string
}