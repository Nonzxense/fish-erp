import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Fish, SaleInvoiceFormModalProps, SaleInvoiceFormValues } from './interface'
import { Avatar, Button, Card, Col, DatePicker, Divider, Flex, Form, Input, InputNumber, Modal, Row, Select, Space, Typography } from 'antd'
import { Fish as FishIcon, Plus, Trash2, Box } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { container as containerModel, invoice as invoiceModel, party as partyModel } from '../../../../../wailsjs/go/models'
import { CreateFishSaleInvoice, GetContainers, GetParties, UpdateFishSaleInvoice } from '../../../../../wailsjs/go/main/App'
import dayjs from 'dayjs'
import { formatDate, formatTHB } from '../../../../utils/formatter'
import useContainerTypeOptions from '../../../../hooks/useContainerTypeOptions'
import useContainerColorOptions from '../../../../hooks/useContainerColorOptions'

const { Text, Title } = Typography

const SaleInvoiceFormModal = ({ isOpen, onClose, onChange, saleInvoice }: SaleInvoiceFormModalProps) => {
  const [customers, setCustomers] = useState<partyModel.Party[]>([])
  const [existingContainers, setExistingContainers] = useState<containerModel.Container[]>([])
  const [form] = Form.useForm()
  const values = Form.useWatch([], form)
  const { t: localT } = useTranslation('sale-invoice')
  const { t: commonT } = useTranslation('common')
  const containerTypeOptions = useContainerTypeOptions()
  const containerColorOptions = useContainerColorOptions()
  const isEdit = !!saleInvoice

  const customerSelectOptions = [
    { label: localT('modal.add-new-customer'), value: 'NEW' },
    ...customers.map((customer) => ({
      label: customer.name, value: customer.id
    }))
  ]

  const existingContainerSelectOptions = [
    { label: localT('modal.add-new-container'), value: 'NEW' },
    ...existingContainers.map(c => ({
      label: `${c.id} (${commonT(c.type.replace('_', '-'))} - ${commonT(c.color)})`,
      value: c.id
    }))
  ]

  const totals = useMemo(() => {
    let money = 0
    const containers = values?.containers?.length || 0
    values?.containers?.forEach((container: { fishes: Fish[] }) => {
      container?.fishes?.forEach((fish: Fish) => {
        const weight = fish?.weightKg || 0
        const price = fish?.pricePerKg || 0
        money += weight * price
      })
    })
    return { money, containers }
  }, [values])

  const handleCloseModal = useCallback(() => {
    form.resetFields()
    onClose()
  }, [form, onClose])

  const handleSubmit = useCallback(async (values: SaleInvoiceFormValues) => {
    const items = values.containers.map((item) => {
      const fishes = item.fishes.map((fish) =>
        new containerModel.CreateFishDetailInput({
          name: fish.name,
          weightKg: Number(fish.weightKg),
          pricePerKg: Number(fish.pricePerKg),
        })
      )

      const isNewContainer = !!(item.newContainerId && item.newContainerType && item.newContainerColor)
      return new containerModel.CreateFishContainerInput({
        containerId: isNewContainer ? 0 : Number(item.containerId),
        isNewContainer: isNewContainer,
        newContainerId: Number(item.newContainerId),
        newContainerType: item.newContainerType,
        newContainerColor: item.newContainerColor,
        fishes: fishes,
      })
    })

    const isNewCustomer = !!values.newCustomerName
    const payload = new invoiceModel.CreateFishSaleInvoiceInput({
      createdAt: values.createdAt.toISOString(),
      type: 'sale',
      status: 'pending', // dummy
      totalAmount: 0, // dummy
      note: values.note || "",
      customerId: isNewCustomer ? "" : values.customerId,
      isNewCustomer: isNewCustomer,
      newCustomerName: values.newCustomerName,
      items: items,
    })
    console.log(payload)
    try {
      if (isEdit && saleInvoice) {
        await UpdateFishSaleInvoice(saleInvoice.id, payload)
      } else {
        await CreateFishSaleInvoice(payload)
      }
    } catch {
      // handle by interceptor
    }

    handleCloseModal()
    onChange()

  }, [handleCloseModal, isEdit, onChange, saleInvoice])

  useEffect(() => {
    if (!isOpen) return
    const loadCustomers = async () => {
      try {
        const res = await GetParties(new partyModel.PartyFilter())
        setCustomers(res.data)
      } catch {
        // handle by interceptor
      }
    }

    const loadContainers = async () => {
      try {
        const res = await GetContainers(new containerModel.ContainerFilter())
        setExistingContainers(res.data)
      } catch {
        // handle by interceptor
      }
    }

    loadCustomers()
    loadContainers()
    if (isOpen && saleInvoice) {
      form.setFieldsValue({
        id: saleInvoice.id,
        customerId: saleInvoice.customerId,
        containers: saleInvoice.items,
        note: saleInvoice.note
      })
    } else {
      form.setFieldsValue({
        containers: [
          {
            fishes: [{}]
          }
        ]
      })
    }
  }, [form, isOpen, saleInvoice])

  return (
    <Modal
      title={
        <>
          <Flex justify="space-between" align="center" className="w-full pr-8">
            <Flex gap={12} align="center">
              <Avatar
                shape="square"
                size={48}
                icon={<FishIcon />}
                className="bg-blue-500 bg-[radial-gradient(circle_at_bottom_right,theme(colors.cyan.400)_0%,transparent_80%)] !border-0 !shadow-none !rounded-xl"
              />
              <div className="flex flex-col justify-center">
                <Title level={4} className="!mb-0">{localT('modal.title')}</Title>
                <Text type='secondary'>{localT('modal.title')}</Text>
              </div>
            </Flex>
            <div className="text-right" hidden={!isEdit}>
              <Text type="secondary" className="text-[12px] block uppercase">{localT('modal.invoice-no')}</Text>
              <Text strong className="text-blue-500 font-mono">#{saleInvoice?.id}</Text>
            </div>
          </Flex>
          <Divider className="mb-4" />
        </>
      }
      open={isOpen}
      onCancel={handleCloseModal}
      width={800}
      footer={null}
      styles={{
        body: {
          maxHeight: '70vh',
          overflowY: 'auto',
        },
      }}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {/* 1. Customer Selection */}
        <Row gutter={[16, 16]} className="!mx-0">
          <Col span={12}>
            <Form.Item
              name="customerId"
              label={localT('modal.form.customer.label')}
              rules={[{ required: true, message: localT('modal.form.customer.validate.required') }]}
            >
              <Select
                placeholder={localT('modal.form.customer.placeholder')}
                options={customerSelectOptions}
              />
            </Form.Item>

          </Col>

          <Col span={12}>
            <Form.Item
              name="createdAt"
              label={commonT('date')}
              rules={[{ required: true }]}
              initialValue={dayjs()}
            >
              <DatePicker
                className="!w-full"
                allowClear={false}
                format={formatDate}
              />
            </Form.Item>
          </Col>
        </Row>
        {/* NEW CUSTOMER DETAILS (Conditional) */}
        {values?.customerId === 'NEW' && (
          <div className="bg-blue-50/50 p-4 rounded-lg mb-4 border border-blue-100">
            <Text strong className="block mb-2">{localT('modal.new-customer-title')}</Text>
            <Row gutter={8}>
              <Col span={12}>
                <Form.Item name='newCustomerName' label={localT('modal.form.customer.new-name')} rules={[{ required: true, message: localT('modal.form.customer.new-name.validate.required') }]}>
                  <Input placeholder={localT('modal.form.customer.new-name')} />
                </Form.Item>
              </Col>
            </Row>
          </div>
        )}
        <Divider titlePlacement="left"><Text type="secondary">{localT('modal.divider-title')}</Text></Divider>

        {/* 3. Nested Containers Selection */}
        <Form.List
          name="containers"
          rules={[
            {
              validator: async (_, containers) => {
                if (!containers || containers.length < 1) {
                  return Promise.reject(new Error(localT('modal.validate.add-container')))
                }
              }
            }
          ]}
        >
          {(containerFields, { add: addContainer, remove: removeContainer }, { errors }) => (
            <div className="flex flex-col mb-4 gap-6">
              {containerFields.map(({ key, name, ...restField }) => (
                <Card
                  key={key}
                  size="small"
                  className="border-2 border-blue-50"
                  title={<Space><Box size={16} className="text-blue-500" /> {localT('modal.container-order')} {name + 1}</Space>}
                  extra={<Button type="text" danger icon={<Trash2 size={16} />} onClick={() => removeContainer(name)} disabled={containerFields.length === 1} />}
                >
                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item
                        {...restField}
                        label={localT('modal.form.container.label')}
                        name={[name, 'containerId']}
                        rules={[{ required: true, message: localT('modal.form.container.validate-required') }]}
                      >
                        <Select
                          placeholder={localT('modal.form.container.placeholder')}
                          onChange={(val) => {
                            if (val !== 'NEW') {
                              const selected = existingContainers.find(c => c.id === val);
                              form.setFieldValue(['containers', name, 'details'], selected);
                            }
                          }}
                          options={existingContainerSelectOptions}
                        />
                      </Form.Item>
                    </Col>

                    {/* NEW CONTAINER DETAILS (Conditional) */}
                    {values?.containers?.[name]?.containerId === 'NEW' && (
                      <Col span={24}>
                        <div className="bg-blue-50/50 p-4 rounded-lg mb-4 border border-blue-100">
                          <Text strong className="block mb-2">{localT('modal.new-container-title')}</Text>
                          <Row gutter={8}>
                            <Col span={8}>
                              <Form.Item name={[name, 'newContainerId']} label={localT('modal.form.container.no')} rules={[{ required: true }]}>
                                <Input placeholder={localT('modal.form.container.no')} />
                              </Form.Item>
                            </Col>
                            <Col span={8}>
                              <Form.Item name={[name, 'newContainerType']} label={localT('modal.form.container.type')}>
                                <Select options={containerTypeOptions} placeholder={localT('modal.form.container.select-type')} />
                              </Form.Item>
                            </Col>
                            <Col span={8}>
                              <Form.Item name={[name, 'newContainerColor']} label={localT('modal.form.container.color')}>
                                <Select options={containerColorOptions} placeholder={localT('modal.form.container.select-color')} />
                              </Form.Item>
                            </Col>
                          </Row>
                        </div>
                      </Col>
                    )}

                    <Col span={24}>
                      <Form.List
                        name={[name, 'fishes']}
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
                          <div className="bg-white py-2 pl-2 rounded">
                            {fishFields.map((fishField) => (
                              <Row key={fishField.key} gutter={8} align="bottom" className="mb-2">
                                <Col flex="auto">
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
                    </Col>
                  </Row>
                </Card>
              ))}
              <Button type="primary" ghost block icon={<Plus size={16} />} onClick={() => addContainer()} size="large">
                {localT('modal.add-container')}
              </Button>
              <Form.ErrorList errors={errors} />
            </div>
          )}
        </Form.List>
        <Form.Item
          name="note"
          label={localT('modal.form.note.label')}
        >
          <Input.TextArea
            rows={3}
            placeholder={localT('modal.form.note.placeholder')}
          />
        </Form.Item>
        <Flex justify="end" className="w-full">
          <Flex
            vertical
            gap={8}
            className="mb-4 px-4 py-4 bg-gray-50 rounded-lg gradient-btn min-w-[220px]"
          >
            <Flex justify="space-between" align="center" gap={16}>
              <Text className="!text-white">
                {localT('modal.total-containers')}
              </Text>
              <Text strong className="!text-white">
                {totals.containers} {localT('modal.container')}
              </Text>
            </Flex>

            <Flex justify="space-between" align="center" gap={16}>
              <Text className="!text-white">
                {localT('modal.total-amount')}
              </Text>

              <Text strong className="text-lg !text-white">
                {formatTHB(totals.money)}
              </Text>
            </Flex>
          </Flex>
        </Flex>
        <Form.Item noStyle>
          <Button type="primary" htmlType="submit" block>
            {commonT('modal-common.ok')}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default SaleInvoiceFormModal