import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { truckinvoice as truckinvoiceModel } from '../../../wailsjs/go/models'
import { GetTruckInvoices } from '../../../wailsjs/go/main/App'
import { Pagination } from '../../utils/types'
import { TruckInvoiceFilter } from './interface'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../utils/constants'
import TruckInvoiceFormModal from './components/modal/TruckInvoiceFormModal'
import { Button, Card, Col, Flex, Row, Segmented, Space, Statistic, Table, TableColumnsType, Tag, Tooltip } from 'antd'
import { useTranslation } from 'react-i18next'
import { formatDate, formatTHB } from '../../utils/formatter'
import { truncateString } from '../../utils/truncate'
import { getPaidStatusColor } from '../../utils/getTagColor'
import { Eye, ListFilter, PencilLine, Plus } from 'lucide-react'
import PageTitle from '../../components/page-title/PageTitle'
import TruckInvoiceDetailModal from './components/modal/TruckInvoiceDetailModal'

const TruckInvoice = () => {
  const [isOpenModalForm, setIsOpenModalForm] = useState<boolean>(false)
  const [isShowFilters, setIsShowFilters] = useState<boolean>(false)
  const [segmentStatus, setSegmentStatus] = useState<string>('all')
  const [isOpenModalDetail, setIsOpenModalDetail] = useState<boolean>(false)
  // const [invoiceSummary, setInvoiceSummary] = useState<truckinvoice.TruckInvoiceSummary>()
  const [invoices, setInvoices] = useState<truckinvoiceModel.TruckInvoice[]>([])
  const [selectedInvoice, setSelectedInvoice] = useState<truckinvoiceModel.TruckInvoice>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [filter, setFilter] = useState<TruckInvoiceFilter>({})
  const [pagination, setPagination] = useState<Pagination>({
    page: DEFAULT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0
  })
  const { t: commonT } = useTranslation('common')
  const { t: localT } = useTranslation('truck-invoice')

  const segmentOptions = useMemo(() => [
    { label: commonT('filter.all'), value: 'all' },
    { label: commonT('invoice-status.pending'), value: 'pending' },
    { label: commonT('invoice-status.paid'), value: 'paid' },
    { label: commonT('invoice-status.cancelled'), value: 'cancelled' },
  ], [commonT])

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

  const loadInvoices = useCallback(async () => {
    try {
      setIsLoading(true)
      const goFilter = new truckinvoiceModel.TruckInvoiceFilter({
        ...filter,
        status: segmentStatus === 'all' ? undefined : segmentStatus,
        page: pagination.page,
        pageSize: pagination.pageSize
      })
      const res = await GetTruckInvoices(goFilter)
      setPagination((prev) => ({
        ...prev,
        total: res.total
      }))
      setInvoices(res.data)
    } finally {
      setIsLoading(false)
    }
  }, [filter, pagination.page, pagination.pageSize, segmentStatus])

  const handleCloseFormModal = useCallback(() => {
    setIsOpenModalForm(false)
    setSelectedInvoice(undefined)
  }, [])

  const handleViewDetail = useCallback((record: truckinvoiceModel.TruckInvoice) => {
    setSelectedInvoice(record)
    setIsOpenModalDetail(true)
  }, [])

  const handleFormModalChange = useCallback(async () => {
    loadInvoices()
  }, [loadInvoices])

  const columns: TableColumnsType<truckinvoiceModel.TruckInvoice> = useMemo(
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
        title: localT('table.note'),
        key: 'note',
        dataIndex: 'note',
        width: 250,
        render: (val) => truncateString(val, 50)
      },
      {
        title: localT('table.car-plate'),
        key: 'carPlate',
        dataIndex: 'carPlate',
        width: 150,
      },
      {
        title: localT('table.income'),
        key: 'totalIncome',
        dataIndex: 'totalIncome',
        align: "right",
        width: 150,
        render: (val) => (
          <span className='text-green-500'>
            {formatTHB(val)}
          </span>
        )
      },
      {
        title: localT('table.expense'),
        key: 'totalExpense',
        dataIndex: 'totalExpense',
        align: "right",
        width: 150,
        render: (val) => (
          <span className='text-red-500'>
            {formatTHB(val)}
          </span>
        )
      },
      {
        title: localT('table.status'),
        key: 'status',
        dataIndex: 'status',
        align: 'center',
        width: 150,
        render: (status) => (
          <Tag
            color={getPaidStatusColor(status)}
            className="cursor-pointer px-3 py-1 text-sm"
          >
            {commonT(`invoice-status.${status}`)}
          </Tag>
        )
      },
      {
        title: localT('table.manage'),
        key: 'manage',
        align: 'center',
        width: 150,
        render: (_, record: truckinvoiceModel.TruckInvoice) => (
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
                // onClick={() => handleEdit(record)}
                hidden={record.status !== 'pending'}
              />
            </Tooltip>
          </Space>
        )
      }
    ],
    [commonT, localT, handleViewDetail]
  )

  useEffect(() => {
    loadInvoices()
  }, [loadInvoices])

  return (
    <>
      <TruckInvoiceDetailModal
        isOpen={isOpenModalDetail}
        onClose={() => setIsOpenModalDetail(false)}
        id={selectedInvoice?.id}
      />
      <TruckInvoiceFormModal
        isOpen={isOpenModalForm}
        onClose={handleCloseFormModal}
        onChange={handleFormModalChange}
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
                  // value={invoiceSummary?.totalInvoice}
                  styles={{ content: { color: '#1677ff' } }}
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card variant="borderless">
                <Statistic
                  title={localT('stat.pending')}
                  // value={invoiceSummary?.pending}
                  styles={{ content: { color: '#faad14' } }}
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card variant="borderless">
                <Statistic
                  title={localT('stat.paid')}
                  // value={invoiceSummary?.paid}
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
        <Table
          columns={columns}
          dataSource={invoices}
          scroll={{ x: 'max-content' }}
          rowKey={(record) => record.id}
          // onChange={handleTableChange}
          loading={isLoading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
          }}
        />
      </Space>
    </>
  )
}

export default TruckInvoice