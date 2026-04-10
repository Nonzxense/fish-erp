export interface PartyFilter {
  name?: string
  type?: string
  phone?: string
  convertValues?: () => PartyFilter
}
