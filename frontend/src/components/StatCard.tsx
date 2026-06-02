import { Flex, Typography } from "antd";
import React from 'react'

const { Text } = Typography

const StatCard = ({
  title, value, icon, accent, bg,
}: { title: string; value: number; icon: React.ReactNode; accent: string; bg: string }) => (
  <div style={{
    background: bg,
    border: `1.5px solid ${accent}30`,
    borderRadius: 12,
    padding: '20px 24px',
    position: 'relative',
    overflow: 'hidden',
    height: '100%',
  }}>
    <div style={{
      position: 'absolute', bottom: -20, right: -20,
      width: 100, height: 100, borderRadius: '50%',
      background: `${accent}12`,
    }} />
    <Flex align="center" gap={10} style={{ marginBottom: 14 }}>
      <span style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 36, height: 36, borderRadius: 10,
        background: `${accent}18`, color: accent,
      }}>
        {icon}
      </span>
      <Text style={{
        color: '#64748b', fontSize: 12,
        letterSpacing: '0.07em', textTransform: 'uppercase',
        fontFamily: "'DM Mono', monospace", fontWeight: 500,
      }}>
        {title}
      </Text>
    </Flex>
    <div style={{
      fontSize: 28, fontWeight: 700, color: '#1e293b',
      fontFamily: "'DM Mono', monospace", lineHeight: 1,
    }}>
      {value.toLocaleString()}
    </div>
  </div>
)

export default StatCard