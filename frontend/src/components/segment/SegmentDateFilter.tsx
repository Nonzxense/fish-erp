import { Segmented } from 'antd'
import { SegmentDateFilterProp } from './interface'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'

const SegmentDateFilter = ({ onChange, ...rest }: SegmentDateFilterProp) => {
  const { t: localT } = useTranslation('common')
  const allTime = dayjs('1000-01-01').toISOString()

  return (
    <Segmented<string>
      {...rest}
      options={[
        { label: localT('filter.today'), value: dayjs().startOf('day').toISOString() },
        { label: localT('filter.current-month'), value: dayjs().startOf('month').toISOString() },
        { label: localT('filter.three-months'), value: dayjs().startOf('day').subtract(3, 'month').toISOString() },
        { label: localT('filter.six-months'), value: dayjs().startOf('day').subtract(6, 'month').toISOString() },
        { label: localT('filter.one-year'), value: dayjs().startOf('day').subtract(1, 'year').toISOString() },
        { label: localT('filter.all-time'), value: allTime },
      ]}
      defaultValue={allTime}
      onChange={onChange}
      className='select-none'
    />
  )
}

export default SegmentDateFilter