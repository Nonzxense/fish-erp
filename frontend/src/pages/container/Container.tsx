import {
  App, Button, Card, Col, Flex, Form, Input, Row,
  Select, Space, Typography
} from 'antd'
import PageTitle from '../../components/page-title/PageTitle'
import { useTranslation } from 'react-i18next'
import { ListFilter, Plus, Trash2, Package, PackageCheck, Users } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'
import { dto } from '../../../wailsjs/go/models'
import ContainerFormModal from './components/modal/ContainerFormModal'
import { DeleteContainers, ListAtStore, GetContainerSummary, ListAtCustomer } from '../../../wailsjs/go/main/App'
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
  const [containers, setContainers] = useState<dto.ContainerListDTO[]>([])
  const [customers, setCustomers] = useState<dto.CustomerWithContainerDTO[]>([])
  const [totalContainer, setTotalContainer] = useState<number>(0)
  const [containerAtStore, setContainerAtStore] = useState<number>(0)
  const [containerWithCustomer, setContainerWithCustomer] = useState<number>(0)
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

  const loadAtStore = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await ListAtStore()
      const { total, atStore, withCustomer } = await GetContainerSummary()
      setContainers(data)
      setTotalContainer(total)
      setContainerAtStore(atStore)
      setContainerWithCustomer(withCustomer)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadAtCustomers = useCallback(async () => {
    const res = await ListAtCustomer()
    setCustomers(res)
  }, [])

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
    loadAtStore()
    loadAtCustomers()
  }, [loadAtStore, loadAtCustomers])

  /* ─────────────── render ─────────────── */
  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Sora:wght@400;600;700&display=swap');`}</style>

      <ContainerFormModal
        isOpen={isOpenModalForm}
        onClose={handleCloseContainerFormModal}
        onChange={async () => { loadAtStore(); loadAtCustomers() }}
        container={selectedContainerEdit}
      />

      {/* ── Header ── */}
      <Flex align="flex-start" justify="space-between" wrap="wrap" gap={16} style={{ marginBottom: 28 }}>
        <PageTitle title={localT('title')} subtitle={localT('subtitle')} />
        <Space size="middle" wrap>
          {selectedRowKeys.length > 0 && (
            <Button
              onClick={handleBulkDelete}
              size="large"
              icon={<Trash2 size={15} />}
              danger
              style={{ minWidth: 140 }}
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
            style={{ minWidth: 140 }}
          >
            {commonT('button-filter')}
          </Button>
          <Button
            onClick={() => setIsOpenModalForm(true)}
            size="large"
            icon={<Plus size={15} />}
            type="primary"
            style={{ minWidth: 140 }}
            className="gradient-btn"
          >
            {commonT('button-create')}
          </Button>
        </Space>
      </Flex>

      {/* ── Stat Cards ── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={8}>
          <StatCard
            title={localT('all')}
            value={totalContainer}
            icon={<Package size={18} />}
            accent="#3b82f6"
            bg="#eff6ff"
          />
        </Col>
        <Col xs={24} md={8}>
          <StatCard
            title={localT('at-store')}
            value={containerAtStore}
            icon={<PackageCheck size={18} />}
            accent="#16a34a"
            bg="#f0fdf4"
          />
        </Col>
        <Col xs={24} md={8}>
          <StatCard
            title={localT('with-customer')}
            value={containerWithCustomer}
            icon={<Users size={18} />}
            accent="#9333ea"
            bg="#faf5ff"
          />
        </Col>
      </Row>

      {/* ── Collapsible Filters ── */}
      <div style={{
        overflow: 'hidden',
        maxHeight: isShowFilters ? 400 : 0,
        opacity: isShowFilters ? 1 : 0,
        transition: 'max-height 0.3s ease, opacity 0.25s ease',
        marginBottom: isShowFilters ? 20 : 0,
      }}>
        <Card
          style={{
            background: '#f8fafc',
            border: '1.5px solid #e2e8f0',
            borderRadius: 12,
          }}
        >
          <Form form={form} layout="vertical" onReset={handleResetFilters} onFinish={handleSearchFilter}>
            <Row gutter={16} align="bottom">
              <Col xs={24} sm={12} md={6}>
                <Form.Item label={localT('form.id.label')} name="id">
                  <Input allowClear placeholder={localT('form.id.placeholder')} style={{ fontFamily: "'DM Mono', monospace" }} />
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
      </div>

      {/* ── Container Panels ── */}
      <Row gutter={[16, 16]}>
        {/* At Store */}
        <Col xs={24} lg={12}>
          <div style={{
            background: '#fff',
            border: '1.5px solid #bbf7d0',
            borderRadius: 12,
            overflow: 'hidden',
            height: '100%',
          }}>
            <div style={{
              padding: '14px 20px',
              borderBottom: '1px solid #dcfce7',
              background: '#f0fdf4',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <Flex align="center" gap={8}>
                <PackageCheck size={15} style={{ color: '#16a34a' }} />
                <Text style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600, color: '#15803d', fontSize: 14 }}>
                  {localT('at-store')}
                </Text>
              </Flex>
              <span style={{
                background: '#dcfce7', color: '#15803d',
                border: '1px solid #bbf7d0',
                borderRadius: 20, padding: '1px 10px',
                fontSize: 12, fontFamily: "'DM Mono', monospace", fontWeight: 500,
              }}>
                {containers.length}
              </span>
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {containers.length === 0
                ? <Text style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: 13 }}>No containers</Text>
                : containers.map(c => (
                  <ContainerTag key={c.id} name={c.name} containerNo={c.containerNo} color={c.color}/>
                ))
              }
            </div>
          </div>
        </Col>

        {/* With Customers */}
        <Col xs={24} lg={12}>
          <div style={{
            background: '#fff',
            border: '1.5px solid #e9d5ff',
            borderRadius: 12,
            overflow: 'hidden',
            height: '100%',
          }}>
            <div style={{
              padding: '14px 20px',
              borderBottom: '1px solid #f3e8ff',
              background: '#faf5ff',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <Flex align="center" gap={8}>
                <Users size={15} style={{ color: '#9333ea' }} />
                <Text style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600, color: '#7e22ce', fontSize: 14 }}>
                  {localT('with-customer')}
                </Text>
              </Flex>
              <span style={{
                background: '#f3e8ff', color: '#7e22ce',
                border: '1px solid #e9d5ff',
                borderRadius: 20, padding: '1px 10px',
                fontSize: 12, fontFamily: "'DM Mono', monospace", fontWeight: 500,
              }}>
                {customers.length}
              </span>
            </div>
            <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {customers.length === 0
                ? <Text style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: 13 }}>No customers</Text>
                : customers.map((customer, idx) => (
                  <div key={customer.id}>
                    {idx > 0 && <div style={{ height: 1, background: '#f1f5f9', marginBottom: 14 }} />}
                    <Flex align="center" gap={8} style={{ marginBottom: 8 }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: 8,
                        background: '#ede9fe',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700, color: '#7c3aed',
                        fontFamily: "'Sora', sans-serif",
                        border: '1px solid #ddd6fe',
                      }}>
                        {customer.name?.[0]?.toUpperCase()}
                      </div>
                      <Text strong style={{ color: '#1e293b', fontSize: 13, fontFamily: "'Sora', sans-serif" }}>
                        {customer.name}
                      </Text>
                      <span style={{
                        marginLeft: 'auto',
                        color: '#94a3b8', fontSize: 11,
                        fontFamily: "'DM Mono', monospace",
                      }}>
                        {customer.containers?.length ?? 0} units
                      </span>
                    </Flex>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingLeft: 34 }}>
                      {customer.containers?.map(container => (
                        <ContainerTag
                          key={container.id}
                          name={container.name}
                          containerNo={container.containerNo}
                          color={container.color}
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
    </>
  )
}

export default Container