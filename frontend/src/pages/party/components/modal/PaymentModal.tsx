import {
  App,
  Button,
  DatePicker,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Segmented,
  Select,
  Typography
} from 'antd'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { dto } from '../../../../../wailsjs/go/models'
import { AllocatePaymentFIFO } from '../../../../../wailsjs/go/main/App'

import { formatTHB, formatTHBRaw } from '../../../../utils/formatter'
import {
  PaymentFormValues,
  PaymentModalProps
} from './interface'

const { Text } = Typography
const { TextArea } = Input

const PaymentModal = ({
  isOpen,
  onClose,
  onSuccess,
  party
}: PaymentModalProps) => {
  const [form] = Form.useForm<PaymentFormValues>()
  const direction = Form.useWatch('direction', form)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { message } = App.useApp()

  const { t: localT } = useTranslation('payment')
  const { t: commonT } = useTranslation('common')

  useEffect(() => {
    if (!isOpen) {
      form.resetFields()
      return
    }

    form.setFieldsValue({
      paymentDate: dayjs(),
      method: 'cash',
      direction: 'in'
    })
  }, [form, isOpen])

  const currentBalance = useMemo(() => {
    if (direction === 'out') {
      return party?.totalPayable || 0
    }
    return party?.totalReceivable || 0
  }, [party, direction])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      if (!party) {
        return
      }

      if (values.amount > currentBalance) {
        message.error(
          localT('message.overpaid', {
            amount: formatTHBRaw(values.amount - currentBalance)
          })
        )

        return
      }

      setIsSubmitting(true)

      const payload = new dto.PaymentInput({
        partyId: party.id,
        amount: values.amount,
        direction: values.direction,
        paymentDate: values.paymentDate.toISOString(),
        method: values.method,
        note: values.note
      })

      await AllocatePaymentFIFO(payload)

      message.success(localT('message.payment-success'))

      onSuccess?.()
      onClose()
    } catch {
      // interceptor handles error
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      confirmLoading={isSubmitting}
      title={direction === 'in' ? localT('modal.receive-payment-title') : localT('modal.make-payment-title')}
      okText={commonT('button-save')}
      cancelText={commonT('button-cancel')}
      footer={null}
      destroyOnHidden
    >
      <div className="space-y-5">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <Flex justify="space-between" align="center">
            <div>
              <Text type="secondary">
                {localT('table.name')}
              </Text>

              <div>
                <Text strong>
                  {party?.name || '-'}
                </Text>
              </div>
            </div>

            <div className="text-right">
              <Text type="secondary">
                {direction === 'in' ? localT('modal.receive-payment-title') : localT('modal.make-payment-title')}
              </Text>

              <div>
                <Text strong className={direction === 'in' ? 'text-green-500' : 'text-red-500'}>
                  {formatTHB(currentBalance)}
                </Text>
              </div>
            </div>
          </Flex>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="direction"
            className="mb-4"
          >
            <Segmented
              block
              options={[
                { label: localT('direction.in'), value: 'in' },
                { label: localT('direction.out'), value: 'out' }
              ]}
              onChange={(val) => {
                form.setFieldValue('direction', val)
              }}
            />
          </Form.Item>

          <Form.Item
            label={localT('form.amount.label')}
            name="amount"
            rules={[
              {
                required: true,
                message: localT('form.amount.required')
              }
            ]}
          >
            <InputNumber
              min={1}
              className="w-full"
              placeholder={localT('form.amount.placeholder')}
            />
          </Form.Item>

          <Form.Item
            label={localT('form.payment-date.label')}
            name="paymentDate"
            rules={[
              {
                required: true,
                message: localT('form.payment-date.required')
              }
            ]}
          >
            <DatePicker
              className="w-full"
              showTime={false}
            />
          </Form.Item>

          <Form.Item
            label={localT('form.method.label')}
            name="method"
            rules={[
              {
                required: true,
                message: localT('form.method.required')
              }
            ]}
          >
            <Select
              options={[
                {
                  label: localT('method.cash'),
                  value: 'cash'
                },
                {
                  label: localT('method.transfer'),
                  value: 'transfer'
                }
              ]}
            />
          </Form.Item>

          <Form.Item
            label={localT('form.note.label')}
            name="note"
          >
            <TextArea
              rows={4}
              placeholder={localT('form.note.placeholder')}
            />
          </Form.Item>

          <Form.Item noStyle>
            <Button type="primary" htmlType="submit" loading={isSubmitting} block>
              {commonT('modal-common.ok')}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  )
}

export default PaymentModal