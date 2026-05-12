import React from 'react'

export interface ModalHeaderProps {
  icon: React.ReactNode
  title: string
  subtitle?: string
  rightContent?: React.ReactNode
  className?: string
}