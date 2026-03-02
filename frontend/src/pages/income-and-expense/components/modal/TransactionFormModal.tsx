import { Button, DatePicker, Form, Input, InputNumber, Modal, Select, Space } from "antd"
import { TransactionFormModalProp } from "./interface"
import { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"

const TransactionFormModal = ({ isOpen, setIsOpen, onChange }: TransactionFormModalProp) => {
  const [isLoading, _setIsLoading] = useState<boolean>(false)
  const [form] = Form.useForm()
  const { t: localT } = useTranslation('income-and-expense')

  const handleSubmit = useCallback(
    async () => {
      console.log(form.getFieldsValue())
      onChange()
    },
    [form, onChange],
  )

  const handleCloseModal = useCallback(async () => {
    form.resetFields()
    setIsOpen(false)
  }, [form, setIsOpen])

  return (
    <Modal
      open={isOpen}
      onCancel={handleCloseModal}
      footer={null}
      mask={{closable: !isLoading}}
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
          name="date"
          label={localT('form.date.label')}
          rules={[{ required: true }]}
        >
          <DatePicker
            className="w-full"
            placeholder={localT('form.date.placeholder')}
          />
        </Form.Item>
        <Form.Item
          name="type"
          label={localT('form.type.label')}
          rules={[{ required: true }]}
        >
          <Select
            placeholder={localT('form.type.placeholder')}
            options={[
              { label: 'Income', value: 'income' },
              { label: 'Expense', value: 'expense' },
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
            { required: true },
            { type: 'number', min: 0, transform: (value) => Number(value) },
          ]}
        >
          <Space.Compact className="w-full">
            <InputNumber
              min={0}
              className="w-full"
            />
            <Space.Addon>฿</Space.Addon>
          </Space.Compact>
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
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default TransactionFormModal