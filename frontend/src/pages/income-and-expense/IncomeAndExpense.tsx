import { useTranslation } from "react-i18next"
import PageTitle from "../../components/page-title/PageTitle"
import { App, Button, Card, Col, DatePicker, Flex, Form, Row, Select, Space, Statistic, Table, TableColumnsType, TableProps, Tag, Tooltip, Typography } from "antd"
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
import { Pagination } from "../../utils/types"
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "../../utils/constants"

const { Text } = Typography

const IncomeAndExpense = () => {
  const [isShowFilters, setIsShowFilters] = useState<boolean>(false)
  const [isOpenModalForm, setIsOpenModalForm] = useState<boolean>(false)
  const [selectedTransactionEdit, setSelectedTransactionEdit] = useState<domain.Transaction>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [transactions, setTransactions] = useState<domain.Transaction[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: DEFAULT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0
  })
  const [filter, setFilter] = useState<TransactionFilter>({})
  const [totalIncome, setTotalIncome] = useState<number>(0)
  const [totalExpense, setTotalExpense] = useState<number>(0)
  const [profit, setProfit] = useState<number>(0)
  const [segmentRange, setSegmentRange] = useState({
    fromDate: dayjs("1000-01-01").toISOString(),
    toDate: dayjs('9999-12-12').toISOString(),
  })
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const { t: localT } = useTranslation('income-and-expense')
  const { t: commonT } = useTranslation('common')
  const [form] = Form.useForm()
  const occurredAt = Form.useWatch('occurredAt', form)
  const { modal } = App.useApp()

  const transactionTypeOptions = useMemo(() => [
    {
      label: localT('income'),
      value: 'income'
    },
    {
      label: localT('expense'),
      value: 'expense'
    }
  ], [localT])

  const resetPagination = useCallback(() => {
    setPagination((prev) => ({
      ...prev,
      page: DEFAULT_PAGE,
      pageSize: DEFAULT_PAGE_SIZE,
    }))
  }, [])

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
        render: (val: number, record: domain.Transaction) => <span className={record.type === 'income' ? "text-green-500" : "text-red-500"}>
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
    resetPagination()
  }, [resetPagination])

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
        toDate: filter.toDate ?? segmentRange.toDate,
        page: pagination.page,
        pageSize: pagination.pageSize
      })
      const res = await GetTransactions(goFilter)
      const { totalIncome, totalExpense, profit } =
        await GetTransactionSummary(goFilter.fromDate ?? segmentRange.fromDate, filter.toDate ?? segmentRange.toDate)
      setTotalIncome(totalIncome)
      setTotalExpense(totalExpense)
      setProfit(profit)
      setPagination((prev) => ({
        ...prev,
        total: res.total
      }))
      setTransactions(res.data)
    } finally {
      setIsLoading(false)
    }
  }, [filter, pagination.page, pagination.pageSize, segmentRange.fromDate, segmentRange.toDate])

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
        resetPagination()
        await loadTransactions()
      },
    })
  }, [commonT, loadTransactions, modal, selectedRowKeys, resetPagination])

  const handleTableChange: TableProps<domain.Transaction>['onChange'] = (
    pagination
  ) => {
    const page = pagination.current || DEFAULT_PAGE
    const pageSize = pagination.pageSize || DEFAULT_PAGE_SIZE

    setPagination((prev) => ({
      ...prev,
      page,
      pageSize,
    }))
  }

  const handleSegmentDateFilterChange = useCallback((range: string) => {
    const { fromDate, toDate } = JSON.parse(range)
    setSegmentRange({ fromDate, toDate })
    form.setFieldsValue({ occurredAt: null })
    resetPagination()
  }, [form, resetPagination])

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
                <Statistic title={localT('income')} value={formatTHB(totalIncome)} styles={{ content: { color: '#00c951' } }} />
              </Card>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Card variant="borderless">
                <Statistic title={localT('expense')} value={formatTHB(totalExpense)} styles={{ content: { color: '#fb2c36' } }} />
              </Card>
            </Col>
            <Col xs={24} md={24} lg={8}>
              <Card variant="borderless">
                <Statistic title={localT('profit-loss')} value={formatTHB(profit)} styles={{ content: { color: profit >= 0 ? '#00c951' : '#fb2c36' } }} />
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
            onChange={handleSegmentDateFilterChange}
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
                  label={localT('form.occurred-at.label')}
                  name="occurredAt"
                >
                  <DatePicker.RangePicker
                    className="!w-full"
                    placeholder={[
                      commonT("range-picker.start"),
                      commonT("range-picker.end")
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={localT('form.type.label')}
                  name="type"
                >
                  <Select
                    options={transactionTypeOptions}
                    allowClear
                    placeholder={localT('form.type.placeholder')}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={localT('form.category.label')}
                  name="category"
                >
                  <Select
                    allowClear
                    placeholder={localT('form.category.placeholder')}
                  />
                </Form.Item>
              </Col>
              <Col span={6} offset={18}>
                <Flex gap={16}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="w-full"
                  >
                    {commonT('filter.button-search')}
                  </Button>
                  <Button
                    htmlType="reset"
                    color="primary"
                    variant="outlined"
                    className="w-full"
                  >
                    {commonT('filter.button-clear')}
                  </Button>
                </Flex>
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
        onChange={handleTableChange}
        loading={isLoading}
        pagination={{
          current: pagination.page,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
        }}
      />
    </>
  )
}

export default IncomeAndExpense