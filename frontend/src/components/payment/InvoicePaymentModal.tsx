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
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { formatTHB } from '../../utils/formatter'
import { dto } from '../../../wailsjs/go/models'
import { InvoicePaymentFormValues, InvoicePaymentModalProps } from './interface'
import { REF_FISH_PURCHASE_INVOICE, REF_FISH_SALE_INVOICE, REF_TRUCK_INVOICE } from '../../utils/constants'
import { PayInvoice } from '../../../wailsjs/go/main/App'

const { Text } = Typography
const { TextArea } = Input

const InvoicePaymentModal = ({
  isOpen,
  onClose,
  onSuccess,
  invoice,
  party
}: InvoicePaymentModalProps) => {
  const [form] = Form.useForm<InvoicePaymentFormValues>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { message } = App.useApp()

  const { t: localT } = useTranslation('payment')
  const { t: commonT } = useTranslation('common')

  const isReceivable = invoice?.refType === REF_FISH_SALE_INVOICE || invoice?.refType === REF_TRUCK_INVOICE

  useEffect(() => {
    if (!isOpen || !invoice) {
      form.resetFields()
      return
    }

    form.setFieldsValue({
      paymentDate: dayjs(),
      method: 'cash',
      amount: invoice.remainingAmount / 100
    })
  }, [form, isOpen, invoice])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      if (!invoice || !party) {
        message.error(commonT('message.error-no-invoice-selected'))
        return
      }

      if (values.amount > invoice.remainingAmount) {
        message.error(
          localT('message.overpaid-invoice', {
            amount: formatTHB(values.amount - invoice.remainingAmount)
          })
        )
        return
      }

      setIsSubmitting(true)

      let direction = 'in'

      switch (invoice.refType) {
        case REF_FISH_SALE_INVOICE:
        case REF_TRUCK_INVOICE:
          direction = 'in'
          break
        case REF_FISH_PURCHASE_INVOICE:
          direction = 'out'
          break
        default:
          message.error(commonT('message.error-invalid-invoice-type'))
          setIsSubmitting(false)
          return
      }

      const payload = new dto.PayInvoiceInput({
        partyId: party.id,
        amount: values.amount,
        direction: direction,
        paymentDate: values.paymentDate.toISOString(),
        method: values.method,
        note: values.note,
        referenceId: invoice.id,
        referenceType: invoice.refType
      })

      await PayInvoice(payload)

      message.success(localT('message.payment-success'))

      onSuccess?.()
      onClose()
    } catch (error) {
      console.error(error)
      message.error(commonT('message.error-payment-failed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      confirmLoading={isSubmitting}
      title={isReceivable ? localT('modal.receive-payment-title') : localT('modal.make-payment-title')}
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
                {isReceivable ? localT('total-receivable') : localT('total-payable')}
              </Text>
              <div>
                <Text strong className={isReceivable ? 'text-green-500' : 'text-red-500'}>
                  {formatTHB(invoice.remainingAmount)}
                </Text>
              </div>
            </div>
          </Flex>
          <div className="mt-3">
            <Text type="secondary">
              {localT('invoice.id')}
            </Text>
            <div>
              <Text strong>
                {invoice?.id || '-'} ({invoice?.refType || '-'})
              </Text>
            </div>
          </div>
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
              },
              {
                validator: (_, value) => {
                  if (value && value <= 0) {
                    return Promise.reject(new Error(localT('validation.amount-positive')))
                  }
                  if (value && value > invoice.remainingAmount) {
                    return Promise.reject(new Error(localT('validation.amount-exceeds-remaining')))
                  }
                  return Promise.resolve()
                }
              }
            ]}
          >
            <InputNumber
              min={1}
              max={invoice.remainingAmount}
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

export default InvoicePaymentModal