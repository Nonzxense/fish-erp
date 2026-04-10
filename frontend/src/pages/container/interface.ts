export type ContainerFilter = {
  id?: number
  type?: string
  color?: string
  status?: string
  convertValues?: () => ContainerFilter
}
