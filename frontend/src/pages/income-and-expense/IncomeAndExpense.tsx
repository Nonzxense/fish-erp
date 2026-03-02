import { useTranslation } from "react-i18next"
import PageTitle from "../../components/page-title/PageTitle"
import { Button, Card, Col, DatePicker, Flex, Form, Row, Select, Space, Statistic, Table, TableColumnsType, Tag, Typography } from "antd"
import { ListFilter, Plus, Upload } from "lucide-react"
import { useMemo, useState } from "react"
import { Transaction } from "./interface"
import dayjs from "dayjs"
import { formatDate, formatTHB } from "../../utils/formatter"
import SegmentDateFilter from "../../components/segment/SegmentDateFilter"
import { getTransactionTypeColor } from "../../utils/getTagColor"
import TransactionFormModal from "./components/modal/TransactionFormModal"


const mockTransactions: Transaction[] = [
  {
    id: "tx-001",
    type: "income",
    category: "ขายปลา",
    amount: 12500,
    occuredAt: dayjs().subtract(1, "day"),
    note: "ขายปลาไหล",
  },
  {
    id: "tx-002",
    billId: "bill-1001",
    type: "expense",
    category: "น้ำมัน",
    amount: -1800,
    occuredAt: dayjs().subtract(2, "day"),
    note: "ค่าน้ำมัน",
  },
  {
    id: "tx-003",
    type: "income",
    category: "ขายปลา",
    amount: 22000,
    occuredAt: dayjs().subtract(3, "day"),
  },
  {
    id: "tx-004",
    type: "expense",
    category: "น้ำแข็ง",
    amount: -950,
    occuredAt: dayjs().subtract(4, "day"),
    note: "น้ำแข็ง",
  },
  {
    id: "tx-005",
    billId: "bill-1002",
    type: "income",
    category: "ขายปลา",
    amount: 7800,
    occuredAt: dayjs().subtract(5, "day"),
  },
  {
    id: "tx-006",
    type: "expense",
    category: "ซ่อมรถ",
    amount: -3200,
    occuredAt: dayjs().subtract(6, "day"),
  },
  {
    id: "tx-007",
    type: "income",
    amount: -6400,
    category: "ลัง",
    occuredAt: dayjs().subtract(7, "day"),
    note: "ซื้อลัง"
  },
  {
    id: "tx-008",
    type: "expense",
    category: "ลัง",
    amount: -1100,
    occuredAt: dayjs().subtract(8, "day"),
    note: "ซื้อลัง"
  },
]

const { Text } = Typography

const IncomeAndExpense = () => {
  const [isShowFilters, setIsShowFilters] = useState<boolean>(false)
  const [isOpenModalCreate, setIsOpenModalCreate] = useState<boolean>(false)
  const [income, _setIncome] = useState<number>(0)
  const [expense, _setExpense] = useState<number>(0)
  const [profit, _setProfit] = useState<number>(0)
  const { t: localT } = useTranslation('income-and-expense')
  const { t: commonT } = useTranslation('common')

  const columns: TableColumnsType<Transaction> = useMemo(
    () => [
      {
        title: localT('table.date'),
        key: 'occuredAt',
        dataIndex: 'occuredAt',
        width: 180,
        render: (val: Date) => <Text>{formatDate(val)}</Text>,
      },
      {
        title: localT('table.type'),
        key: 'type',
        dataIndex: 'type',
        width: 120,
        render: (val: string) => (
          <Tag color={getTransactionTypeColor(val)} variant="outlined">
            {localT(val)}
          </Tag>
        )
      },
      {
        title: localT('table.category'),
        key: 'category',
        dataIndex: 'category',
        width: 150,
      },
      {
        title: localT('table.note'),
        key: 'note',
        dataIndex: 'note',
      },
      {
        title: localT('table.amount'),
        key: 'amount',
        dataIndex: 'amount',
        align: 'right',
        width: 160,
        render: (val: number) => <span className={val >= 0 ? "text-green-500" : "text-red-500"}>
          {formatTHB(val)}
        </span>
      },
    ], [localT])

  return (
    <>
      <TransactionFormModal isOpen={isOpenModalCreate} setIsOpen={(val) => setIsOpenModalCreate(val)} onChange={async () => { }} />
      <Space orientation="vertical" size="large" className="w-full">
        <Flex align="center" className="w-full">
          <PageTitle
            title={localT('title')}
            subtitle={localT('subtitle')}
          />
        </Flex>
        <div className="w-full">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12} lg={8}>
              <Card variant="borderless">
                <Statistic title={localT('income')} value={income} />
              </Card>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Card variant="borderless">
                <Statistic title={localT('expense')} value={expense} />
              </Card>
            </Col>
            <Col xs={24} md={24} lg={8}>
              <Card variant="borderless">
                <Statistic title={localT('profit-loss')} value={profit} />
              </Card>
            </Col>
          </Row>
        </div>
        <Flex
          justify="space-between"
          align="center"
          wrap="wrap"
          gap={16}
        >
          <SegmentDateFilter onChange={async (val) => { console.log(val) }} />
          <Space size="middle">
            <Button onClick={() => setIsShowFilters((isShow) => !isShow)} size="large" icon={<ListFilter size={16} />} variant="outlined" color="primary" className="min-w-[140px]">
              {commonT('button-filter')}
            </Button>
            <Button size="large" icon={<Upload size={16} />} variant="outlined" color="primary" className="min-w-[140px]">
              {commonT('button-export')}
            </Button>
            <Button onClick={() => setIsOpenModalCreate(true)} size="large" icon={<Plus size={16} />} className="min-w-[140px] gradient-btn">
              {commonT('button-create')}
            </Button>
          </Space>
        </Flex>
      </Space >
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out mb-6 ${isShowFilters
          ? 'max-h-[500px] opacity-100 mt-6'
          : 'max-h-0 opacity-0'
          }`}
      >
        <Card>
          <Form
            layout="vertical"
          >
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item
                  label={localT('form.date.label')}
                  name="occuredAt"
                >
                  <DatePicker.RangePicker maxDate={dayjs()} className="!w-full" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={localT('form.type.label')}
                  name="type"
                >
                  <Select placeholder={localT('form.type.placeholder')} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={localT('form.category.label')}
                  name="type"
                >
                  <Select placeholder={localT('form.category.placeholder')} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label=" " colon={false}>
                  <Flex gap={16} className="w-full">
                    <Button
                      type="primary"
                      htmlType="submit"
                      className="w-full"
                    >
                      {commonT('filter.button-search')}
                    </Button>
                    <Button
                      color="primary"
                      variant="outlined"
                      htmlType="button"
                      className="w-full">
                      {commonT('filter.button-clear')}
                    </Button>
                  </Flex>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
      </div>
      <Table
        columns={columns}
        dataSource={mockTransactions}
        scroll={{ x: 'max-content' }}
        rowKey={(record) => record.id}
      />
    </>
  )
}

export default IncomeAndExpense