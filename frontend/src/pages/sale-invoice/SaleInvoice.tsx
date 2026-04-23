import { App, Button, Card, Col, Flex, Form, Input, Row, Segmented, Space, Statistic, Table, TableColumnsType, Tooltip, Tag, DatePicker, TableProps } from 'antd'
import PageTitle from '../../components/page-title/PageTitle'
import { useTranslation } from 'react-i18next'
import { ListFilter, PencilLine, Plus, Trash2, Eye, FileText } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../utils/constants'
import { formatDate, formatTHB } from '../../utils/formatter'
import SaleInvoiceFormModal from './components/modal/SaleInvoiceFormModal'
import { invoice as invoiceModel } from '../../../wailsjs/go/models'
import { InvoiceFilter } from './interface'
import { Pagination } from '../../utils/types'
import { GetFishTradeInvoices } from '../../../wailsjs/go/main/App'
import { getPaidStatusColor } from '../../utils/getTagColor'

// Interface representing a Sale Invoice
interface SaleInvoice {
  id: string;          // Bill No
  date: string;
  customerName: string;
  itemCount: number;
  totalAmount: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
}

const SaleInvoice = () => {
  const [isShowFilters, setIsShowFilters] = useState<boolean>(false)
  const [filter, setFilter] = useState<InvoiceFilter>({})
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isOpenModalForm, setIsOpenModalForm] = useState<boolean>(false)
  const [invoices, setInvoices] = useState<invoiceModel.FishTradeInvoice[]>([])
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
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
  ], [localT])

  // --- Dummy Handlers ---
  const handleEdit = useCallback((record: invoiceModel.FishTradeInvoice) => {
    message.info(`Editing invoice: ${record.id}`)
  }, [message])

  const handleDelete = useCallback((id: string) => {
    modal.confirm({
      title: commonT('modal-delete.title'),
      content: commonT('modal-delete.desc', { amount: 1 }),
      okText: commonT('modal-common.ok'),
      okButtonProps: { danger: true },
      onOk: () => message.success('Invoice deleted successfully')
    })
  }, [modal, commonT, message])

  const handleViewDetail = useCallback((record: invoiceModel.FishTradeInvoice) => {
    message.info(`Viewing details for: ${record.id}`)
  }, [message])

  const columns: TableColumnsType<invoiceModel.FishTradeInvoice> = useMemo(
    () => [
      {
        title: localT('table.invoice-no'),
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
        title: localT('table.items'),
        key: 'itemCount',
        align: 'center',
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
        render: (status: SaleInvoice['status']) => {
          return <Tag color={getPaidStatusColor(status)} variant="outlined" >{localT(`status.${status}`)}</Tag>
        }
      },
      {
        title: localT('table.manage'),
        key: 'manage',
        align: 'center',
        width: 150,
        render: (_, record: invoiceModel.FishTradeInvoice) => (
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
              />
            </Tooltip>
            <Tooltip title={commonT('button-delete')}>
              <Button
                icon={<Trash2 size={16} />}
                type="text"
                danger
                onClick={() => handleDelete(record.id)}
              />
            </Tooltip>
          </Space>
        )
      }
    ],
    [localT, commonT, handleViewDetail, handleEdit, handleDelete]
  )

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => {
      setSelectedRowKeys(keys)
    },
  }

  const handleCloseInvoiceFormModal = useCallback(() => {
    setIsOpenModalForm(false)
  }, [])

  const handleTableChange: TableProps<invoiceModel.FishTradeInvoice>['onChange'] = (
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

  const loadInvoices = useCallback(async () => {
    try {
      setIsLoading(true)
      const goFilter = new invoiceModel.InvoiceFilter({
        ...filter,
        page: pagination.page,
        pageSize: pagination.pageSize
      })
      const res = await GetFishTradeInvoices(goFilter)

      setPagination((prev) => ({
        ...prev,
        total: res.total
      }))
      setInvoices(res.data)
    } finally {
      setIsLoading(false)
    }
  }, [filter, pagination.page, pagination.pageSize])

  useEffect(() => {
    loadInvoices()
  }, [loadInvoices])

  return (
    <>
      <SaleInvoiceFormModal isOpen={isOpenModalForm} onChange={loadInvoices} onClose={handleCloseInvoiceFormModal} />
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
                <Statistic title="Total Invoices" value={invoices.length} prefix={<FileText size={18} />} />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card variant="borderless">
                <Statistic title="Pending Payment" value={1} styles={{ content: { color: '#1890ff' } }} />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card variant="borderless">
                <Statistic title="Overdue" value={1} styles={{ content: { color: '#ff4d4f' } }} />
              </Card>
            </Col>
          </Row>
        </div>
        <Flex justify="space-between" align="center" wrap="wrap" gap={16}>
          <Segmented
            options={segmentOptions}
            value={segmentStatus}
            onChange={(val) => setSegmentStatus(val as string)}
            className="select-none"
          />
          <Space size="middle">
            {selectedRowKeys.length > 0 && (
              <Button size="large" icon={<Trash2 size={16} />} danger className="min-w-[140px]">
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
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item label="Bill No" name="id">
                  <Input placeholder="Search invoice number" allowClear />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="Customer" name="customer">
                  <Input placeholder="Search customer" allowClear />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="Date Range" name="dateRange">
                  <DatePicker.RangePicker className="w-full" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label=" " className="mb-0">
                  <Flex gap={8} justify="end">
                    <Button type="primary">Search</Button>
                    <Button variant="outlined" onClick={() => form.resetFields()}>Clear</Button>
                  </Flex>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
      </div>
      <Table
        columns={columns}
        dataSource={invoices}
        rowKey="id"
        loading={isLoading}
        scroll={{ x: 'max-content' }}
        rowSelection={rowSelection}
        pagination={{
          current: pagination.page,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
        }}
        onChange={handleTableChange}
      />
    </>
  )
}

export default SaleInvoice