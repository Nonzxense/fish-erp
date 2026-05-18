import {
  App,
  Button,
  DatePicker,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Typography
} from 'antd'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { payment } from '../../../../../wailsjs/go/models'
import { AllocatePaymentFIFO } from '../../../../../wailsjs/go/main/App'

import { formatTHB } from '../../../../utils/formatter'
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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { message } = App.useApp()

  const { t: localT } = useTranslation('party')
  const { t: commonT } = useTranslation('common')

  useEffect(() => {
    if (!isOpen) {
      form.resetFields()
      return
    }

    form.setFieldsValue({
      paymentDate: dayjs(),
      method: 'cash'
    })
  }, [form, isOpen])

  const totalDebt = useMemo(() => {
    return party?.totalDebt || 0
  }, [party])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      if (!party) {
        return
      }

      if (values.amount > totalDebt) {
        message.error(
          localT('message.overpaid', {
            amount: formatTHB(values.amount - totalDebt)
          })
        )

        return
      }

      setIsSubmitting(true)

      const payload = new payment.PaymentInput({
        partyId: party.id,
        amount: values.amount,
        direction: 'in',
        paymentDate: values.paymentDate.toISOString(),
        method: values.method,
        note: values.note
      })
      console.log(payload)
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
      title={localT('modal.receive-payment-title')}
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
                {localT('table.overdue-amount')}
              </Text>

              <div>
                <Text strong className="text-red-500">
                  {formatTHB(totalDebt)}
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
                  label: commonT('payment-method.cash'),
                  value: 'cash'
                },
                {
                  label: commonT('payment-method.transfer'),
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