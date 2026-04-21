import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

const useContainerColorOptions = () => {
  const { t } = useTranslation('common')

  return useMemo(() => [
    { label: t('blue'), value: 'blue' },
    { label: t('light-green'), value: 'light-green' },
    { label: t('green'), value: 'green' },
    { label: t('orange'), value: 'orange' },
    { label: t('yellow'), value: 'yellow' },
    { label: t('red'), value: 'red' },
  ], [t])
}

export default useContainerColorOptions