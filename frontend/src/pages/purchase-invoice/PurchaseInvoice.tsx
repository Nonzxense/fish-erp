import React, { useCallback, useEffect, useMemo, useState } from 'react'
import PurchaseInvoiceFormModal from './components/modal/PurchaseInvoiceFormModal'
import { App, Button, Card, Col, DatePicker, Dropdown, Flex, Form, Input, Row, Segmented, Space, Statistic, Table, TableColumnsType, TableProps, Tag, Tooltip } from 'antd'
import PageTitle from '../../components/page-title/PageTitle'
import { useTranslation } from 'react-i18next'
import { Eye, ListFilter, PencilLine, Plus } from 'lucide-react'
import { Pagination } from '../../utils/types'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../utils/constants'
import { InvoiceFilter, InvoiceFilterFormValues } from '../sale-invoice/interface'
import dayjs from 'dayjs'
import { invoice as invoiceModel } from '../../../wailsjs/go/models'
import { formatDate, formatTHB } from '../../utils/formatter'
import { getPaidStatusColor } from '../../utils/getTagColor'
import { ChangeInvoiceStatus, GetFishPurchaseInvoices, GetFishTradeInvoiceSummary } from '../../../wailsjs/go/main/App'
import PurchaseInvoiceDetailModal from './components/modal/PurchaseInvoiceDetailModal'
import { truncateString } from '../../utils/truncate'

