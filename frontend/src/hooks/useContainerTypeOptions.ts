import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

const useContainerTypeOptions = () => {
  const { t } = useTranslation('common')

  return useMemo(() => [
    { label: t('plastic-l'), value: 'plastic_l' },
    { label: t('plastic-s'), value: 'plastic_s' },
    { label: t('foam-l'), value: 'foam_l' },
    { label: t('foam-m'), value: 'foam_m' },
    { label: t('foam-s'), value: 'foam_s' },
  ], [t])
}

export default useContainerTypeOptions