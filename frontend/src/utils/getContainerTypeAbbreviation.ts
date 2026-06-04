export const getContainerTypeAbbreviation = (type: string): string => {
  switch (type) {
    case 'plastic_l':
      return 'ญ'

    case 'plastic_s':
      return 'ล'

    case 'foam_l':
      return 'ฟญ'

    case 'foam_m':
      return 'ฟก'

    case 'foam_s':
      return 'ฟล'

    default:
      return '-'
  }
}