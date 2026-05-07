import { useEffect, useRef } from "react"
import { CheckForUpdates, DownloadUpdate, RunUpdate } from "../../wailsjs/go/main/App"
import { App } from "antd"
import { useTranslation } from "react-i18next"

const StartupProvider = () => {
  const ran = useRef(false)
  const { modal } = App.useApp()
  const { t: commonT } = useTranslation('common')
  const { t: localT } = useTranslation('updater')

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    async function init() {
      const result = await CheckForUpdates()

      if (result.available) {
        console.log(result)
        modal.confirm({
          title: localT('modal.title'),
          content: localT('modal.desc'),
          okText: commonT('modal-common.ok'),
          cancelText: commonT('modal-common.cancel'),
          onOk: async () => {
            const path = await DownloadUpdate(result.url)
            await RunUpdate(path)
          }
        })
      }
    }

    init()
  }, [commonT, localT, modal])

  return null
}

export default StartupProvider

