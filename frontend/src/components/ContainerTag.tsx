import { Typography } from "antd";
import { getContainerTypeAbbreviation } from "../utils/getContainerTypeAbbreviation";

const COLOR_MAP: Record<string, string> = {
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#16a34a',
  yellow: '#ca8a04',
  orange: '#ea580c',
  purple: '#9333ea',
  white: '#cbd5e1',
  black: '#475569',
}

const { Text } = Typography

const ContainerTag = ({
  name,
  containerNo,
  color,
  type,
}: {
  name: string
  containerNo: number
  color?: string
  type: string
}) => {
  const dot = COLOR_MAP[color ?? ''] ?? '#94a3b8'
  const typeAbbrev = getContainerTypeAbbreviation(type)

  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs text-slate-700 whitespace-nowrap">
      <span
        className="h-2 w-2 shrink-0 rounded-full border border-black/10"
        style={{ background: dot }}
      />

      <span>{name}</span>

      <Text className="text-[10px] font-medium text-slate-400">
        ({typeAbbrev})
      </Text>

      <span className="text-slate-400">
        #{containerNo}
      </span>
    </span>
  )
}

export default ContainerTag