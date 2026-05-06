import {
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
  Select,
  Space,
  Typography,
} from 'antd'
import {
  Truck,
  Plus,
  Trash2,
} from 'lucide-react'
import dayjs from 'dayjs'
import ModalHeader from '../../../../components/invoice-modal-title/ModalHeader'
import { useTranslation } from 'react-i18next'
import { useCallback, useMemo } from 'react'
import { CustomerContainer, HelperWage, OtherExpense, TruckInvoiceFormModalProps, TruckInvoiceFormValues } from './interface'
import { truckinvoice as truckinvoiceModel } from '../../../../../wailsjs/go/models'
import { CreateTruckInvoice } from '../../../../../wailsjs/go/main/App'
import { CUSTOMER_CONTAINER_KEYS } from '../../../../utils/constants'
import { formatTHB } from '../../../../utils/formatter'

const { Text } = Typography
const customerOptions = [
  { label: 'บริษัท A', value: '43dfb340-fc65-4010-87e3-16fad6c556db' },
]

const TruckInvoiceFormModal = ({ isOpen, onClose, onChange, truckInvoice }: TruckInvoiceFormModalProps) => {
  const [form] = Form.useForm()
  const { t: localT } = useTranslation('truck-invoice')
  const { t: commonT } = useTranslation('common')
  const customers = Form.useWatch('customers', form)
  const driverWage = Form.useWatch('driverWage', form)
  const helpers = Form.useWatch('helpers', form)
  const otherExpenses = Form.useWatch('otherExpenses', form)

  type ItemKey = typeof CUSTOMER_CONTAINER_KEYS[number]

  const mapItems = useCallback((customer: CustomerContainer) =>
    CUSTOMER_CONTAINER_KEYS
      .map((key) => {
        const item = customer[key]

        if (!item || item.qty <= 0) return null

        return { type: key, qty: item.qty, price: item.price }
      })
      .filter((x): x is { type: ItemKey; qty: number; price: number } => x !== null)
    , [])

  const calculateCustomerTotal = useCallback((c?: Partial<CustomerContainer>) => {
    if (!c) return 0

    return CUSTOMER_CONTAINER_KEYS.reduce((total, key) => {
      const item = c[key]

      const qty = item?.qty ?? 0
      const price = item?.price ?? 0

      return total + qty * price
    }, 0)
  }, [])

  const totalExpense = useMemo(() => {
    const driver = driverWage ?? 0

    const helpersTotal = (helpers ?? []).reduce(
      (sum: number, h: HelperWage) => sum + (h?.wage ?? 0),
      0
    )

    const otherExpensesTotal = (otherExpenses ?? []).reduce(
      (sum: number, e: OtherExpense) => sum + (e?.amount ?? 0),
      0
    )

    return driver + helpersTotal + otherExpensesTotal
  }, [driverWage, helpers, otherExpenses])

  const totalIncome = useMemo(() => {
    return (customers ?? []).reduce(
      (sum: number, c: CustomerContainer) => sum + calculateCustomerTotal(c),
      0
    )
  }, [calculateCustomerTotal, customers])

  const handleCloseModal = useCallback(() => {
    form.resetFields()
    form.setFieldsValue({})
    onClose()
  }, [form, onClose])

  const handleSubmit = useCallback(async (values: TruckInvoiceFormValues) => {
    const helpers = values.helpers.map((helper) => (
      new truckinvoiceModel.HelperWageInput({
        ...helper
      })
    ))

    const customers = values.customers.map((customer) => (
      new truckinvoiceModel.CustomerContainerInput({
        ...customer,
        items: mapItems(customer)
      })
    ))

    const expenses = values.otherExpenses.map((expense) => (
      new truckinvoiceModel.OtherExpenseInput({
        ...expense
      })
    ))

    const payload = new truckinvoiceModel.CreateTruckInvoiceInput({
      ...values,
      occurredAt: dayjs(values.occurredAt).startOf('day').toISOString(),
      type: "truck",
      status: "pending",
      helpers: helpers,
      otherExpenses: expenses,
      customers: customers,
    })

    try {
      console.log(payload)
      // await CreateTruckInvoice(payload)
    } catch {
      // interceptor handles error
    }

    // handleCloseModal()
    onChange()
  }, [handleCloseModal, mapItems, onChange])

  return (
    <Modal
      open={isOpen}
      onCancel={handleCloseModal}
      width={850}
      footer={null}
      destroyOnHidden
      styles={{
        body: {
          maxHeight: '75vh',
          overflowY: 'auto'
        }
      }}
      title={
        <ModalHeader icon={<Truck />} title={localT('modal-title')} subtitle={localT('title')} />
      }
    >
      <Form
        form={form}
        layout="vertical"
        className="space-y-4"
        initialValues={{
          date: dayjs(),
          helpers: [{}],
          otherExpenses: [{}],
          customers: [{}]
        }}
        onFinish={handleSubmit}
        onFinishFailed={(err) => console.log(err)}
      >
        {/* ================= GENERAL ================= */}
        <Card title={localT('card.general')}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label={localT('form.date')} name="date" rules={[{ required: true }]}>
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item label={localT('form.car-plate')} name="carPlate" rules={[{ required: true }]}>
                <Input placeholder="กข 1234" />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item label={localT('form.driver-name')} name="driverName" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item label={localT('form.driver-wage')} name="driverWage" rules={[{ required: true }]}>
                <InputNumber className="w-full" min={0} />
              </Form.Item>
            </Col>

            <Col span={16}>
              <Form.Item label={localT('form.note')} name="note">
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* ================= HELPERS ================= */}
        <Card title={localT('card.helpers')}>
          <Form.List name="helpers">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <Row gutter={8} key={field.key} align="bottom">
                    <Col flex="auto">
                      <Form.Item
                        name={[field.name, 'name']}
                        label={localT('fields.name')}
                      >
                        <Input />
                      </Form.Item>
                    </Col>

                    <Col flex="auto">
                      <Form.Item
                        name={[field.name, 'wage']}
                        label={localT('fields.wage')}
                      >
                        <InputNumber className="w-full" />
                      </Form.Item>
                    </Col>

                    <Col flex="16px">
                      <Button
                        danger
                        type="text"
                        icon={<Trash2 size={14} />}
                        onClick={() => remove(field.name)}
                        className="mb-[24px]"
                      />
                    </Col>
                  </Row>
                ))}

                <Button
                  type="dashed"
                  block
                  size="small"
                  icon={<Plus size={14} />}
                  onClick={() => add()}
                >
                  {localT('buttons.add-helper')}
                </Button>
              </>
            )}
          </Form.List>
        </Card>

        {/* ================= EXPENSES ================= */}
        <Card title={localT('card.expenses')}>
          <Form.List name="otherExpenses">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <Row gutter={8} key={field.key} align="bottom" className="mb-2">
                    <Col flex="auto">
                      <Form.Item
                        name={[field.name, 'description']}
                        label={localT('fields.description')}
                      >
                        <Input />
                      </Form.Item>
                    </Col>

                    <Col flex="auto">
                      <Form.Item
                        name={[field.name, 'amount']}
                        label={localT('fields.amount')}
                      >
                        <InputNumber className="w-full" />
                      </Form.Item>
                    </Col>

                    <Col flex="16px">
                      <Button
                        danger
                        type="text"
                        icon={<Trash2 size={14} />}
                        onClick={() => remove(field.name)}
                        className="mb-[24px]"
                      />
                    </Col>
                  </Row>
                ))}

                <Button
                  type="dashed"
                  block
                  size="small"
                  icon={<Plus size={14} />}
                  onClick={() => add()}
                >
                  {localT('buttons.add-expense')}
                </Button>
              </>
            )}
          </Form.List>
        </Card>

        {/* ================= CUSTOMERS ================= */}
        <Card title={localT('card.customers')}>
          <Form.List name="customers">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <Card
                    key={field.key}
                    size="small"
                    className="mb-4"
                    title={localT('customer.title', { index: index + 1 })}
                    extra={
                      <Button
                        danger
                        type="text"
                        icon={<Trash2 size={16} />}
                        onClick={() => remove(field.name)}
                      />
                    }
                  >
                    {/* Customer */}
                    <Row gutter={8}>
                      <Col span={12}>
                        <Form.Item
                          name={[field.name, 'customerId']}
                          label={localT('form.customer')}
                          rules={[{ required: true }]}
                        >
                          <Select
                            showSearch={{ optionFilterProp: 'label' }}
                            options={customerOptions}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name={[field.name, 'status']}
                          label={localT('form.status')}
                          rules={[{ required: true }]}
                          initialValue={'pending'}
                        >
                          <Select
                            options={[
                              {
                                value: 'pending',
                                label: commonT('invoice-status.pending'),
                              },
                              {
                                value: 'paid',
                                label: commonT('invoice-status.paid'),
                              }
                            ]}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* ลัง */}
                    < Divider titlePlacement='left' >
                      {localT('customer.container')}
                    </Divider>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label={commonT('plastic-l')}>
                          <Space>
                            <Form.Item name={[field.name, 'big', 'qty']} noStyle initialValue={0}>
                              <InputNumber min={0} precision={0} step={1} />
                            </Form.Item>
                            <span>x</span>
                            <Form.Item name={[field.name, 'big', 'price']} noStyle initialValue={300}>
                              <InputNumber min={0} />
                            </Form.Item>
                          </Space>
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item label={commonT('plastic-s')}>
                          <Space>
                            <Form.Item name={[field.name, 'small', 'qty']} noStyle initialValue={0}>
                              <InputNumber min={0} precision={0} step={1} />
                            </Form.Item>
                            <span>x</span>
                            <Form.Item name={[field.name, 'small', 'price']} noStyle initialValue={150}>
                              <InputNumber min={0} />
                            </Form.Item>
                          </Space>
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* โฟม */}
                    <Divider titlePlacement='left'>
                      {localT('customer.foam')}
                    </Divider>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item label={commonT('foam-l')}>
                          <Space>
                            <Form.Item name={[field.name, 'foamBig', 'qty']} noStyle initialValue={0}>
                              <InputNumber min={0} precision={0} step={1} />
                            </Form.Item>
                            <span>x</span>
                            <Form.Item name={[field.name, 'foamBig', 'price']} noStyle initialValue={200}>
                              <InputNumber min={0} />
                            </Form.Item>
                          </Space>
                        </Form.Item>
                      </Col>

                      <Col span={8}>
                        <Form.Item label={commonT('foam-m')}>
                          <Space>
                            <Form.Item name={[field.name, 'foamMid', 'qty']} noStyle initialValue={0}>
                              <InputNumber min={0} />
                            </Form.Item>
                            <span>x</span>
                            <Form.Item name={[field.name, 'foamMid', 'price']} noStyle initialValue={150}>
                              <InputNumber min={0} />
                            </Form.Item>
                          </Space>
                        </Form.Item>
                      </Col>

                      <Col span={8}>
                        <Form.Item label={commonT('foam-s')}>
                          <Space>
                            <Form.Item name={[field.name, 'foamSmall', 'qty']} noStyle initialValue={0}>
                              <InputNumber min={0} />
                            </Form.Item>
                            <span>x</span>
                            <Form.Item name={[field.name, 'foamSmall', 'price']} noStyle initialValue={100}>
                              <InputNumber min={0} />
                            </Form.Item>
                          </Space>
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* Total */}
                    <div className="text-right text-lg font-semibold text-blue-600">
                      {localT('customer.total')}: {formatTHB(calculateCustomerTotal(customers?.[index]))} บาท
                    </div>
                  </Card>
                ))}

                <Button
                  type="dashed"
                  block
                  icon={<Plus size={14} />}
                  onClick={() => add()}
                >
                  {localT('buttons.add-customer')}
                </Button>
              </>
            )}
          </Form.List>
        </Card >

        {/* TOTAL */}
        <Flex justify="end" className="w-full">
          <Flex
            vertical
            gap={8}
            className="mb-4 px-4 py-4 bg-gray-50 rounded-lg gradient-btn min-w-[220px]"
          >
            <Flex justify="space-between" align="center" gap={16}>
              <Text className="!text-white">
                {localT('total-expense')}
              </Text>
              <Text strong className="!text-white">
                {formatTHB(totalExpense)}
              </Text>
            </Flex>

            <Flex justify="space-between" align="center" gap={16}>
              <Text className="!text-white">
                {localT('total-income')}
              </Text>

              <Text strong className="text-lg !text-white">
                {formatTHB(totalIncome)}
              </Text>
            </Flex>
          </Flex>
        </Flex>

        {/* ================= SUBMIT ================= */}
        < Form.Item noStyle >
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
          >
            {localT('buttons.submit')}
          </Button>
        </Form.Item >
      </Form >
    </Modal >
  )
}

export default TruckInvoiceFormModal