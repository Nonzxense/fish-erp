import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Button,
  Col,
  DatePicker,
  Divider,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Typography
} from 'antd'
import { Fish as FishIcon, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { party as partyModel, invoice as invoiceModel, container as containerModel } from '../../../../../wailsjs/go/models'
import {
  CreateFishPurchaseInvoice,
  GetParties,
  UpdateFishPurchaseInvoice
} from '../../../../../wailsjs/go/main/App'
import dayjs from 'dayjs'
import { formatDate, formatTHBRaw } from '../../../../utils/formatter'
import { PurchaseInvoiceFormModalProps, PurchaseInvoiceFormValues } from './interface'
import ModalHeader from '../../../../components/invoice-modal-title/ModalHeader'

const { Text } = Typography

const PurchaseInvoiceFormModal = ({
  isOpen,
  onClose,
  onChange,
  purchaseInvoice
}: PurchaseInvoiceFormModalProps) => {
  const [suppliers, setSuppliers] = useState<partyModel.Party[]>([])
  const [form] = Form.useForm()
  const values = Form.useWatch([], form)

  const { t: localT } = useTranslation('purchase-invoice')
  const { t: commonT } = useTranslation('common')

  const isEdit = !!purchaseInvoice

  const supplierSelectOptions = [
    { label: localT('modal.add-new-supplier'), value: 'NEW' },
    ...suppliers.map((supplier) => ({
      label: supplier.name,
      value: supplier.id
    }))
  ]

  const totals = useMemo(() => {
    let money = 0
    const fishes = values?.fishes || []

    fishes.forEach((fish: containerModel.FishPurchaseDetail) => {
      money += (fish?.weightKg || 0) * (fish?.pricePerKg || 0)
    })

    return {
      count: fishes.length,
      money
    }
  }, [values])

  const handleCloseModal = useCallback(() => {
    form.resetFields()
    form.setFieldsValue({
      fishes: [{}]
    })
    onClose()
  }, [form, onClose])

  const handleSubmit = useCallback(async (values: PurchaseInvoiceFormValues) => {
    const fishes = values.fishes.map((fish) => (
      new containerModel.FishPurchaseDetail({
        name: fish.name,
        weightKg: Number(fish.weightKg),
        pricePerKg: Number(fish.pricePerKg)
      })
    ))

    const isNewSupplier = !!values.newSupplierName
    const payload = new invoiceModel.CreateFishPurchaseInvoiceInput({
      createdAt: values.createdAt.toISOString(),
      type: 'purchase',
      status: 'pending',
      note: values.note || '',
      supplierId: isNewSupplier ? "" : values.supplierId,
      isNewSupplier: isNewSupplier,
      newSupplierName: values.newSupplierName,
      fishes: fishes
    })

    try {
      if (isEdit && purchaseInvoice) {
        await UpdateFishPurchaseInvoice(purchaseInvoice.id, payload)
      } else {
        await CreateFishPurchaseInvoice(payload)
      }
    } catch {
      // interceptor handles error
    }

    handleCloseModal()
    onChange()
  }, [handleCloseModal, isEdit, onChange, purchaseInvoice])

  useEffect(() => {
    if (!isOpen) return

    const loadSuppliers = async () => {
      const res = await GetParties(new partyModel.PartyFilter())
      setSuppliers(res.data)
    }

    loadSuppliers()

    if (isOpen && purchaseInvoice) {
      form.setFieldsValue({
        createdAt: dayjs(purchaseInvoice.createdAt as string),
        supplierId: purchaseInvoice.supplierId,
        fishes: purchaseInvoice.items.map((fish) => ({
          ...fish,
          pricePerKg: fish.pricePerKg / 100,
        })),
        note: purchaseInvoice.note,
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
        <ModalHeader
          icon={<FishIcon />}
          title={localT('modal.title')}
          subtitle={localT('title')}
          rightContent={
            <>
              {isEdit && (
                <div className="text-right">
                  <Text type="secondary" className="text-[12px] block uppercase">
                    {commonT('invoice-no')}
                  </Text>
                  <Text strong className="text-blue-500 font-mono">
                    #{purchaseInvoice?.id}
                  </Text>
                </div>
              )}
            </>
          }
        />
      }
      open={isOpen}
      onCancel={handleCloseModal}
      width={800}
      footer={null}
      styles={{
        body: {
          maxHeight: '70vh',
          overflowY: 'auto',
          overflowX: 'hidden'
        },
      }}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {/* SUPPLIER */}
        <Row gutter={[16, 16]} className="!mx-0">
          <Col span={12}>
            <Form.Item
              name="supplierId"
              label={localT('modal.form.supplier.label')}
              rules={[{ required: true }]}
            >
              <Select
                placeholder={localT('modal.form.supplier.placeholder')}
                options={supplierSelectOptions}
              />
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

        {/* NEW SUPPLIER DETAILS (Conditional) */}
        {values?.supplierId === 'NEW' && (
          <div className="bg-blue-50/50 p-4 rounded-lg mb-4 border border-blue-100">
            <Text strong className="block mb-2">{localT('modal.new-supplier-title')}</Text>
            <Row gutter={8}>
              <Col span={12}>
                <Form.Item name='newSupplierName' label={localT('modal.form.supplier.new-name.label')} rules={[{ required: true, message: localT('modal.form.supplier.new-name.validate.required') }]}>
                  <Input placeholder={localT('modal.form.supplier.new-name.label')} />
                </Form.Item>
              </Col>
            </Row>
          </div>
        )}

        {/* FISH LIST */}
        <Divider titlePlacement="left">
          <Text type="secondary">
            {localT('modal.fishes')}
          </Text>
        </Divider>

        <Form.List
          name='fishes'
          rules={[
            {
              validator: async (_, fishes) => {
                if (!fishes || fishes.length < 1) {
                  return Promise.reject(new Error(localT('modal.validate.add-fish')))
                }
              }
            }
          ]}
        >
          {(fishFields, { add: addFish, remove: removeFish }, { errors }) => (
            <div className="py-2 pl-2 rounded">
              {fishFields.map((fishField) => (
                <Row
                  key={fishField.key}
                  gutter={8}
                  align="bottom"
                  className="mb-2"
                >
                  <Col flex="auto" className="min-w-0">
                    <Form.Item {...fishField} label={fishField.name === 0 ? localT('modal.form.fish.name') : ""} name={[fishField.name, 'name']} rules={[{ required: true, message: localT('modal.form.fish.name-validate') }]}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col flex="160px">
                    <Form.Item {...fishField} label={fishField.name === 0 ? localT('modal.form.fish.weight') : ""} name={[fishField.name, 'weightKg']} rules={[{ required: true, message: localT('modal.form.fish.weight-validate') }]}>
                      <InputNumber className="w-full" min={0} />
                    </Form.Item>
                  </Col>
                  <Col flex="160px">
                    <Form.Item {...fishField} label={fishField.name === 0 ? localT('modal.form.fish.price') : ""} name={[fishField.name, 'pricePerKg']} rules={[{ required: true, message: localT('modal.form.fish.price-validate') }]}>
                      <InputNumber className="w-full" min={0} />
                    </Form.Item>
                  </Col>
                  <Col flex="16px">
                    <Button type="text" danger icon={<Trash2 size={14} />} onClick={() => removeFish(fishField.name)} className="mb-[24px]" disabled={fishFields.length === 1} />
                  </Col>
                </Row>
              ))}
              <Button type="dashed" block icon={<Plus size={14} />} onClick={() => addFish()}>{localT('modal.add-fish')}</Button>
              <Form.ErrorList errors={errors} />
            </div>
          )}
        </Form.List>

        {/* NOTE */}
        <Form.Item
          name="note"
          label={localT('modal.form.note.label')}
        >
          <Input.TextArea
            rows={3}
            placeholder={localT('modal.form.note.placeholder')}
          />
        </Form.Item>
        {/* TOTAL */}
        <Flex justify="end" className="w-full">
          <Flex
            vertical
            gap={8}
            className="mb-4 px-4 py-4 bg-gray-50 rounded-lg gradient-btn min-w-[220px]"
          >
            <Flex justify="space-between" align="center" gap={16}>
              <Text className="!text-white">
                {localT('modal.total-items')}
              </Text>
              <Text strong className="!text-white">
                {totals.count}
              </Text>
            </Flex>

            <Flex justify="space-between" align="center" gap={16}>
              <Text className="!text-white">
                {localT('modal.total-amount')}
              </Text>

              <Text strong className="text-lg !text-white">
                {formatTHBRaw(totals.money)}
              </Text>
            </Flex>
          </Flex>
        </Flex>

        <Button type="primary" htmlType="submit" block className="mt-4">
          {commonT('modal-common.ok')}
        </Button>
      </Form>
    </Modal>
  )
}

export default PurchaseInvoiceFormModal