const PurchaseInvoice = () => {
  const [isOpenModalForm, setIsOpenModalForm] = useState<boolean>(false)
  const [isShowFilters, setIsShowFilters] = useState<boolean>(false)
  const [segmentStatus, setSegmentStatus] = useState<string>('all')
  const [isOpenModalDetail, setIsOpenModalDetail] = useState<boolean>(false)
  const [invoiceSummary, setInvoiceSummary] = useState<invoiceModel.FishTradeInvoiceSummary>()
  const [invoices, setInvoices] = useState<invoiceModel.FishPurchaseInvoice[]>([])
  const [selectedInvoice, setSelectedInvoice] = useState<invoiceModel.FishPurchaseInvoice>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [filter, setFilter] = useState<InvoiceFilter>({})
  const [pagination, setPagination] = useState<Pagination>({
    page: DEFAULT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0
  })
  const { t: localT } = useTranslation('purchase-invoice')
  const { t: commonT } = useTranslation('common')
  const [form] = Form.useForm()
  const { modal, message } = App.useApp()

  const segmentOptions = useMemo(() => [
    { label: localT('status.all'), value: 'all' },
    { label: localT('status.pending'), value: 'pending' },
    { label: localT('status.paid'), value: 'paid' },
    { label: localT('status.cancelled'), value: 'cancelled' },
  ], [localT])

  const resetPagination = useCallback(() => {
    setPagination((prev) => ({
      ...prev,
      page: DEFAULT_PAGE,
      pageSize: DEFAULT_PAGE_SIZE,
    }))
  }, [])

  const handleSegmentStatusFilterChange = useCallback((status: string) => {
    setSegmentStatus(status)
    resetPagination()
  }, [resetPagination])

  const handleResetFilters = useCallback(() => {
    setFilter({})
  }, [])

  const handleSearchFilter = useCallback((filters: InvoiceFilterFormValues) => {
    const newFilters: InvoiceFilter = {
      id: filters.id ? filters.id : undefined,
      partyName: filters.partyName ? filters.partyName : undefined,
      fromDate: filters?.dateRange?.[0]
        ? dayjs(filters.dateRange[0]).startOf('day').toISOString()
        : null,
      toDate: filters?.dateRange?.[1] ? dayjs(filters.dateRange[1]).endOf('day').toISOString()
        : null,
    }
    setFilter(newFilters)
    resetPagination()
  }, [resetPagination])

  const handleTableChange: TableProps<invoiceModel.FishPurchaseInvoice>['onChange'] = (
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

  const handleEdit = useCallback((record: invoiceModel.FishPurchaseInvoice) => {
    setSelectedInvoice(record)
    setIsOpenModalForm(true)
  }, [])

  const handleViewDetail = useCallback((record: invoiceModel.FishPurchaseInvoice) => {
    setSelectedInvoice(record)
    setIsOpenModalDetail(true)
  }, [])

  const loadInvoices = useCallback(async () => {
    try {
      setIsLoading(true)
      const goFilter = new invoiceModel.InvoiceFilter({
        ...filter,
        status: segmentStatus === 'all' ? undefined : segmentStatus,
        page: pagination.page,
        pageSize: pagination.pageSize
      })
      const res = await GetFishPurchaseInvoices(goFilter)
      setPagination((prev) => ({
        ...prev,
        total: res.total
      }))
      setInvoices(res.data)
    } finally {
      setIsLoading(false)
    }
  }, [filter, pagination.page, pagination.pageSize, segmentStatus])

  const loadInvoiceSummary = useCallback(async () => {
    const res = await GetFishTradeInvoiceSummary('purchase')
    setInvoiceSummary({
      totalInvoice: res.totalInvoice,
      pending: res.pending,
      paid: res.paid
    })
  }, [])

  const handleChangeStatus = useCallback(
    (record: invoiceModel.FishPurchaseInvoice, newStatus: string) => {
      if (record.status === newStatus) return

      modal.confirm({
        title: localT('modal-status.title'),
        content: localT('modal-status.desc', {
          from: localT(`status.${record.status}`),
          to: localT(`status.${newStatus}`)
        }),
        okText: commonT('modal-common.ok'),
        cancelText: commonT('modal-common.cancel'),
        onOk: async () => {
          await ChangeInvoiceStatus("purchase", record.id, newStatus)
          message.success(localT('modal-status.success'))

          await loadInvoices()
          await loadInvoiceSummary()
        }
      })
    },
    [modal, localT, commonT, message, loadInvoices, loadInvoiceSummary]
  )

  const handleCloseInvoiceFormModal = useCallback(() => {
    setIsOpenModalForm(false)
    setSelectedInvoice(undefined)
  }, [])

  const handleFormModalChange = useCallback(async () => {
    await loadInvoices()
    await loadInvoiceSummary()
  }, [loadInvoiceSummary, loadInvoices])


  const columns: TableColumnsType<invoiceModel.FishPurchaseInvoice> = useMemo(
    () => [
      {
        title: commonT('invoice-no'),
        key: 'id',
        dataIndex: 'id',
        render: (text) => <span className="font-mono font-medium">{text}</span>
      },
      {
        title: localT('table.date'),
        key: 'createdAt',
        dataIndex: 'createdAt',
        render: (val) => formatDate(val)
      },
      {
        title: localT('table.supplier'),
        key: 'supplier',
        dataIndex: 'supplier',
        width: 180,
        render: (val) => val.name
      },
      {
        title: localT('table.note'),
        key: 'note',
        dataIndex: 'note',
        width: 250,
        render: (val) => truncateString(val, 50)
      },
      {
        title: localT('table.total'),
        key: 'totalAmount',
        dataIndex: 'totalAmount',
        align: 'right',
        render: (val) => formatTHB(val)
      },
      {
        title: localT('table.status'),
        key: 'status',
        dataIndex: 'status',
        align: 'center',
        width: 150,
        render: (status, record) => (
          <Dropdown
            trigger={['click']}
            menu={{
              onClick: ({ key }) => handleChangeStatus(record, key),
              items: [
                {
                  key: 'pending',
                  label: localT('status.pending'),
                },
                {
                  key: 'paid',
                  label: localT('status.paid'),
                },
                {
                  key: 'cancelled',
                  label: localT('status.cancelled'),
                }
              ]
            }}
          >
            <Tag
              color={getPaidStatusColor(status)}
              className="cursor-pointer px-3 py-1 text-sm"
            >
              {localT(`status.${status}`)}
            </Tag>
          </Dropdown>
        )
      },
      {
        title: localT('table.manage'),
        key: 'manage',
        align: 'center',
        width: 150,
        render: (_, record: invoiceModel.FishPurchaseInvoice) => (
          <Space>
            <Tooltip title={commonT('button-view')}>
              <Button
                icon={<Eye size={16} />}
                type="text"
                onClick={() => handleViewDetail(record)}
              />
            </Tooltip>
            <Tooltip title={commonT('button-edit')}>
              <Button
                icon={<PencilLine size={16} />}
                type="text"
                color="primary"
                variant="filled"
                onClick={() => handleEdit(record)}
                hidden={record.status !== 'pending'}
              />
            </Tooltip>
          </Space>
        )
      }
    ],
    [localT, handleChangeStatus, commonT, handleViewDetail, handleEdit]
  )

  useEffect(() => {
    loadInvoices()
    loadInvoiceSummary()
  }, [loadInvoiceSummary, loadInvoices])

  return (
    <>
      <PurchaseInvoiceDetailModal
        isOpen={isOpenModalDetail}
        onClose={() => setIsOpenModalDetail(false)}
        purchaseInvoice={selectedInvoice}
      />
      <PurchaseInvoiceFormModal
        isOpen={isOpenModalForm}
        onChange={handleFormModalChange}
        onClose={handleCloseInvoiceFormModal}
        purchaseInvoice={selectedInvoice}
      />
      <Space orientation="vertical" size="large" className="w-full">
        <Flex align="center" justify="space-between" className="w-full">
          <PageTitle
            title={localT('title')}
            subtitle={localT('subtitle')}
          />
        </Flex>
        <div className="w-full">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card variant="borderless">
                <Statistic
                  title={localT('stat.total-invoices')}
                  value={invoiceSummary?.totalInvoice}
                  styles={{ content: { color: '#1677ff' } }}
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card variant="borderless">
                <Statistic
                  title={localT('stat.pending')}
                  value={invoiceSummary?.pending}
                  styles={{ content: { color: '#faad14' } }}
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card variant="borderless">
                <Statistic
                  title={localT('stat.paid')}
                  value={invoiceSummary?.paid}
                  styles={{ content: { color: '#00c951' } }}
                />
              </Card>
            </Col>
          </Row>
        </div>
        <Flex justify="space-between" align="center" wrap="wrap" gap={16}>
          <Segmented
            options={segmentOptions}
            value={segmentStatus}
            onChange={handleSegmentStatusFilterChange}
            className="select-none"
          />
          <Space size="middle">
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
              onClick={() => setIsOpenModalForm(true)}
              size="large"
              icon={<Plus size={16} />}
              className="min-w-[140px] gradient-btn">
              {commonT('button-create')}
            </Button>
          </Space>
        </Flex>
      </Space>
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
                <Form.Item label={commonT('invoice-no')} name="id">
                  <Input placeholder={commonT('invoice-no')} allowClear />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label={localT('form.supplier.label')} name="partyName">
                  <Input placeholder={localT('form.supplier.placeholder')} allowClear />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label={localT('form.date-range.label')} name="dateRange">
                  <DatePicker.RangePicker className="w-full" />
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
        dataSource={invoices}
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

export default PurchaseInvoice