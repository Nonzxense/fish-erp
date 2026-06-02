import { useTranslation } from "react-i18next";

const COLOR_MAP: Record<string, string> = {
  red: '#ef4444', blue: '#3b82f6', green: '#16a34a',
  yellow: '#ca8a04', orange: '#ea580c', purple: '#9333ea',
  white: '#cbd5e1', black: '#475569',
}

const ContainerTag = ({ name, containerNo, color}: { name: string; containerNo: number; color?: string }) => {
  const dot = COLOR_MAP[color ?? ''] ?? '#94a3b8'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 6,
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      fontSize: 12, fontFamily: "'DM Mono', monospace",
      color: '#334155', whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: dot, flexShrink: 0, border: '1px solid rgba(0,0,0,0.08)' }} />
      {name}
      <span style={{ color: '#94a3b8' }}>#{containerNo}</span>
    </span>
  )
}

export default ContainerTag