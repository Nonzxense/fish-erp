import dayjs from "dayjs"
import "dayjs/locale/th"
import i18n from "./i18n"

export const formatDate = (time: Date | dayjs.Dayjs): string => {
  return dayjs(time)
    .locale(i18n.language === "th" ? "th" : "en")
    .format("D MMM YYYY")
}

export const formatDateThai = (time: Date): string => {
  return dayjs(time)
    .locale("th")
    .format("D MMM YYYY")
}

const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('th-TH', {
    style: 'currency',
    currency: 'THB',
  })
}

export const formatTHB = (amount?: number): string => {
  if (amount == null) return '฿0.00'

  return formatCurrency(amount / 100)
}

export const formatTHBRaw = (amount?: number): string => {
  if (amount == null) return '฿0.00'

  return formatCurrency(amount)
}