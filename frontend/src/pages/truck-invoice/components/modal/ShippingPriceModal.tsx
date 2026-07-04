import { Button, Form, InputNumber, Modal, Space } from 'antd'
import { Settings } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GetShippingPrices, UpdateShippingPrices } from '../../../../../wailsjs/go/main/App'
import { truckinvoice as truckinvoiceModel } from '../../../../../wailsjs/go/models'
import ModalHeader from '../../../../components/invoice-modal-title/ModalHeader'

interface ShippingPriceModalProps {
  isOpen: boolean
  onClose: () => void
}

const ShippingPriceModal = ({ isOpen, onClose }: ShippingPriceModalProps) => {
  const [form] = Form.useForm()
  const { t: commonT } = useTranslation('common')
  const { t: localT } = useTranslation('truck-invoice')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      GetShippingPrices().then((res) => {
        form.setFieldsValue(res)
      })
    }
  }, [isOpen, form])

  const handleSubmit = async (values: any) => {
    try {
      setIsLoading(true)
      await UpdateShippingPrices(new truckinvoiceModel.ShippingPrices(values))
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      title={<ModalHeader icon={<Settings />} title={localT('modal.shipping-price-title')} subtitle={localT('modal.shipping-price-subtitle')} />}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <div className="grid grid-cols-2 gap-x-4">
          <Form.Item label={commonT('plastic-l')} name="plasticLarge">
            <InputNumber className="w-full" min={0} />
          </Form.Item>
          <Form.Item label={commonT('plastic-s')} name="plasticSmall">
            <InputNumber className="w-full" min={0} />
          </Form.Item>
          <Form.Item label={commonT('foam-l')} name="foamLarge">
            <InputNumber className="w-full" min={0} />
          </Form.Item>
          <Form.Item label={commonT('foam-m')} name="foamMedium">
            <InputNumber className="w-full" min={0} />
          </Form.Item>
          <Form.Item label={commonT('foam-s')} name="foamSmall">
            <InputNumber className="w-full" min={0} />
          </Form.Item>
        </div>
        <Form.Item className="mb-0 text-right mt-4">
          <Space>
            <Button onClick={onClose}>{commonT('button-cancel')}</Button>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              {commonT('button-save')}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default ShippingPriceModal