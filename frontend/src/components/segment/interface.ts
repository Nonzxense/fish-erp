import type { SegmentedProps } from 'antd'

export interface SegmentDateFilterProp
  extends Omit<SegmentedProps<string>, 'options'> {
}