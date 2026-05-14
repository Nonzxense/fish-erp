import {
  Divider,
  Flex,
  Modal,
  Skeleton,
  Table,
  Tag,
  Typography
} from 'antd'
import {
  Truck,
  UsersIcon,
  WalletIcon
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatDate, formatTHB } from '../../../../utils/formatter'
import { getPaidStatusColor } from '../../../../utils/getTagColor'
import dayjs from 'dayjs'
import { truckinvoice as truckinvoiceModel } from '../../../../../wailsjs/go/models'
import { useEffect, useState } from 'react'
import { GetTruckInvoice } from '../../../../../wailsjs/go/main/App'
import ModalHeader from '../../../../components/invoice-modal-title/ModalHeader'

const { Title, Text } = Typography

interface TruckInvoiceDetailModalProps {
  isOpen: boolean
  onClose: () => void
  id?: string
}

const TruckInvoiceDetailModal = ({
  isOpen,
  onClose,
  id,
}: TruckInvoiceDetailModalProps) => {
  const [truckInvoice, setTruckInvoice] = useState<truckinvoiceModel.TruckInvoice>()
  const { t: localT } = useTranslation('truck-invoice')
  const { t: commonT } = useTranslation('common')

  const invoiceNo = truckInvoice?.id ?? '-'


  useEffect(() => {
    const loadTruckInvoices = async () => {
      if (!id) return
      try {
        const res = await GetTruckInvoice(id)
        setTruckInvoice(res)
      } catch {
        // interceptor handles error
      }
    }

    loadTruckInvoices()
  }, [id])

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      width={900}
      footer={null}
      destroyOnHidden={false}
      styles={{
        body: {
          maxHeight: '75vh',
          overflowY: 'auto'
        }
      }}
      title={
        <ModalHeader
          icon={<Truck />}
          title={localT('modal-title')}
          subtitle={localT('title')}
          rightContent={
            <div className="text-right">
              <Text type="secondary" className="text-[12px] block uppercase">
                {commonT('invoice-no')}
              </Text>
              <Text strong className="text-orange-500 font-mono">
                #{invoiceNo}
              </Text>
            </div>
          }
          className="bg-orange-500 bg-[radial-gradient(circle_at_bottom_right,theme(colors.yellow.400)_0%,transparent_80%)] !border-0 !shadow-none !rounded-xl" />
      }
    >
      {!truckInvoice ? (
        <Skeleton active paragraph={{ rows: 10 }} />
      ) : (
        <div className="space-y-5">

          {/* Driver + Meta */}
          <Flex justify="space-between" align="start" wrap="wrap" gap={16}>
            <div className="space-y-3">

              <div>
                <Text type="secondary">
                  {localT('table.driver')}
                </Text>

                <div>
                  <Text strong>
                    {truckInvoice.driverName || '-'}
                  </Text>
                </div>
              </div>

              <div>
                <Text type="secondary">
                  {localT('table.car-plate')}
                </Text>

                <div>
                  <Text>
                    {truckInvoice.carPlate || '-'}
                  </Text>
                </div>
              </div>

              <div>
                <Text type="secondary">
                  {localT('table.date')}
                </Text>

                <div>
                  <Text>
                    {formatDate(dayjs(String(truckInvoice.createdAt)))}
                  </Text>
                </div>
              </div>

            </div>

            <div className="text-right space-y-3">

              <div>
                <Text type="secondary">
                  {localT('table.status')}
                </Text>

                <div className="mt-1">
                  <Tag color={getPaidStatusColor(truckInvoice.status)}>
                    {commonT(`invoice-status.${truckInvoice.status}`)}
                  </Tag>
                </div>
              </div>
            </div>
          </Flex>

          <Divider className="my-0" />

          {/* Customers */}
          <div>
            <Flex align="center" gap={8} className="mb-3">
              <UsersIcon size={18} />

              <Title level={5} className="!mb-0">
                {localT('card.customers')}
              </Title>
            </Flex>

            <Table
              bordered
              size="small"
              pagination={false}
              rowKey="ID"
              dataSource={truckInvoice.customers}
              scroll={{ x: true }}
              columns={[
                {
                  title: localT('table.name'),
                  render: (_, record) => record.customer?.name || '-'
                },
                {
                  title: localT('table.status'),
                  align: 'center',
                  render: (_, record) => (
                    <Tag color={getPaidStatusColor(record.status)}>
                      {commonT(`invoice-status.${record.status}`)}
                    </Tag>
                  )
                },
                {
                  title: localT('table.total'),
                  align: 'right',
                  render: (_, record) =>
                    formatTHB(record.totalAmount || 0)
                }
              ]}
              expandable={{
                expandedRowRender: (record) => (
                  <Table
                    bordered
                    size="small"
                    pagination={false}
                    rowKey="ID"
                    dataSource={record.items}
                    columns={[
                      {
                        title: localT('table.type'),
                        render: (_, item) => commonT(item.Type)
                      },
                      {
                        title: localT('table.qty'),
                        align: 'right',
                        render: (_, item) => item.Qty
                      },
                      {
                        title: localT('table.price'),
                        align: 'right',
                        render: (_, item) =>
                          formatTHB(item.Price)
                      },
                      {
                        title: localT('table.amount'),
                        align: 'right',
                        render: (_, item) =>
                          formatTHB(item.Qty * item.Price)
                      }
                    ]}
                  />
                )
              }}
            />
          </div>

          {/* Helpers */}
          {truckInvoice.helpers.length > 0 && (
            <>
              <Divider className="my-0" />

              <div>
                <Title level={5}>
                  {localT('card.helpers')}
                </Title>

                <Table
                  bordered
                  size="small"
                  pagination={false}
                  rowKey="id"
                  dataSource={truckInvoice.helpers}
                  columns={[
                    {
                      title: localT('table.name'),
                      dataIndex: 'name'
                    },
                    {
                      title: localT('table.amount'),
                      align: 'right',
                      render: (_, record) =>
                        formatTHB(record.amount)
                    }
                  ]}
                />
              </div>
            </>
          )}

          {/* Other Expenses */}
          {truckInvoice.otherExpenses.length > 0 && (
            <>
              <Divider className="my-0" />

              <div>
                <Title level={5}>
                  {localT('card.expenses')}
                </Title>

                <Table
                  bordered
                  size="small"
                  pagination={false}
                  rowKey="id"
                  dataSource={truckInvoice.otherExpenses}
                  columns={[
                    {
                      title: localT('table.description'),
                      dataIndex: 'description'
                    },
                    {
                      title: localT('table.amount'),
                      align: 'right',
                      render: (_, record) =>
                        formatTHB(record.amount)
                    }
                  ]}
                />
              </div>
            </>
          )}

          {/* Note */}
          {truckInvoice.note && (
            <>
              <Divider className="my-0" />

              <div>
                <Text type="secondary">
                  {localT('table.note')}
                </Text>

                <div>
                  <Text>
                    {truckInvoice.note}
                  </Text>
                </div>
              </div>
            </>
          )}

          <Divider className="my-0" />

          {/* Summary */}
          <Flex justify="end">
            <div className="min-w-[340px] rounded-xl border border-slate-200 overflow-hidden">

              <div className="px-5 py-3 bg-slate-50 border-b">
                <Flex align="center" gap={8}>
                  <WalletIcon size={18} />

                  <Text strong>
                    {localT('summary')}
                  </Text>
                </Flex>
              </div>

              <div className="px-5 py-4 space-y-3">

                <Flex justify="space-between">
                  <Text type="secondary">
                    {commonT('total-income')}
                  </Text>

                  <Text strong className="text-emerald-600">
                    {formatTHB(truckInvoice.totalIncome)}
                  </Text>
                </Flex>

                <Flex justify="space-between">
                  <Text type="secondary">
                    {commonT('total-expense')}
                  </Text>

                  <Text strong className="text-red-500">
                    {formatTHB(truckInvoice.totalExpense)}
                  </Text>
                </Flex>

                <Divider className="my-2" />

                <Flex justify="space-between" align="center">
                  <Title level={5} className="!mb-0">
                    {commonT('net-profit')}
                  </Title>

                  <Title
                    level={4}
                    className={`!m-0 ${truckInvoice.totalIncome -
                      truckInvoice.totalExpense >=
                      0
                      ? '!text-emerald-600'
                      : '!text-red-500'
                      }`}
                  >
                    {formatTHB(
                      truckInvoice.totalIncome -
                      truckInvoice.totalExpense
                    )}
                  </Title>
                </Flex>

              </div>
            </div>
          </Flex>

        </div>
      )}
    </Modal>
  )
}

export default TruckInvoiceDetailModal