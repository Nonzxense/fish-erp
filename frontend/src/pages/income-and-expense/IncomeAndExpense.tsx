import { useTranslation } from "react-i18next"
import PageTitle from "../../components/page-title/PageTitle"
import { App, Button, Card, Col, DatePicker, Flex, Form, Row, Select, Space, Statistic, Table, TableColumnsType, Tag, Tooltip, Typography } from "antd"
import { ListFilter, PencilLine, Plus, Trash2, Upload } from "lucide-react"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import dayjs from "dayjs"
import { formatDate, formatTHB } from "../../utils/formatter"
import SegmentDateFilter from "../../components/segment/SegmentDateFilter"
import { getTransactionTypeColor } from "../../utils/getTagColor"
import TransactionFormModal from "./components/modal/TransactionFormModal"
import { DeleteTransactions, GetTransactions, GetTransactionSummary } from "../../../wailsjs/go/main/App"
import { domain } from "../../../wailsjs/go/models"
import { TransactionFilter, TransactionFilterFormValues } from "./interface"

const { Text } = Typography

const IncomeAndExpense = () => {
  const [isShowFilters, setIsShowFilters] = useState<boolean>(false)
  const [isOpenModalForm, setIsOpenModalForm] = useState<boolean>(false)
  const [selectedTransactionEdit, setSelectedTransactionEdit] = useState<domain.Transaction>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [transactions, setTransactions] = useState<domain.Transaction[]>([])
  const [filter, setFilter] = useState<TransactionFilter>({})
  const [totalIncome, setTotalIncome] = useState<number>(0)
  const [totalExpense, setTotalExpense] = useState<number>(0)
  const [profit, setProfit] = useState<number>(0)
  const [segmentRange, setSegmentRange] = useState({
    fromDate: dayjs("1000-01-01").toISOString(),
    toDate: dayjs().endOf("day").toISOString(),
  })
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const { t: localT } = useTranslation('income-and-expense')
  const { t: commonT } = useTranslation('common')
  const [form] = Form.useForm()
  const occurredAt = Form.useWatch('occurredAt', form)
  const { modal } = App.useApp()

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

  const handleEditTransaction = useCallback((transaction: domain.Transaction) => {
    setSelectedTransactionEdit(transaction)
    setIsOpenModalForm(true)
  }, [])

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
      {
        title: localT('table.manage'),
        key: 'manage',
        align: 'center',
        width: 100,
        render: (_, record: domain.Transaction) => {
          return (
            <Space>
              <Tooltip title={localT('table.edit')}>
                <Button
                  hidden={!!record.billId}
                  icon={<PencilLine size={16} />}
                  variant="link"
                  color="blue"
                  onClick={() => handleEditTransaction(record)}
                />
              </Tooltip>
            </Space>
          )
        }
      }
    ], [handleEditTransaction, localT])

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => {
      setSelectedRowKeys(keys)
    },
  }

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

  const handleCloseTransactionFormModal = useCallback(() => {
    setSelectedTransactionEdit(undefined)
    setIsOpenModalForm(false)
  }, [])

  const loadTransactions = useCallback(async () => {
    try {
      setIsLoading(true)
      const goFilter = new domain.TransactionFilter({
        ...filter,
        fromDate: filter.fromDate ?? segmentRange.fromDate,
        toDate: filter.toDate ?? segmentRange.toDate
      })
      const transactions = await GetTransactions(goFilter)
      const { totalIncome, totalExpense, profit } =
        await GetTransactionSummary(goFilter.fromDate ?? segmentRange.fromDate, filter.toDate ?? segmentRange.toDate)
      setTotalIncome(totalIncome)
      setTotalExpense(totalExpense)
      setProfit(profit)
      setTransactions(transactions)
    } finally {
      setIsLoading(false)
    }
  }, [filter, segmentRange.fromDate, segmentRange.toDate])

  const handleBulkDelete = useCallback(async () => {
    modal.confirm({
      title: commonT('modal-delete.title'),
      content: commonT('modal-delete.desc', { amount: selectedRowKeys.length }),
      okText: commonT('modal-common.ok'),
      cancelText: commonT('modal-common.cancel'),
      okButtonProps: { danger: true },
      onOk: async () => {
        await DeleteTransactions((selectedRowKeys).map((id) => String(id)))
        setSelectedRowKeys([])
        await loadTransactions()
      },
    })
  }, [commonT, loadTransactions, modal, selectedRowKeys])

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  return (
    <>
      <TransactionFormModal
        isOpen={isOpenModalForm}
        onClose={handleCloseTransactionFormModal}
        onChange={loadTransactions}
        transaction={selectedTransactionEdit}
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
                <Statistic title={localT('income')} value={formatTHB(totalIncome)} />
              </Card>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Card variant="borderless">
                <Statistic title={localT('expense')} value={formatTHB(totalExpense)} />
              </Card>
            </Col>
            <Col xs={24} md={24} lg={8}>
              <Card variant="borderless">
                <Statistic title={localT('profit-loss')} value={formatTHB(profit)} />
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
            disabled={!!(occurredAt && occurredAt.length)}
            onChange={(range) => {
              const { fromDate, toDate } = JSON.parse(range)
              setSegmentRange({ fromDate, toDate })
              form.setFieldsValue({ occurredAt: null })
            }}
          />
          <Space size="middle">
            {selectedRowKeys.length > 0 && (
              <Button
                onClick={handleBulkDelete}
                size="large"
                icon={<Trash2 size={16} />}
                danger
                className="min-w-[140px]">
                {commonT('button-delete')} ({selectedRowKeys.length})
              </Button>
            )}
            <Button
              onClick={() => setIsShowFilters((isShow) => !isShow)}
              size="large"
              icon={<ListFilter size={16} />}
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
              onClick={() => setIsOpenModalForm(true)}
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
        rowSelection={rowSelection}
        dataSource={transactions}
        scroll={{ x: 'max-content' }}
        rowKey={(record) => record.id}
        loading={isLoading}
      />
    </>
  )
}

export default IncomeAndExpense