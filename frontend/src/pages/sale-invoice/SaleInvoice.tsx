import { App, Button, Card, Col, Flex, Form, Input, Row, Segmented, Space, Statistic, Table, TableColumnsType, Tooltip, Tag, DatePicker } from 'antd'
import PageTitle from '../../components/page-title/PageTitle'
import { useTranslation } from 'react-i18next'
import { ListFilter, PencilLine, Plus, Trash2, Eye, FileText } from 'lucide-react'
import React, { useCallback, useMemo, useState } from 'react'
import { DEFAULT_PAGE_SIZE } from '../../utils/constants'
import dayjs from 'dayjs'
import { formatTHB } from '../../utils/formatter'
import SaleInvoiceFormModal from './components/modal/SaleInvoiceFormModal'

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
  const [isLoading] = useState<boolean>(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [segmentStatus, setSegmentStatus] = useState<string>('all')

  const { t: localT } = useTranslation('invoice')
  const { t: commonT } = useTranslation('common')
  const [form] = Form.useForm()
  const { modal, message } = App.useApp()

  // --- Dummy Data ---
  const dummyInvoices: SaleInvoice[] = useMemo(() => [
    { id: 'INV-2023-001', date: '2023-10-25', customerName: 'John Doe', itemCount: 5, totalAmount: 1500.50, status: 'paid' },
    { id: 'INV-2023-002', date: '2023-10-26', customerName: 'Jane Smith', itemCount: 2, totalAmount: 450.00, status: 'pending' },
    { id: 'INV-2023-003', date: '2023-10-27', customerName: 'Somsak Move', itemCount: 10, totalAmount: 5200.00, status: 'overdue' },
  ], [])

  const segmentOptions = useMemo(() => [
    { label: commonT('status.all'), value: 'all' },
    { label: commonT('status.pending'), value: 'pending' },
    { label: commonT('status.paid'), value: 'paid' },
  ], [commonT])

  // --- Dummy Handlers ---
  const handleEdit = useCallback((record: SaleInvoice) => {
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

  const handleViewDetail = useCallback((record: SaleInvoice) => {
    message.info(`Viewing details for: ${record.id}`)
  }, [message])

  const columns: TableColumnsType<SaleInvoice> = useMemo(
    () => [
      {
        title: 'Bill No',
        key: 'id',
        dataIndex: 'id',
        render: (text) => <span className="font-mono font-medium">{text}</span>
      },
      {
        title: 'Date',
        key: 'date',
        dataIndex: 'date',
        sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
      },
      {
        title: 'Customer',
        key: 'customerName',
        dataIndex: 'customerName',
      },
      {
        title: 'Items',
        key: 'itemCount',
        dataIndex: 'itemCount',
        align: 'center',
      },
      {
        title: 'Total',
        key: 'totalAmount',
        dataIndex: 'totalAmount',
        align: 'right',
        render: (val) => formatTHB(val)
      },
      {
        title: 'Status',
        key: 'status',
        dataIndex: 'status',
        align: 'center',
        render: (status: SaleInvoice['status']) => {
          let color = 'default'
          if (status === 'paid') color = 'success'
          if (status === 'pending') color = 'processing'
          if (status === 'overdue') color = 'error'
          return <Tag color={color} className="capitalize">{status}</Tag>
        }
      },
      {
        title: commonT('table.manage'),
        key: 'manage',
        align: 'center',
        width: 150,
        render: (_, record: SaleInvoice) => (
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
    [handleViewDetail, handleEdit, handleDelete, commonT]
  )

  return (
    <>
      <SaleInvoiceFormModal isOpen={true} onChange={async () => {}} onClose={() => {}} />
      <Space orientation="vertical" size="large" className="w-full">
        <Flex align="center" justify="space-between" className="w-full">
          <PageTitle
            title="Sale Invoices"
            subtitle="Manage and track your customer billing"
          />
        </Flex>
        <div className="w-full">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card variant="borderless">
                <Statistic title="Total Invoices" value={dummyInvoices.length} prefix={<FileText size={18} />} />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card variant="borderless">
                <Statistic title="Pending Payment" value={1} valueStyle={{ color: '#1890ff' }} />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card variant="borderless">
                <Statistic title="Overdue" value={1} valueStyle={{ color: '#ff4d4f' }} />
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
              size="large"
              icon={<Plus size={16} />}
              className="min-w-[140px] gradient-btn">
              Create Invoice
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
        dataSource={dummyInvoices}
        rowKey="id"
        loading={isLoading}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        pagination={{
          defaultPageSize: DEFAULT_PAGE_SIZE,
          showSizeChanger: true,
        }}
        scroll={{ x: 'max-content' }}
      />
    </>
  )
}

export default SaleInvoice