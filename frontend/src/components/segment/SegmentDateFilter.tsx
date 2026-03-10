import { Segmented } from "antd"
import { SegmentDateFilterProp } from "./interface"
import { useTranslation } from "react-i18next"
import dayjs from "dayjs"

const SegmentDateFilter = ({ onChange, ...rest }: SegmentDateFilterProp) => {
  const { t: localT } = useTranslation('common')

  const now = dayjs().endOf('day')
  const allTime = dayjs('1000-01-01')

  const options = [
    {
      label: localT('filter.today'),
      value: JSON.stringify({
        fromDate: dayjs().startOf('day').toISOString(),
        toDate: now.toISOString(),
      }),
    },
    {
      label: localT('filter.current-month'),
      value: JSON.stringify({
        fromDate: dayjs().startOf('month').toISOString(),
        toDate: now.endOf('month').toISOString(),
      }),
    },
    {
      label: localT('filter.three-months'),
      value: JSON.stringify({
        fromDate: dayjs().subtract(3, 'month').startOf('day').toISOString(),
        toDate: now.toISOString(),
      }),
    },
    {
      label: localT('filter.six-months'),
      value: JSON.stringify({
        fromDate: dayjs().subtract(6, 'month').startOf('day').toISOString(),
        toDate: now.toISOString(),
      }),
    },
    {
      label: localT('filter.one-year'),
      value: JSON.stringify({
        fromDate: dayjs().subtract(1, 'year').startOf('day').toISOString(),
        toDate: now.toISOString(),
      }),
    },
    {
      label: localT('filter.all-time'),
      value: JSON.stringify({
        fromDate: allTime.toISOString(),
        toDate: dayjs('9999-12-12').toISOString(),
      }),
    },
  ]

  return (
    <Segmented<string>
      {...rest}
      options={options}
      onChange={(val) => onChange?.(val)}
      defaultValue={JSON.stringify({
        fromDate: allTime.toISOString(),
        toDate: dayjs('9999-12-12').toISOString(),
      })}
      className="select-none"
    />
  )
}

export default SegmentDateFilter