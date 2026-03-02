import { Dispatch, SetStateAction } from "react"

export interface TransactionFormModalProp {
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
  onChange: () => Promise<void>
}