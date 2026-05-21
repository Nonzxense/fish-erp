import { App, Button, Card, Col, Flex, Form, Input, Row, Segmented, Space, Statistic, Table, TableColumnsType, Tooltip } from 'antd'
import PageTitle from '../../components/page-title/PageTitle'
import { useTranslation } from 'react-i18next'
import { ListFilter, PencilLine, Plus, Trash2, Eye, Wallet } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../utils/constants'
import PartyFormModal from './components/modal/PartyFormModal'
import { party, payment } from '../../../wailsjs/go/models'
import { PartyFilter } from './interface'
import { AllocatePaymentFIFO, GetParties } from '../../../wailsjs/go/main/App'
import { Pagination } from '../../utils/types'
import { formatTHB } from '../../utils/formatter'
import dayjs from 'dayjs'
import PaymentModal from './components/modal/PaymentModal'
import { useNavigate } from 'react-router-dom'

const Party = () => {
  const [parties, setParties] = useState<party.PartyWithDebt[]>([])
  const [isShowFilters, setIsShowFilters] = useState<boolean>(false)
  const [isOpenModalForm, setIsOpenModalForm] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [filter, setFilter] = useState<PartyFilter>({})
  const [selectedParty, setSelectedParty] = useState<party.PartyWithDebt>()
  const [isOpenPaymentModal, setIsOpenPaymentModal] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [segmentStatus, setSegmentStatus] = useState<string>('all')
  const [pagination, setPagination] = useState<Pagination>({
    page: DEFAULT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0
  })

  const { t: localT } = useTranslation('party')
  const { t: commonT } = useTranslation('common')
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const { modal, message } = App.useApp()

  const segmentOptions = useMemo(() => [
    { label: localT('all'), value: 'all' },
    { label: localT('overdue'), value: 'overdue' },
  ], [localT])

  // --- Dummy Handlers ---
  const handleEdit = useCallback((record: party.Party) => {
    message.info(`${commonT('message.editing')} ${record.name}`)
  }, [message, commonT])

  const handleReceivePayment = useCallback(
    (record: party.PartyWithDebt) => {
      setSelectedParty(record)
      setIsOpenPaymentModal(true)
    },
    []
  )

  const handleDelete = useCallback((id: string) => {
    modal.confirm({
      title: commonT('modal-delete.title'),
      content: commonT('modal-delete.desc', { amount: 1 }),
      okText: commonT('modal-common.ok'),
      cancelText: commonT('modal-common.cancel'),
      okButtonProps: { danger: true },
      onOk: () => {

        message.success(commonT('message.delete-success'))
      }
    })
  }, [message, modal, commonT])

  const handleViewDetail = useCallback((record: party.PartyWithDebt) => {
    navigate(record.id)
  }, [navigate])

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => {
      setSelectedRowKeys(keys)
    },
  }

  const columns: TableColumnsType<party.PartyWithDebt> = useMemo(
    () => [
      {
        title: localT('table.name'),
        key: 'name',
        dataIndex: 'name',
        sorter: (a, b) => a.name.localeCompare(b.name),
      },
      {
        title: localT('table.phone'),
        key: 'phone',
        dataIndex: 'phone',
        width: 150,
      },
      {
        title: localT('table.note'),
        key: 'note',
        dataIndex: 'note',
        ellipsis: true,
      },
      {
        title: localT('table.overdue-amount'),
        key: 'totalDebt',
        dataIndex: 'totalDebt',
        ellipsis: true,
        align: 'right',
        render: (val) => (
          <span className="text-red-500">
            {formatTHB(val)}
          </span>
        )
      },
      {
        title: localT('table.manage'),
        key: 'manage',
        align: 'center',
        width: 150,
        render: (_, record: party.PartyWithDebt) => (
          <Space>
            <Tooltip title={commonT('button-view')}>
              <Button
                icon={<Eye size={16} />}
                variant="text"
                onClick={() => handleViewDetail(record)}
              />
            </Tooltip>
            <Tooltip title={localT('button.receive-payment')}>
              <Button
                icon={<Wallet size={16} />}
                variant="text"
                color="green"
                onClick={() => handleReceivePayment(record)}
              />
            </Tooltip>
            <Tooltip title={commonT('button-edit')}>
              <Button
                icon={<PencilLine size={16} />}
                variant="text"
                color="primary"
                onClick={() => handleEdit(record)}
              />
            </Tooltip>
            <Tooltip title={commonT('button-delete')}>
              <Button
                icon={<Trash2 size={16} />}
                variant="text"
                danger
                onClick={() => handleDelete(record.id)}
              />
            </Tooltip>
          </Space>
        )
      }
    ],
    [localT, commonT, handleViewDetail, handleEdit, handleReceivePayment, handleDelete]
  )

  const loadParties = useCallback(async () => {
    try {
      setIsLoading(true)
      const goFilter = new party.PartyFilter({
        name: filter.name ? filter.name : undefined,
        type: filter.type ? filter.type : undefined,
        phone: filter.phone ? filter.phone : undefined,
        page: pagination.page,
        pageSize: pagination.pageSize
      })
      const res = await GetParties(goFilter)
      setParties(res.data)
      setPagination((prev) => ({
        ...prev,
        total: res.total
      }))
    } finally {
      setIsLoading(false)
    }
  }, [filter.name, filter.phone, filter.type, pagination.page, pagination.pageSize])

  useEffect(() => {
    loadParties()
  }, [loadParties])
  return (
    <>
      <PaymentModal
        isOpen={isOpenPaymentModal}
        onClose={() => setIsOpenPaymentModal(false)}
        party={selectedParty}
        onSuccess={loadParties}
      />
      <PartyFormModal
        isOpen={isOpenModalForm}
        onClose={() => setIsOpenModalForm(false)}
        onChange={loadParties}
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
            <Col xs={24} md={12}>
              <Card variant="borderless">
                <Statistic title={localT('overdue')} value={1} />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card variant="borderless">
                <Statistic title={localT('overdue-amount')} value={1} />
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
              <Button
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
              size="large"
              icon={<Plus size={16} />}
              onClick={() => setIsOpenModalForm(true)}
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
              <Col span={8}>
                <Form.Item label={localT('form.name.label')} name="name">
                  <Input placeholder={localT('form.name.placeholder')} allowClear />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label={localT('form.phone.label')} name="phone">
                  <Input placeholder={localT('form.phone.placeholder')} allowClear />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Flex gap={16} justify="end">
                  <Button type="primary">{commonT('filter.button-search')}</Button>
                  <Button variant="outlined" onClick={() => form.resetFields()}>
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
        dataSource={parties}
        scroll={{ x: 'max-content' }}
        rowKey={(record) => record.id}
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

export default Party