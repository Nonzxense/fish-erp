import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Avatar,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Typography
} from 'antd'
import { Fish as FishIcon, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { party as partyModel, invoice as invoiceModel } from '../../../../../wailsjs/go/models'
import {
  // CreateFishPurchaseInvoice,
  GetParties,
  // UpdateFishPurchaseInvoice
} from '../../../../../wailsjs/go/main/App'
import dayjs from 'dayjs'
import { formatDate, formatTHB } from '../../../../utils/formatter'
import { PurchaseInvoiceFormModalProps } from './interface'

const { Text, Title } = Typography

const PurchaseInvoiceFormModal = ({
  isOpen,
  onClose,
  onChange,
  purchaseInvoice
}: PurchaseInvoiceFormModalProps) => {
  const [customers, setCustomers] = useState<partyModel.Party[]>([])
  const [form] = Form.useForm()
  const values = Form.useWatch([], form)

  const { t: localT } = useTranslation('purchase-invoice')
  const { t: commonT } = useTranslation('common')

  const isEdit = !!purchaseInvoice

  const customerSelectOptions = [
    ...customers.map((customer) => ({
      label: customer.name,
      value: customer.id
    }))
  ]

  const totals = useMemo(() => {
    let money = 0
    const fishes = values?.fishes || []

    fishes.forEach((fish: any) => {
      money += (fish?.weightKg || 0) * (fish?.pricePerKg || 0)
    })

    return {
      count: fishes.length,
      money
    }
  }, [values])

  const handleCloseModal = useCallback(() => {
    form.resetFields()
    onClose()
  }, [form, onClose])

  const handleSubmit = useCallback(async (values: any) => {
    // const items = values.fishes.map((fish) =>
    //   new invoiceModel.CreateFishDetailInput({
    //     name: fish.name,
    //     weightKg: Number(fish.weightKg),
    //     pricePerKg: Number(fish.pricePerKg)
    //   })
    // )

    // const payload = new invoiceModel.CreateFishPurchaseInvoiceInput({
    //   createdAt: values.createdAt.toISOString(),
    //   type: 'purchase',
    //   status: 'pending',
    //   totalAmount: 0,
    //   note: values.note || '',
    //   customerId: values.customerId,
    //   items
    // })

    try {
      if (isEdit && purchaseInvoice) {
        // await UpdateFishPurchaseInvoice(purchaseInvoice.id, payload)
      } else {
        // await CreateFishPurchaseInvoice(payload)
      }
    } catch {
      // interceptor handles error
    }

    handleCloseModal()
    onChange()
  }, [handleCloseModal, isEdit, onChange, purchaseInvoice])

  useEffect(() => {
    if (!isOpen) return

    const loadCustomers = async () => {
      const res = await GetParties(new partyModel.PartyFilter())
      setCustomers(res.data)
    }

    loadCustomers()

    if (isOpen && purchaseInvoice) {
      form.setFieldsValue({
        customerId: purchaseInvoice.customerId,
        fishes: purchaseInvoice.items,
        note: purchaseInvoice.note,
        createdAt: dayjs(purchaseInvoice.createdAt)
      })
    } else {
      form.setFieldsValue({
        createdAt: dayjs(),
        fishes: [{}]
      })
    }
  }, [isOpen, purchaseInvoice, form])

  return (
    <Modal
      title={
        <Flex gap={12} align="center">
          <Avatar
            shape="square"
            size={48}
            icon={<FishIcon />}
            className="bg-blue-500 !rounded-xl"
          />
          <div>
            <Title level={4} className="!mb-0">
              {localT('modal.title')}
            </Title>
            <Text type="secondary">{localT('title')}</Text>
          </div>
        </Flex>
      }
      open={isOpen}
      onCancel={handleCloseModal}
      footer={null}
      width={800}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {/* CUSTOMER */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="customerId"
              label={localT('modal.form.supplier.label')}
              rules={[{ required: true }]}
            >
              <Input placeholder="Supplier ID" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="createdAt"
              label={commonT('date')}
              rules={[{ required: true }]}
            >
              <DatePicker className="w-full" format={formatDate} />
            </Form.Item>
          </Col>
        </Row>

        {/* FISH LIST */}
        <Divider>{localT('modal.fishes')}</Divider>

        <Form.List name="fishes">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field) => (
                <Row key={field.key} gutter={8} className="mb-2">
                  <Col span={8}>
                    <Form.Item
                      {...field}
                      name={[field.name, 'name']}
                      rules={[{ required: true }]}
                    >
                      <Input placeholder="Fish name" />
                    </Form.Item>
                  </Col>

                  <Col span={6}>
                    <Form.Item
                      {...field}
                      name={[field.name, 'weightKg']}
                      rules={[{ required: true }]}
                    >
                      <InputNumber className="w-full" placeholder="kg" min={0} />
                    </Form.Item>
                  </Col>

                  <Col span={6}>
                    <Form.Item
                      {...field}
                      name={[field.name, 'pricePerKg']}
                      rules={[{ required: true }]}
                    >
                      <InputNumber className="w-full" placeholder="price/kg" min={0} />
                    </Form.Item>
                  </Col>

                  <Col span={4}>
                    <Button
                      danger
                      type="text"
                      icon={<Trash2 size={16} />}
                      onClick={() => remove(field.name)}
                    />
                  </Col>
                </Row>
              ))}

              <Button
                type="dashed"
                block
                icon={<Plus size={14} />}
                onClick={() => add()}
              >
                {localT('modal.add-fish')}
              </Button>
            </>
          )}
        </Form.List>

        {/* NOTE */}
        <Form.Item name="note" label={commonT('note')}>
          <Input.TextArea rows={3} />
        </Form.Item>

        {/* TOTAL */}
        <Flex justify="end">
          <Card className="w-[240px]">
            <Flex justify="space-between">
              <Text>Total Items</Text>
              <Text>{totals.count}</Text>
            </Flex>

            <Flex justify="space-between">
              <Text>Total</Text>
              <Text strong>{formatTHB(totals.money)}</Text>
            </Flex>
          </Card>
        </Flex>

        <Button type="primary" htmlType="submit" block className="mt-4">
          {commonT('modal-common.ok')}
        </Button>
      </Form>
    </Modal>
  )
}

export default PurchaseInvoiceFormModal