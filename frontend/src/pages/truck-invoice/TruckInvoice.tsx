import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { truckinvoice as truckinvoiceModel } from '../../../wailsjs/go/models'
import { GetTruckInvoices } from '../../../wailsjs/go/main/App'
import { Pagination } from '../../utils/types'
import { TruckInvoiceFilter } from './interface'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../utils/constants'
import TruckInvoiceFormModal from './components/modal/TruckInvoiceFormModal'
import { Button, Space, Table, TableColumnsType, Tag, Tooltip } from 'antd'
import { useTranslation } from 'react-i18next'
import { formatDate } from '../../utils/formatter'
import { truncateString } from '../../utils/truncate'
import { getPaidStatusColor } from '../../utils/getTagColor'
import { Eye, ListFilter, PencilLine, Plus } from 'lucide-react'

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
        width: 150,
      },
      {
        title: localT('table.expense'),
        key: 'totalExpense',
        dataIndex: 'totalExpense',
        width: 150,
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
            {localT(`status.${status}`)}
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
              // onClick={() => handleViewDetail(record)}
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
    [localT, commonT]
  )

  useEffect(() => {
    loadInvoices()
  }, [loadInvoices])

  return (
    <>
      <TruckInvoiceFormModal
        isOpen={isOpenModalForm}
        onClose={() => { }}
        onChange={async () => { }}
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
    </>
  )
}

export default TruckInvoice