import { Segmented } from 'antd'
import { SegmentDateFilterProp } from './interface'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'

const SegmentDateFilter = ({ onChange, ...rest }: SegmentDateFilterProp) => {
  const { t: localT } = useTranslation('common')

  return (
    <Segmented<string>
      {...rest}
      options={[
        { label: localT('filter.today'), value: dayjs().startOf('day').format() },
        { label: localT('filter.current-month'), value: dayjs().startOf('month').format() },
        { label: localT('filter.three-months'), value: dayjs().startOf('day').subtract(3, 'month').format() },
        { label: localT('filter.six-months'), value: dayjs().startOf('day').subtract(6, 'month').format() },
        { label: localT('filter.one-year'), value: dayjs().startOf('day').subtract(1, 'year').format() },
        { label: localT('filter.all-time'), value: dayjs('1000-01-01').format() },
      ]}
      defaultValue={dayjs('1000-01-01').format()}
      onChange={onChange}
    />
  )
}

export default SegmentDateFilter