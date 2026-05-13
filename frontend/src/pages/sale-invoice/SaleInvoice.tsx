import { App, Button, Card, Col, Flex, Form, Input, Row, Segmented, Space, Statistic, Table, TableColumnsType, Tooltip, Tag, DatePicker, TableProps, Dropdown } from 'antd'
import PageTitle from '../../components/page-title/PageTitle'
import { useTranslation } from 'react-i18next'
import { ListFilter, PencilLine, Plus, Eye } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../utils/constants'
import { formatDate, formatTHB } from '../../utils/formatter'
import SaleInvoiceFormModal from './components/modal/SaleInvoiceFormModal'
import { invoice as invoiceModel } from '../../../wailsjs/go/models'
import { InvoiceFilter, InvoiceFilterFormValues } from './interface'
import { Pagination } from '../../utils/types'
import { ChangeInvoiceStatus, GetFishSaleInvoices, GetFishTradeInvoiceSummary } from '../../../wailsjs/go/main/App'
import { getPaidStatusColor } from '../../utils/getTagColor'
import SaleInvoiceDetailModal from './components/modal/SaleInvoiceDetailModal'
import dayjs from 'dayjs'

const SaleInvoice = () => {
  const [isShowFilters, setIsShowFilters] = useState<boolean>(false)
  const [filter, setFilter] = useState<InvoiceFilter>({})
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isOpenModalForm, setIsOpenModalForm] = useState<boolean>(false)
  const [isOpenModalDetail, setIsOpenModalDetail] = useState<boolean>(false)
  const [invoices, setInvoices] = useState<invoiceModel.FishSaleInvoice[]>([])
  const [invoiceSummary, setInvoiceSummary] = useState<invoiceModel.FishTradeInvoiceSummary>()
  const [selectedInvoice, setSelectedInvoice] = useState<invoiceModel.FishSaleInvoice>()
  const [segmentStatus, setSegmentStatus] = useState<string>('all')
  const [pagination, setPagination] = useState<Pagination>({
    page: DEFAULT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0
  })
  const { t: localT } = useTranslation('sale-invoice')
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

  const handleEdit = useCallback((record: invoiceModel.FishSaleInvoice) => {
    setSelectedInvoice(record)
    setIsOpenModalForm(true)
  }, [])

  const handleViewDetail = useCallback((record: invoiceModel.FishSaleInvoice) => {
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
      const res = await GetFishSaleInvoices(goFilter)
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
    const res = await GetFishTradeInvoiceSummary('sale')
    setInvoiceSummary({
      totalInvoice: res.totalInvoice,
      pending: res.pending,
      paid: res.paid
    })
  }, [])

  const handleCloseInvoiceFormModal = useCallback(() => {
    setIsOpenModalForm(false)
    setSelectedInvoice(undefined)
  }, [])

  const handleFormModalChange = useCallback(async () => {
    await loadInvoices()
    await loadInvoiceSummary()
  }, [loadInvoiceSummary, loadInvoices])

  const handleCloseInvoiceViewModal = useCallback(() => {
    setIsOpenModalDetail(false)
    setSelectedInvoice(undefined)
  }, [])

  const handleTableChange: TableProps<invoiceModel.FishSaleInvoice>['onChange'] = (
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

  const handleChangeStatus = useCallback(
    (record: invoiceModel.FishSaleInvoice, newStatus: string) => {
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
          await ChangeInvoiceStatus("sale", record.id, newStatus)
          message.success(localT('modal-status.success'))

          await loadInvoices()
          await loadInvoiceSummary()
        }
      })
    },
    [modal, localT, commonT, message, loadInvoices, loadInvoiceSummary]
  )

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

  const handleResetFilters = useCallback(() => {
    setFilter({})
  }, [])

  const handleSegmentStatusFilterChange = useCallback((status: string) => {
    setSegmentStatus(status)
    resetPagination()
  }, [resetPagination])

  const columns: TableColumnsType<invoiceModel.FishSaleInvoice> = useMemo(
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
        title: localT('table.customer'),
        key: 'customer',
        dataIndex: 'customer',
        render: (val) => val.name
      },
      {
        title: localT('table.note'),
        key: 'note',
        dataIndex: 'note',
        width: 250,
        ellipsis: true
      },
      {
        title: localT('table.items'),
        key: 'itemCount',
        align: 'right',
        width: 100,
        render: (_, record) => record.items?.length || 0
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
        render: (_, record: invoiceModel.FishSaleInvoice) => (
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
      <SaleInvoiceFormModal
        isOpen={isOpenModalForm}
        onChange={handleFormModalChange}
        onClose={handleCloseInvoiceFormModal}
        saleInvoice={selectedInvoice}
      />
      <SaleInvoiceDetailModal
        isOpen={isOpenModalDetail}
        onClose={handleCloseInvoiceViewModal}
        saleInvoice={selectedInvoice}
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
                <Form.Item label={localT('form.customer.label')} name="partyName">
                  <Input placeholder={localT('form.customer.placeholder')} allowClear />
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

export default SaleInvoice