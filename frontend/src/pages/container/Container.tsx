import {
  App, Button, Card, Col, Flex, Form, Input, Row,
  Select, Space, Table, TableColumnsType, TableProps, Tooltip, Typography
} from 'antd'
import PageTitle from '../../components/page-title/PageTitle'
import { useTranslation } from 'react-i18next'
import { ListFilter, Plus, Trash2, Package, PackageCheck, Users, PencilLine } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { container, dto } from '../../../wailsjs/go/models'
import ContainerFormModal from './components/modal/ContainerFormModal'
import { DeleteContainers, ListAtStore, GetContainerSummary, ListAtCustomer, GetContainers } from '../../../wailsjs/go/main/App'
import { ContainerFilter } from './interface'
import { Pagination } from '../../utils/types'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../utils/constants'
import useContainerColorOptions from '../../hooks/useContainerColorOptions'
import useContainerTypeOptions from '../../hooks/useContainerTypeOptions'
import StatCard from '../../components/StatCard'
import ContainerTag from '../../components/ContainerTag'

const { Text } = Typography

const Container = () => {
  const [isOpenModalForm, setIsOpenModalForm] = useState<boolean>(false)
  const [isShowFilters, setIsShowFilters] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [selectedContainerEdit, setSelectedContainerEdit] = useState<dto.ContainerListDTO>()
  const [containersAtStore, setContainersAtStore] = useState<dto.ContainerListDTO[]>([])
  const [containers, setContainers] = useState<container.Container[]>([])
  const [customers, setCustomers] = useState<dto.CustomerWithContainerDTO[]>([])
  const [totalContainer, setTotalContainer] = useState<number>(0)
  const [containerAtStoreCount, setContainerAtStoreCount] = useState<number>(0)
  const [containerWithCustomerCount, setContainerWithCustomerCount] = useState<number>(0)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [filter, setFilter] = useState<ContainerFilter>({})
  const [pagination, setPagination] = useState<Pagination>({
    page: DEFAULT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
  })

  const { t: localT } = useTranslation('container')
  const { t: commonT } = useTranslation('common')
  const [form] = Form.useForm()
  const { modal } = App.useApp()
  const colorOptions = useContainerColorOptions()
  const typeOptions = useContainerTypeOptions()

  const handleEditContainer = useCallback((container: dto.ContainerListDTO) => {
    setSelectedContainerEdit(container)
    setIsOpenModalForm(true)
  }, [])

  const columns: TableColumnsType<container.Container> = useMemo(
    () => [
      {
        title: localT('table.name'),
        key: 'name',
        dataIndex: 'name',
        width: 180,
      },
      {
        title: localT('table.id'),
        key: 'containerNo',
        dataIndex: 'containerNo',
        width: 180,
      },
      {
        title: localT('table.type'),
        key: 'type',
        dataIndex: 'type',
        width: 120,
        render: (val: string) => {
          const type = val.replace('_', '-')
          return (
            <Text>{commonT(type)}</Text>
          )
        }
      },
      {
        title: localT('table.color'),
        key: 'color',
        dataIndex: 'color',
        width: 120,
        render: (val: string) => (
          <Text>{commonT(`${val}`)}</Text>
        )
      },
      {
        title: localT('table.manage'),
        key: 'manage',
        align: 'center',
        width: 100,
        render: (_, record: container.Container) => {
          return (
            <Space>
              <Tooltip title={commonT('button-edit')}>
                <Button
                  icon={<PencilLine size={16} />}
                  variant="text"
                  color="primary"
                  onClick={() => handleEditContainer(record)}
                />
              </Tooltip>
            </Space>
          )
        }
      }
    ],
    [commonT, handleEditContainer, localT])

  const resetPagination = useCallback(() => {
    setPagination((prev) => ({ ...prev, page: DEFAULT_PAGE, pageSize: DEFAULT_PAGE_SIZE }))
  }, [])

  const handleCloseContainerFormModal = useCallback(() => {
    setSelectedContainerEdit(undefined)
    setIsOpenModalForm(false)
  }, [])

  const handleSearchFilter = useCallback((filters: ContainerFilter) => {
    setFilter(filters)
    resetPagination()
  }, [resetPagination])

  const handleResetFilters = useCallback(() => setFilter({}), [])

  const handleTableChange: TableProps<container.Container>['onChange'] = (
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

  const loadSummary = useCallback(async () => {
    const { total, atStore, withCustomer } = await GetContainerSummary()
    setTotalContainer(total)
    setContainerAtStoreCount(atStore)
    setContainerWithCustomerCount(withCustomer)
  }, [])

  const loadContainers = useCallback(async () => {
    const goFilter = new container.ContainerFilter({
      name: filter.name || undefined,
      containerNo: filter.containerNo ? Number(filter.containerNo) : undefined,
      type: filter.type ? filter.type : undefined,
      color: filter.color ? filter.color : undefined,
      page: pagination.page,
      pageSize: pagination.pageSize
    })
    const res = await GetContainers(goFilter)
    setContainers(res.data)
    setPagination((prev) => ({
      ...prev,
      total: res.total
    }))
  }, [filter.name, filter.color, filter.containerNo, filter.type, pagination.page, pagination.pageSize])

  const loadAtStore = useCallback(async () => {
    const data = await ListAtStore()
    setContainersAtStore(data)
  }, [])

  const loadAtCustomers = useCallback(async () => {
    const res = await ListAtCustomer()
    setCustomers(res)
  }, [])

  const loadAll = useCallback(async () => {
    try {
      setIsLoading(true)

      await Promise.all([
        loadSummary(),
        loadAtCustomers(),
        loadAtStore(),
        loadContainers(),
      ])
    } finally {
      setIsLoading(false)
    }
  }, [
    loadSummary,
    loadAtCustomers,
    loadAtStore,
    loadContainers,
  ])

  const handleBulkDelete = useCallback(async () => {
    modal.confirm({
      title: commonT('modal-delete.title'),
      content: commonT('modal-delete.desc', { amount: selectedRowKeys.length }),
      okText: commonT('modal-common.ok'),
      cancelText: commonT('modal-common.cancel'),
      okButtonProps: { danger: true },
      onOk: async () => {
        await DeleteContainers(selectedRowKeys.map((id) => Number(id)))
        setSelectedRowKeys([])
        resetPagination()
        await loadAtStore()
      },
    })
  }, [modal, commonT, selectedRowKeys, resetPagination, loadAtStore])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  return (
    <>

      <ContainerFormModal
        isOpen={isOpenModalForm}
        onClose={handleCloseContainerFormModal}
        onChange={async () => loadAll()}
        container={selectedContainerEdit}
      />

      {/* -- Header -- */}
      <Flex
        align="flex-start"
        className="mb-7"
      >
        <PageTitle title={localT('title')} subtitle={localT('subtitle')} />
      </Flex>

      {/* -- Stat Cards -- */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={8}>
          <StatCard
            variant="info"
            title={localT('all')}
            value={totalContainer}
            icon={<Package size={18} />}
          />
        </Col>
        <Col xs={24} md={8}>
          <StatCard
            variant="success"
            title={localT('at-store')}
            value={containerAtStoreCount}
            icon={<PackageCheck size={18} />}
          />
        </Col>
        <Col xs={24} md={8}>
          <StatCard
            variant="purple"
            title={localT('with-customer')}
            value={containerWithCustomerCount}
            icon={<Users size={18} />}
          />
        </Col>
      </Row>

      {/* -- Container Panels -- */}
      <Row gutter={[16, 16]} className="mb-6">
        {/* At Store */}
        <Col xs={24} lg={12}>
          <div className="bg-white border-[1.5px] border-green-200 rounded-xl overflow-hidden h-full">
            <div className="px-5 py-3.5 border-b border-green-100 bg-green-50 flex items-center justify-between">
              <Flex align="center" gap={8}>
                <PackageCheck size={15} className="text-green-600" />
                <Text className="font-semibold text-green-700 text-sm">
                  {localT('at-store')}
                </Text>
              </Flex>
              <span className="bg-green-100 text-green-700 border border-green-200 rounded-full px-2.5 py-0.5 text-xs font-medium">
                {containersAtStore.length}
              </span>
            </div>
            <div className="p-4 px-5 flex flex-wrap gap-2">
              {containersAtStore.length === 0
                ? <Text className="text-slate-400 italic text-[13px]">No containers</Text>
                : containersAtStore.map(c => (
                  <ContainerTag key={c.id} name={c.name} containerNo={c.containerNo} color={c.color} type={c.type} />
                ))
              }
            </div>
          </div>
        </Col>

        {/* With Customers */}
        <Col xs={24} lg={12}>
          <div className="bg-white border-[1.5px] border-purple-200 rounded-xl overflow-hidden h-full">
            <div className="px-5 py-3.5 border-b border-purple-100 bg-purple-50 flex items-center justify-between">
              <Flex align="center" gap={8}>
                <Users size={15} className="text-purple-600" />
                <Text className="font-semibold text-sm text-purple-700">
                  {localT('with-customer')}
                </Text>
              </Flex>
              <span className="bg-purple-100 text-purple-700 border border-purple-200 rounded-full px-2.5 py-0.5 text-xs font-medium">
                {customers.length}
              </span>
            </div>
            <div
              className="py-3 px-5 flex flex-col gap-3.5"
            >
              {customers.length === 0
                ? <Text className="text-slate-400 italic text-[13px]">No customers</Text>
                : customers.map((customer, idx) => (
                  <div key={customer.id}>
                    {idx > 0 && <div className="h-px bg-slate-100 mb-3.5" />}
                    <Flex align="center" gap={8} className="mb-2">
                      <div className="w-[26px] h-[26px] rounded-lg bg-violet-100 border border-violet-200 flex items-center justify-center text-[11px] font-bold text-violet-600">
                        {customer.name?.[0]?.toUpperCase()}
                      </div>
                      <Text strong className="text-[13px]">
                        {customer.name}
                      </Text>
                      <span style={{
                        fontFamily: "'DM Mono', monospace",
                      }}
                        className="ml-auto text-slate-400 text-[11px] "
                      >
                        {customer.containers?.length ?? 0} units
                      </span>
                    </Flex>
                    <div className="flex flex-wrap gap-1.5 pl-[34px]">
                      {customer.containers?.map(container => (
                        <ContainerTag
                          key={container.id}
                          name={container.name}
                          containerNo={container.containerNo}
                          color={container.color}
                          type={container.type}
                        />
                      ))}
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </Col>
      </Row>

      <Flex
        align="flex-start"
        justify="end"
        wrap="wrap"
        className="mb-6 w-full"
      >
        <Space size="middle" wrap>
          {selectedRowKeys.length > 0 && (
            <Button
              onClick={handleBulkDelete}
              size="large"
              icon={<Trash2 size={15} />}
              danger
              className="min-w-[140px]"
            >
              {commonT('button-delete')} ({selectedRowKeys.length})
            </Button>
          )}

          <Button
            onClick={() => setIsShowFilters((v) => !v)}
            size="large"
            icon={<ListFilter size={15} />}
            variant="outlined"
            color="primary"
            className="min-w-[140px]"
          >
            {commonT('button-filter')}
          </Button>
          <Button
            onClick={() => setIsOpenModalForm(true)}
            size="large"
            icon={<Plus size={15} />}
            type="primary"
            className="gradient-btn min-w-36"
          >
            {commonT('button-create')}
          </Button>
        </Space >
      </Flex >

      {/* -- Collapsible Filters -- */}
      <div
        className="overflow-hidden transition-all duration-300"
        style={{
          maxHeight: isShowFilters ? 400 : 0,
          opacity: isShowFilters ? 1 : 0,
          marginBottom: isShowFilters ? 24 : 0,
        }}
      >
        <Card
          className="bg-slate-50 border-[1.5px] border-slate-200 rounded-xl"
        >
          <Form form={form} layout="vertical" onReset={handleResetFilters} onFinish={handleSearchFilter}>
            <Row gutter={16} align="bottom">
              <Col xs={24} sm={12} md={6}>
                <Form.Item label={localT('form.name_filter.label')} name="name">
                  <Input allowClear placeholder={localT('form.name_filter.placeholder')} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item label={localT('form.id.label')} name="containerNo">
                  <Input allowClear placeholder={localT('form.id.placeholder')} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item label={localT('form.type.label')} name="type">
                  <Select options={typeOptions} allowClear placeholder={localT('form.type.placeholder')} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item label={localT('form.color.label')} name="color">
                  <Select options={colorOptions} allowClear placeholder={localT('form.color.placeholder')} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item label=" ">
                  <Flex gap={10}>
                    <Button type="primary" htmlType="submit" className="w-full">
                      {commonT('filter.button-search')}
                    </Button>
                    <Button htmlType="reset" color="primary" variant="outlined" className="w-full">
                      {commonT('filter.button-clear')}
                    </Button>
                  </Flex>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
      </div >

      {/* All Containers Table */}
      < Table
        columns={columns}
        dataSource={containers}
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

export default Container