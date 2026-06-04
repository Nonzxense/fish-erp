export type ContainerFilter = {
  name?: string
  containerNo?: number
  type?: string
  color?: string
  status?: string
  convertValues?: () => ContainerFilter
}
