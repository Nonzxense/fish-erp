import { Button, DatePicker, Form, Input, InputNumber, Modal, Select } from "antd"
import { TransactionFormValues, TransactionFormModalProp } from "./interface"
import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { CreateTransaction, UpdateTransaction } from "../../../../../wailsjs/go/main/App"
import dayjs from "dayjs"
import { transaction as transactionModel } from "../../../../../wailsjs/go/models"

const TransactionFormModal = ({ isOpen, onClose, onChange, transaction }: TransactionFormModalProp) => {
  const [isLoading, _setIsLoading] = useState<boolean>(false)
  const [form] = Form.useForm<TransactionFormValues>()
  const { t: localT } = useTranslation('income-and-expense')
  const { t: commonT } = useTranslation('common')
  const isEdit = !!transaction

  const handleSubmit = async (values: TransactionFormValues) => {
    const payload = new transactionModel.CreateTransactionInput({
      occurredAt: values.occurredAt.toISOString(),
      type: values.type,
      amount: Number(values.amount),
      category: values.category ?? undefined,
      note: values.note ?? undefined,
    })

    if (isEdit && transaction) {
      await UpdateTransaction(transaction.id, payload)
    } else {
      await CreateTransaction(payload)
    }

    onChange()
    form.resetFields()
    onClose()
  }

  const handleCloseModal = useCallback(() => {
    onClose()
    form.resetFields()
  }, [onClose, form])

  useEffect(() => {
    if (isOpen && transaction) {
      form.setFieldsValue({
        occurredAt: dayjs(String(transaction.occurredAt)),
        type: transaction.type,
        category: transaction.category ?? undefined,
        amount: Number(transaction.amount),
        note: transaction.note ?? undefined,
      })
    } else if (isOpen && !transaction) {
      form.resetFields()
    }
  }, [isOpen, transaction, form])

  return (
    <Modal
      title={isEdit ? commonT('modal-common.title-edit') : commonT('modal-common.title-create')}
      open={isOpen}
      onCancel={handleCloseModal}
      footer={null}
      mask={{ closable: !isLoading }}
      classNames={{
        container: 'pb-1!',
      }}
    >
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
        onFinish={handleSubmit}
        disabled={isLoading}
      >
        <Form.Item
          name="occurredAt"
          label={localT('form.occurred-at.label')}
          rules={[{ required: true, message: localT('form.occurred-at.validate.required') }]}
        >
          <DatePicker
            className="w-full"
            placeholder={localT('form.occurred-at.placeholder')}
          />
        </Form.Item>
        <Form.Item
          name="type"
          label={localT('form.type.label')}
          rules={[{ required: true, message: localT('form.type.validate.required') }]}
        >
          <Select
            placeholder={localT('form.type.placeholder')}
            options={[
              { label: localT('income'), value: 'income' },
              { label: localT('expense'), value: 'expense' },
            ]}
          />
        </Form.Item>
        <Form.Item
          name="category"
          label={localT('form.category.label')}
        >
          <Select
            placeholder={localT('form.category.placeholder')}
          />
        </Form.Item>
        <Form.Item
          name="amount"
          label={localT('form.amount.label')}
          rules={[
            { required: true, message: localT('form.amount.validate.required') },
          ]}
        >
          <InputNumber
            min={0}
            className="w-full"
            suffix="฿"
          />
        </Form.Item>
        <Form.Item
          name="note"
          label={localT('form.note.label')}
        >
          <Input.TextArea
            rows={3}
            placeholder={localT('form.note.placeholder')}
          />
        </Form.Item>
        <Form.Item noStyle>
          <Button type="primary" htmlType="submit" loading={isLoading} block>
            {commonT('modal-common.ok')}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default TransactionFormModal