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

export const formatTHB = (amount: number): string => {
  return amount.toLocaleString('th-TH', {
    style: 'currency',
    currency: 'THB',
  })
}