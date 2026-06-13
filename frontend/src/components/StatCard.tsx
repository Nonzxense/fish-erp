import { Flex, Typography } from 'antd'
import React from 'react'

const { Text } = Typography

type Variant = 'info' | 'success' | 'purple'

const variants = {
  info: {
    card: 'bg-blue-50 border-blue-200',
    bubble: 'bg-blue-100',
    icon: 'text-blue-600',
  },
  success: {
    card: 'bg-green-50 border-green-200',
    bubble: 'bg-green-100',
    icon: 'text-green-600',
  },
  purple: {
    card: 'bg-purple-50 border-purple-200',
    bubble: 'bg-purple-100',
    icon: 'text-purple-600',
  },
}

interface Props {
  title: string
  value: string
  icon: React.ReactNode
  variant: Variant
}

const StatCard = ({
  title,
  value,
  icon,
  variant,
}: Props) => {
  const styles = variants[variant]

  return (
    <div
      className={`
    relative
    overflow-hidden
    h-full
    rounded-xl
    border
    p-5
    ${styles.card}
  `}
    >
      {/* Background circle */}
      <div
        className={`
      absolute
      -bottom-5
      -right-5
      h-24
      w-24
      rounded-full
      ${styles.bubble}
      z-0
    `}
      />
      {/* Content */}
      <div className="relative z-10">
        <Flex align="center" gap={10} className="mb-3.5">
          <span
            className={`
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-lg
          ${styles.bubble}
          ${styles.icon}
        `}
          >
            {icon}
          </span>
          <Text className="font-mono text-xs font-medium uppercase tracking-wider text-slate-500">
            {title}
          </Text>
        </Flex>
        <div className="font-mono text-3xl font-bold leading-none text-slate-800">
          {value.toLocaleString()}
        </div>
      </div>
    </div>
  )
}

export default StatCard