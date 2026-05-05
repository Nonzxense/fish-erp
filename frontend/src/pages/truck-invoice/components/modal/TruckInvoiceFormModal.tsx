import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Typography
} from 'antd'
import {
  Truck,
  Plus,
  Trash2,
} from 'lucide-react'
import dayjs from 'dayjs'
import ModalHeader from '../../../../components/invoice-modal-title/ModalHeader'
import { useTranslation } from 'react-i18next'
import { useCallback } from 'react'
import { CustomerContainer, TruckInvoiceFormModalProps, TruckInvoiceFormValues } from './interface'
import { truckinvoice as truckinvoiceModel } from '../../../../../wailsjs/go/models'
import { CreateTruckInvoice } from '../../../../../wailsjs/go/main/App'
import { CUSTOMER_CONTAINER_KEYS } from '../../../../utils/constants'

const { Text } = Typography

const customerOptions = [
  { label: 'บริษัท A', value: '43dfb340-fc65-4010-87e3-16fad6c556db' },
]

const TruckInvoiceFormModal = ({ isOpen, onClose, onChange, truckInvoice }: TruckInvoiceFormModalProps) => {
  const [form] = Form.useForm()
  const { t: localT } = useTranslation('truck-invoice')
  const customers = Form.useWatch('customers', form)


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
      await CreateTruckInvoice(payload)
    } catch {
      // interceptor handles error
    }

  }, [mapItems])

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
        <div className="mb-4">
          <Space>
            <Truck size={22} />
            <div>
              <div className="font-semibold text-lg">
                บันทึกใบค่ารถ
              </div>
              <Text type="secondary">Transport Form</Text>
            </div>
          </Space>
        </div>
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
        <Card title="ข้อมูลทั่วไป">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="วันที่"
                name="date"
                rules={[{ required: true }]}
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="ทะเบียนรถ"
                name="carPlate"
                rules={[{ required: true }]}
              >
                <Input placeholder="กข 1234" />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="ชื่อคนขับ"
                name="driverName"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="ค่าแรงคนขับ"
                name="driverWage"
                rules={[{ required: true }]}
              >
                <InputNumber className="w-full" min={0} />
              </Form.Item>
            </Col>

            <Col span={16}>
              <Form.Item label="หมายเหตุ" name="note">
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* ================= HELPERS ================= */}
        <Card title="ลูกมือ">
          <Form.List name="helpers">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <Row gutter={8} key={field.key} align="bottom">
                    <Col flex="auto">
                      <Form.Item
                        name={[field.name, 'name']}
                        label="ชื่อ"
                      >
                        <Input />
                      </Form.Item>
                    </Col>

                    <Col flex="auto">
                      <Form.Item
                        name={[field.name, 'wage']}
                        label="ค่าแรง"
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
                  เพิ่มลูกมือ
                </Button>
              </>
            )}
          </Form.List>
        </Card>

        {/* ================= EXPENSES ================= */}
        <Card title="ค่าใช้จ่ายอื่น">
          <Form.List name="otherExpenses">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <Row gutter={8} key={field.key} align="bottom" className="mb-2">
                    <Col flex="auto">
                      <Form.Item
                        name={[field.name, 'description']}
                        label="รายละเอียด"
                      >
                        <Input />
                      </Form.Item>
                    </Col>

                    <Col flex="auto">
                      <Form.Item
                        name={[field.name, 'amount']}
                        label="จำนวนเงิน"
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
                  เพิ่มค่าใช้จ่าย
                </Button>
              </>
            )}
          </Form.List>
        </Card>

        {/* ================= CUSTOMERS ================= */}
        <Card title="ลูกค้าที่ส่งของ">
          <Form.List name="customers">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <Card
                    key={field.key}
                    size="small"
                    className="mb-4"
                    title={`ลูกค้า ${index + 1}`}
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
                          label="ชื่อลูกค้า"
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
                          label="สถานะ"
                          rules={[{ required: true }]}
                          initialValue={'pending'}
                        >
                          <Select
                            options={[
                              {
                                value: 'pending',
                                label: localT('status.pending'),
                              },
                              {
                                value: 'paid',
                                label: localT('status.paid'),
                              }
                            ]}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* ลัง */}
                    < Divider titlePlacement='left' > ลัง</Divider>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="ลังใหญ่">
                          <Space>
                            <Form.Item name={[field.name, 'big', 'qty']} noStyle initialValue={0}>
                              <InputNumber placeholder="จำนวน" min={0} />
                            </Form.Item>
                            <span>x</span>
                            <Form.Item name={[field.name, 'big', 'price']} noStyle initialValue={300}>
                              <InputNumber placeholder="ราคา" min={0} />
                            </Form.Item>
                          </Space>
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item label="ลังเล็ก">
                          <Space>
                            <Form.Item name={[field.name, 'small', 'qty']} noStyle initialValue={0}>
                              <InputNumber min={0} />
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
                    <Divider titlePlacement='left'>โฟม</Divider>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item label="โฟมใหญ่">
                          <Space>
                            <Form.Item name={[field.name, 'foamBig', 'qty']} noStyle initialValue={0}>
                              <InputNumber min={0} />
                            </Form.Item>
                            <span>x</span>
                            <Form.Item name={[field.name, 'foamBig', 'price']} noStyle initialValue={200}>
                              <InputNumber min={0} />
                            </Form.Item>
                          </Space>
                        </Form.Item>
                      </Col>

                      <Col span={8}>
                        <Form.Item label="โฟมกลาง">
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
                        <Form.Item label="โฟมเล็ก">
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
                      รวม: {calculateCustomerTotal(customers?.[index])} บาท
                    </div>
                  </Card>
                ))}

                <Button
                  type="dashed"
                  block
                  icon={<Plus size={14} />}
                  onClick={() => add()}
                >
                  เพิ่มลูกค้า
                </Button>
              </>
            )}
          </Form.List>
        </Card >

        {/* ================= SUBMIT ================= */}
        < Form.Item noStyle >
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
          >
            บันทึกใบค่ารถ
          </Button>
        </Form.Item >
      </Form >
    </Modal >
  )
}

export default TruckInvoiceFormModal