import React, { useMemo } from 'react'
import { Fish, SaleInvoiceFormModalProps } from './interface'
import { Avatar, Button, Card, Col, Divider, Flex, Form, Input, InputNumber, Modal, Row, Select, Space, Typography } from 'antd'
import { Fish as FishIcon, Plus, Trash2, Box } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const { Text, Title } = Typography

const SaleInvoiceFormModal = ({ isOpen, onClose, onChange }: SaleInvoiceFormModalProps) => {
  const [form] = Form.useForm()
  const values = Form.useWatch([], form)
  const { t: localT } = useTranslation('sale-invoice')
  const { t: commonT } = useTranslation('common')

  const existingCrates = [
    { id: 101, crate_no: 'B-001', type: 'plastic_l', color: 'Blue' },
    { id: 102, crate_no: 'G-052', type: 'foam_m', color: 'Green' },
  ];

  const totals = useMemo(() => {
    let money = 0
    const crates = values?.crates?.length || 0
    values?.crates?.forEach((crate: { fishes: Fish[] }) => {
      crate?.fishes?.forEach((fish: Fish) => {
        const weight = fish?.weight || 0
        const price = fish?.price || 0
        money += weight * price
      })
    })
    return { money, crates }
  }, [values])

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
                <Text type='secondary'>{localT('modal.store-name')}</Text>
              </div>
            </Flex>
            <div className="text-right">
              <Text type="secondary" className="text-[12px] block uppercase">{localT('modal.invoice-no')}</Text>
              <Text strong className="text-blue-500 font-mono">#12345678</Text>
            </div>
          </Flex>
          <Divider className="mb-4" />
        </>
      }
      open={isOpen}
      onCancel={onClose}
      width={800}
      footer={[
        <Flex key="footer" justify="space-between" align="center" className="px-4 py-2 bg-gray-50 rounded-lg">
          <Space size="large">
            <Statistic title={localT('modal.total-crates')} value={totals.crates} suffix={localT('modal.container')} valueStyle={{ fontSize: 18 }} />
            <Statistic title={localT('modal.total-amount')} value={totals.money} precision={2} suffix="฿" valueStyle={{ fontSize: 18, color: '#f5222d' }} />
          </Space>
          <Space>
            <Button onClick={onClose}>{commonT('button-cancel')}</Button>
            <Button type="primary" onClick={() => form.submit()}>{commonT('button-save')}</Button>
          </Space>
        </Flex>
      ]}
    >
      <Form form={form} layout="vertical">
        {/* 1. Customer Selection */}
        <Form.Item
          name="customerId"
          label={localT('modal.form.customer.label')}
          rules={[{ required: true }]}
        >
          <Select
            placeholder={localT('modal.form.customer.placeholder')}
            options={[
              { label: localT('modal.add-new-customer'), value: 'NEW' },
              { label: 'สมชาย ขายปลา', value: '1' },
              { label: 'เจ๊วรรณ ตลาดไท', value: '2' },
            ]}
          />
        </Form.Item>

        {/* NEW CUSTOMER DETAILS (Conditional) */}
        {values?.customerId === 'NEW' && (
          <div className="bg-blue-50/50 p-4 rounded-lg mb-4 border border-blue-100">
            <Text strong className="block mb-2">{localT('modal.new-customer-title')}</Text>
            <Row gutter={8}>
              <Col span={12}>
                <Form.Item name='newCustomerName' label={localT('modal.form.customer.new-name')} rules={[{ required: true }]}>
                  <Input placeholder={localT('modal.form.customer.new-name')} />
                </Form.Item>
              </Col>
            </Row>
          </div>
        )}

        <Divider titlePlacement="left"><Text type="secondary">{localT('modal.divider-title')}</Text></Divider>

        {/* 2. Nested Crates Selection */}
        <Form.List name="crates">
          {(crateFields, { add: addCrate, remove: removeCrate }) => (
            <div className="flex flex-col gap-6">
              {crateFields.map(({ key, name, ...restField }) => (
                <Card
                  key={key}
                  size="small"
                  className="border-2 border-blue-50"
                  title={<Space><Box size={16} className="text-blue-500" /> {localT('modal.container-order')} {name + 1}</Space>}
                  extra={<Button type="text" danger icon={<Trash2 size={16} />} onClick={() => removeCrate(name)} />}
                >
                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item
                        {...restField}
                        label={localT('modal.form.container.label')}
                        name={[name, 'crate_id']}
                        rules={[{ required: true, message: localT('modal.form.container.placeholder') }]}
                      >
                        <Select
                          placeholder={localT('modal.form.container.placeholder')}
                          onChange={(val) => {
                            if (val !== 'NEW') {
                              const selected = existingCrates.find(c => c.id === val);
                              form.setFieldValue(['crates', name, 'details'], selected);
                            }
                          }}
                          options={[
                            { label: localT('modal.add-new-container'), value: 'NEW' },
                            ...existingCrates.map(c => ({
                              label: `${c.crate_no} (${c.type} - ${c.color})`,
                              value: c.id
                            }))
                          ]}
                        />
                      </Form.Item>
                    </Col>

                    {/* NEW CRATE DETAILS (Conditional) */}
                    {values?.crates?.[name]?.crate_id === 'NEW' && (
                      <Col span={24}>
                        <div className="bg-blue-50/50 p-4 rounded-lg mb-4 border border-blue-100">
                          <Text strong className="block mb-2">{localT('modal.new-container-title')}</Text>
                          <Row gutter={8}>
                            <Col span={8}>
                              <Form.Item name={[name, 'new_no']} label={localT('modal.form.container.no')} rules={[{ required: true }]}>
                                <Input placeholder="A-001" />
                              </Form.Item>
                            </Col>
                            <Col span={8}>
                              <Form.Item name={[name, 'new_type']} label={localT('modal.form.container.type')}>
                                <Select options={[
                                  { label: 'Plastic L', value: 'plastic_l' },
                                  { label: 'Foam M', value: 'foam_m' },
                                ]} />
                              </Form.Item>
                            </Col>
                            <Col span={8}>
                              <Form.Item name={[name, 'new_color']} label={localT('modal.form.container.color')}>
                                <Input placeholder="Blue" />
                              </Form.Item>
                            </Col>
                          </Row>
                        </div>
                      </Col>
                    )}

                    <Col span={24}>
                      <Form.List name={[name, 'fishes']}>
                        {(fishFields, { add: addFish, remove: removeFish }) => (
                          <div className="bg-white p-2 rounded">
                            {fishFields.map((fishField) => (
                              <Row key={fishField.key} gutter={8} align="bottom" className="mb-2">
                                <Col span={8}>
                                  <Form.Item {...fishField} label={fishField.name === 0 ? localT('modal.form.fish.type') : ""} name={[fishField.name, 'type']}>
                                    <Input />
                                  </Form.Item>
                                </Col>
                                <Col span={6}>
                                  <Form.Item {...fishField} label={fishField.name === 0 ? localT('modal.form.fish.weight') : ""} name={[fishField.name, 'weight']}>
                                    <InputNumber className="w-full" min={0} />
                                  </Form.Item>
                                </Col>
                                <Col span={6}>
                                  <Form.Item {...fishField} label={fishField.name === 0 ? localT('modal.form.fish.price') : ""} name={[fishField.name, 'price']}>
                                    <InputNumber className="w-full" min={0} />
                                  </Form.Item>
                                </Col>
                                <Col span={2}>
                                  <Button type="text" danger icon={<Trash2 size={14} />} onClick={() => removeFish(fishField.name)} className="mb-[24px]" />
                                </Col>
                              </Row>
                            ))}
                            <Button type="dashed" block icon={<Plus size={14} />} onClick={() => addFish()}>{localT('modal.add-fish')}</Button>
                          </div>
                        )}
                      </Form.List>
                    </Col>
                  </Row>
                </Card>
              ))}
              <Button type="primary" ghost block icon={<Plus size={16} />} onClick={() => addCrate()} size="large">
                {localT('modal.add-container')}
              </Button>
            </div>
          )}
        </Form.List>
      </Form>
    </Modal>
  )
}

const Statistic = ({ title, value, precision = 0, suffix, valueStyle }: any) => (
  <div>
    <Text type="secondary" className="text-[12px]">{title}</Text>
    <div style={valueStyle}>
      {typeof value === 'number' ? value.toLocaleString(undefined, { minimumFractionDigits: precision }) : value} {suffix}
    </div>
  </div>
)

export default SaleInvoiceFormModal