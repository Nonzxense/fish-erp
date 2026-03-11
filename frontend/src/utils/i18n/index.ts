/* eslint-disable @typescript-eslint/no-explicit-any */
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const modules = import.meta.glob('./locales/*/*.json', {
  eager: true,
})

const resources: any = {}

Object.entries(modules).forEach(([path, module]: any) => {
  const match = path.match(/locales\/(.*)\/(.*)\.json$/)

  if (!match) return

  const lng = match[1]
  const namespace = match[2]

  if (!resources[lng]) {
    resources[lng] = {}
  }

  resources[lng][namespace] = module.default
})

i18n
  .use(initReactI18next)
  .init({
    debug: false,
    lng: "th",
    fallbackLng: 'th',
    supportedLngs: ['en', 'th'],

    resources,
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n