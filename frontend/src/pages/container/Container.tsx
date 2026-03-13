import { Button, Card, Col, Flex, Form, Input, Row, Segmented, Select, Space, Statistic, Table, TableColumnsType, Typography } from 'antd'
import PageTitle from '../../components/page-title/PageTitle'
import { useTranslation } from 'react-i18next'
import { ListFilter, Plus } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { domain } from '../../../wailsjs/go/models'
import ContainerFormModal from './components/modal/ContainerFormModal'
import { GetContainers } from '../../../wailsjs/go/main/App'

const { Text } = Typography

const Container = () => {
  const [isOpenModalForm, setIsOpenModalForm] = useState<boolean>(false)
  const [isShowFilters, setIsShowFilters] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [selectedContainerEdit, setSelectedContainerEdit] = useState<domain.Container>()
  const [containers, setContainers] = useState<domain.Container[]>([])
  const { t: localT } = useTranslation('container')
  const { t: commonT } = useTranslation('common')
  const [form] = Form.useForm()

  const segmentOptions = useMemo(() => [
    {
      label: localT('all'),
      value: 'all'
    },
    {
      label: localT('at-store'),
      value: 'atStore'
    },
    {
      label: localT('with-customer'),
      value: 'atCustomer'
    },
  ], [localT])

  const columns: TableColumnsType<domain.Container> = useMemo(
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
        render: (val: string) => (
          <Text>{commonT(val)}</Text>
        )
      },
      {
        title: localT('table.color'),
        key: 'color',
        dataIndex: 'color',
        width: 120,
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
    ],
    [commonT, localT])

  const handleCloseContainerFormModal = useCallback(() => {
    setSelectedContainerEdit(undefined)
    setIsOpenModalForm(false)
  }, [])

  const loadContainers = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await GetContainers()
      setContainers(res.data)
    } finally {
      setIsLoading(false)
    }
  }, [])

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
                <Statistic title={localT('all')} />
              </Card>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Card variant="borderless">
                <Statistic title={localT('at-store')} />
              </Card>
            </Col>
            <Col xs={24} md={24} lg={8}>
              <Card variant="borderless">
                <Statistic title={localT('with-customer')} />
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
            defaultValue='all'
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
          // onReset={handleResetFilters}
          // onFinish={handleSearchFilter}
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
                  <Input
                    allowClear
                    placeholder={localT('form.color.placeholder')}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={localT('form.status.label')}
                  name="status"
                >
                  <Select
                    allowClear
                    placeholder={localT('form.status.placeholder')}
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
        // rowSelection={rowSelection}
        dataSource={containers}
        // scroll={{ x: 'max-content' }}
        // rowKey={(record) => record.id}
        // onChange={handleTableChange}
        loading={isLoading}
      // pagination={{
      //   current: pagination.page,
      //   pageSize: pagination.pageSize,
      //   total: pagination.total,
      //   showSizeChanger: true,
      // }}
      />
    </>
  )
}

export default Container