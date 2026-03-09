import { useTranslation } from "react-i18next"
import PageTitle from "../../components/page-title/PageTitle"
import { Button, Card, Col, DatePicker, Flex, Form, Row, Select, Space, Statistic, Table, TableColumnsType, Tag, Typography } from "antd"
import { ListFilter, Plus, Upload } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import dayjs from "dayjs"
import { formatDate, formatTHB } from "../../utils/formatter"
import SegmentDateFilter from "../../components/segment/SegmentDateFilter"
import { getTransactionTypeColor } from "../../utils/getTagColor"
import TransactionFormModal from "./components/modal/TransactionFormModal"
import { GetTransactions } from "../../../wailsjs/go/main/App"
import { domain } from "../../../wailsjs/go/models"
import { TransactionFilter, TransactionFilterFormValues } from "./interface"

const { Text } = Typography

const IncomeAndExpense = () => {
  const allTime = dayjs('1000-01-01').format()
  const [isShowFilters, setIsShowFilters] = useState<boolean>(false)
  const [isOpenModalCreate, setIsOpenModalCreate] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [transactions, setTransactions] = useState<domain.Transaction[]>([])
  const [filter, setFilter] = useState<TransactionFilter>({})
  const [income, _setIncome] = useState<number>(0)
  const [expense, _setExpense] = useState<number>(0)
  const [profit, _setProfit] = useState<number>(0)
  const [segmentValue, setSegmentValue] = useState<string>(allTime)
  const { t: localT } = useTranslation('income-and-expense')
  const { t: commonT } = useTranslation('common')
  const [form] = Form.useForm()
  const occurredAt = Form.useWatch('occurredAt', form)

  const transactionTypeOptions = useMemo(() => [
    {
      value: "income",
      label: localT("income")
    },
    {
      value: "expense",
      label: localT("expense")
    }
  ], [localT])

  const columns: TableColumnsType<domain.Transaction> = useMemo(
    () => [
      {
        title: localT('table.date'),
        key: 'occurredAt',
        dataIndex: 'occurredAt',
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

  const handleResetFilters = useCallback(() => {
    setFilter({})
  }, [])

  const handleSearchFilter = useCallback((filters: TransactionFilterFormValues) => {
    const newFilters: TransactionFilter = {
      type: filters?.type ? filters.type : undefined,
      category: filters?.category ? filters.category : undefined,
      fromDate: filters?.occurredAt?.[0]
        ? dayjs(filters.occurredAt[0]).toISOString()
        : null,
      toDate: filters?.occurredAt?.[1] ? dayjs(filters.occurredAt[1]).toISOString()
        : null,
    }
    setFilter(newFilters)
  }, [])

  const loadTransactions = useCallback(async () => {
    try {
      setIsLoading(true)
      const goFilter = new domain.TransactionFilter(filter)
      const data = await GetTransactions(goFilter)
      setTransactions(data)
    } finally {
      setIsLoading(false)
    }
  }, [filter])

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  useEffect(() => {
    if (occurredAt && occurredAt.length) {
      setSegmentValue(allTime)
    }
  }, [allTime, occurredAt])

  return (
    <>
      <TransactionFormModal
        isOpen={isOpenModalCreate}
        setIsOpen={(val) => setIsOpenModalCreate(val)}
        onChange={loadTransactions}
      />
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
          <SegmentDateFilter
            value={segmentValue}
            disabled={!!(occurredAt && occurredAt.length)}
            onChange={(val) => {
              setSegmentValue(val)
              form.setFieldsValue({ occurredAt: null })
            }}
          />
          <Space size="middle">
            <Button
              onClick={() => setIsShowFilters((isShow) => !isShow)}
              size="large" icon={<ListFilter size={16} />}
              variant="outlined"
              color="primary"
              className="min-w-[140px]">
              {commonT('button-filter')}
            </Button>
            <Button
              onClick={() => { }}
              size="large"
              icon={<Upload size={16} />}
              variant="outlined"
              color="primary"
              className="min-w-[140px]">
              {commonT('button-export')}
            </Button>
            <Button
              onClick={() => setIsOpenModalCreate(true)}
              size="large"
              icon={<Plus size={16} />}
              className="min-w-[140px] gradient-btn">
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
            form={form}
            layout="vertical"
            onReset={handleResetFilters}
            onFinish={handleSearchFilter}
          >
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item
                  label={localT('form.date.label')}
                  name="occurredAt"
                >
                  <DatePicker.RangePicker className="!w-full" placeholder={[commonT("range-picker.start"), commonT("range-picker.end")]} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={localT('form.type.label')}
                  name="type"
                >
                  <Select
                    options={transactionTypeOptions}
                    placeholder={localT('form.type.placeholder')} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={localT('form.category.label')}
                  name="category"
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
                      htmlType="reset"
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
        dataSource={transactions}
        scroll={{ x: 'max-content' }}
        rowKey={(record) => record.id}
        loading={isLoading}
      />
    </>
  )
}

export default IncomeAndExpense