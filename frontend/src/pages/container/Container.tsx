import { App, Button, Card, Col, Flex, Form, Input, Row, Segmented, Select, Space, Statistic, Table, TableColumnsType, TableProps, Tooltip, Typography } from 'antd'
import PageTitle from '../../components/page-title/PageTitle'
import { useTranslation } from 'react-i18next'
import { ListFilter, PencilLine, Plus, Trash2 } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { container } from '../../../wailsjs/go/models'
import ContainerFormModal from './components/modal/ContainerFormModal'
import { DeleteContainers, GetContainers, GetContainerSummary } from '../../../wailsjs/go/main/App'
import { ContainerFilter } from './interface'
import { Pagination } from '../../utils/types'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../utils/constants'

const { Text } = Typography

const Container = () => {
  const [isOpenModalForm, setIsOpenModalForm] = useState<boolean>(false)
  const [isShowFilters, setIsShowFilters] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [selectedContainerEdit, setSelectedContainerEdit] = useState<container.Container>()
  const [containers, setContainers] = useState<container.Container[]>([])
  const [totalContainer, setTotalContainer] = useState<number>(0)
  const [containerAtStore, setContainerAtStore] = useState<number>(0)
  const [containerWithCustomer, setContainerWithCustomer] = useState<number>(0)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [filter, setFilter] = useState<ContainerFilter>({})
  const [segmentStatus, setSegmentStatus] = useState<string>('all')
  const [pagination, setPagination] = useState<Pagination>({
    page: DEFAULT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0
  })
  const { t: localT } = useTranslation('container')
  const { t: commonT } = useTranslation('common')
  const [form] = Form.useForm()
  const { modal } = App.useApp()

  const containerColorOptions = useMemo(() => [
    {
      label: localT('color.blue'),
      value: 'blue'
    },
    {
      label: localT('color.light-green'),
      value: 'light-green'
    },
    {
      label: localT('color.green'),
      value: 'green'
    },
    {
      label: localT('color.orange'),
      value: 'orange'
    },
    {
      label: localT('color.yellow'),
      value: 'yellow'
    },
    {
      label: localT('color.red'),
      value: 'red'
    },
  ], [localT])

  const segmentOptions = useMemo(() => [
    {
      label: localT('all'),
      value: 'all'
    },
    {
      label: localT('at-store'),
      value: 'at_store'
    },
    {
      label: localT('with-customer'),
      value: 'with_customer'
    },
  ], [localT])

  const typeOptions = useMemo(() => [
    { label: commonT('plastic-l'), value: 'plastic_l' },
    { label: commonT('plastic-s'), value: 'plastic_s' },
    { label: commonT('foam-l'), value: 'foam_l' },
    { label: commonT('foam-m'), value: 'foam_m' },
    { label: commonT('foam-s'), value: 'foam_s' },
  ], [commonT])

  const handleEditContainer = useCallback((container: container.Container) => {
    setSelectedContainerEdit(container)
    setIsOpenModalForm(true)
  }, [])

  const columns: TableColumnsType<container.Container> = useMemo(
    () => [
      {
        title: localT('table.id'),
        key: 'id',
        dataIndex: 'id',
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
          <Text>{localT(`color.${val}`)}</Text>
        )
      },
      {
        title: localT('table.status'),
        key: 'status',
        dataIndex: 'status',
        width: 120,
        render: (val: string) => {
          const status = val.replace('_', '-')
          return (
            <Text>{localT(status)}</Text>
          )
        }
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
    setPagination((prev) => ({
      ...prev,
      page: DEFAULT_PAGE,
      pageSize: DEFAULT_PAGE_SIZE,
    }))
  }, [])

  const handleCloseContainerFormModal = useCallback(() => {
    setSelectedContainerEdit(undefined)
    setIsOpenModalForm(false)
  }, [])

  const handleSearchFilter = useCallback((filters: ContainerFilter) => {
    setFilter(filters)
    resetPagination()
  }, [resetPagination])

  const handleResetFilters = useCallback(() => {
    setFilter({})
  }, [])

  const handleSegmentStatusFilterChange = useCallback((status: string) => {
    setSegmentStatus(status)
    resetPagination()
  }, [resetPagination])

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

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => {
      setSelectedRowKeys(keys)
    },
  }

  const loadContainers = useCallback(async () => {
    try {
      setIsLoading(true)
      const goFilter = new container.ContainerFilter({
        id: filter.id ? Number(filter.id) : undefined,
        type: filter.type ? filter.type : undefined,
        color: filter.color ? filter.color : undefined,
        status: segmentStatus === 'all' ? undefined : segmentStatus,
        page: pagination.page,
        pageSize: pagination.pageSize
      })
      const res = await GetContainers(goFilter)
      const { total, atStore, withCustomer } = await GetContainerSummary()
      setContainers(res.data)
      setPagination((prev) => ({
        ...prev,
        total: res.total
      }))
      setTotalContainer(total)
      setContainerAtStore(atStore)
      setContainerWithCustomer(withCustomer)
    } finally {
      setIsLoading(false)
    }
  }, [filter.color, filter.id, filter.type, pagination.page, pagination.pageSize, segmentStatus])

  const handleBulkDelete = useCallback(async () => {
    modal.confirm({
      title: commonT('modal-delete.title'),
      content: commonT('modal-delete.desc', { amount: selectedRowKeys.length }),
      okText: commonT('modal-common.ok'),
      cancelText: commonT('modal-common.cancel'),
      okButtonProps: { danger: true },
      onOk: async () => {
        await DeleteContainers((selectedRowKeys).map((id) => Number(id)))
        setSelectedRowKeys([])
        resetPagination()
        await loadContainers()
      },
    })
  }, [modal, commonT, selectedRowKeys, resetPagination, loadContainers])

  useEffect(() => {
    loadContainers()
  }, [loadContainers])

  return (
    <>
      <ContainerFormModal
        isOpen={isOpenModalForm}
        onClose={handleCloseContainerFormModal}
        onChange={loadContainers}
        container={selectedContainerEdit}
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
                <Statistic title={localT('all')} value={totalContainer} />
              </Card>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Card variant="borderless">
                <Statistic title={localT('at-store')} value={containerAtStore} />
              </Card>
            </Col>
            <Col xs={24} md={24} lg={8}>
              <Card variant="borderless">
                <Statistic title={localT('with-customer')} value={containerWithCustomer} />
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
          <Segmented
            options={segmentOptions}
            value={segmentStatus}
            onChange={handleSegmentStatusFilterChange}
            className="select-none"
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
                <Form.Item
                  label={localT('form.id.label')}
                  name="id"
                >
                  <Input
                    allowClear
                    placeholder={localT('form.id.placeholder')}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={localT('form.type.label')}
                  name="type"
                >
                  <Select
                    options={typeOptions}
                    allowClear
                    placeholder={localT('form.type.placeholder')}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={localT('form.color.label')}
                  name="color"
                >
                  <Select
                    options={containerColorOptions}
                    allowClear
                    placeholder={localT('form.color.placeholder')}
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