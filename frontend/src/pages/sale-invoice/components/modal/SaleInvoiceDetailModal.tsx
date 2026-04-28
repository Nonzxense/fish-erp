import { FishRow, HeaderRow, RowData, SaleInvoiceViewProps } from './interface'
import {
  Avatar,
  Divider,
  Flex,
  Modal,
  Skeleton,
  Table,
  Tag,
  Typography
} from 'antd'
import { FishIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatDate, formatTHB } from '../../../../utils/formatter'
import { getPaidStatusColor } from '../../../../utils/getTagColor'
import dayjs from 'dayjs'

const { Title, Text } = Typography

const SaleInvoiceDetailModal = ({
  isOpen,
  saleInvoice,
  onClose
}: SaleInvoiceViewProps) => {
  const { t: localT } = useTranslation('sale-invoice')
  const { t: commonT } = useTranslation('common')

  const invoiceNo = saleInvoice?.id ?? '-'

  const totalWeight =
    saleInvoice?.items.reduce((grandTotal, container) => {
      const containerWeight = container.fishes.reduce(
        (sum, fish) => sum + fish.weightKg,
        0
      )
      return grandTotal + containerWeight
    }, 0) ?? 0

  const rows: RowData[] =
    saleInvoice?.items?.flatMap((container) => {
      const header: HeaderRow = {
        key: `header-${container.id}`,
        type: 'header',
        containerId: container.containerId
      }

      const fishes: FishRow[] = container.fishes.map((fish, index) => ({
        key: `fish-${container.id}-${index}`,
        type: 'fish',
        name: fish.name,
        weightKg: fish.weightKg,
        pricePerKg: fish.pricePerKg,
        amount: fish.weightKg * fish.pricePerKg
      }))

      return [header, ...fishes]
    }) ?? []

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
        <>
          <Flex justify="space-between" align="center" className="w-full pr-8">
            <Flex gap={12} align="center">
              <Avatar
                shape="square"
                size={48}
                icon={<FishIcon />}
                className="bg-blue-500 bg-[radial-gradient(circle_at_bottom_right,theme(colors.cyan.400)_0%,transparent_80%)] !border-0 !shadow-none !rounded-xl"
              />

              <div>
                <Title level={4} className="!mb-0">
                  {localT('modal.title')}
                </Title>
                <Text type="secondary">
                  {localT('title')}
                </Text>
              </div>
            </Flex>

            <div className="text-right">
              <Text type="secondary" className="block text-xs uppercase">
                {localT('modal.invoice-no')}
              </Text>
              <Text strong className="font-mono text-blue-500">
                #{invoiceNo}
              </Text>
            </div>
          </Flex>

          <Divider className="mb-4" />
        </>
      }
    >
      {!saleInvoice ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : (
        <div className="space-y-5">
          {/* Customer + Meta */}
          <Flex justify="space-between" align="start" wrap="wrap" gap={16}>
            <div>
              <Text type="secondary">{localT('table.customer')}</Text>
              <div>
                <Text strong>{saleInvoice.customer?.name || '-'}</Text>
              </div>

              <div className="mt-3">
                <Text type="secondary">{localT('table.date')}</Text>
                <div>
                  <Text>{formatDate(dayjs(String(saleInvoice.createdAt)))}</Text>
                </div>
              </div>
            </div>

            <div className="text-right">
              <Text type="secondary">{localT('table.status')}</Text>
              <div className="mt-1">
                <Tag color={getPaidStatusColor(saleInvoice.status)}>
                  {localT(`status.${saleInvoice.status}`)}
                </Tag>
              </div>
            </div>
          </Flex>

          <Divider className="my-0" />

          {/* Items */}
          <Table
            dataSource={rows}
            pagination={false}
            size="small"
            rowKey="key"
            bordered
            rowClassName={(record) =>
              record.type === 'header' ? 'bg-slate-50' : ''
            }
            columns={[
              {
                title: localT('table.description'),
                render: (_, record) => {
                  if (record.type === 'header') {
                    return (
                      <Text strong className="text-blue-500">
                        {commonT('container')} #{record.containerId}
                      </Text>
                    )
                  }

                  return (
                    <span className="pl-6">
                      {record.name}
                    </span>
                  )
                }
              },
              {
                title: localT('table.weight'),
                align: 'right',
                render: (_, record) =>
                  record.type === 'fish'
                    ? record.weightKg.toFixed(2)
                    : null
              },
              {
                title: localT('table.rate'),
                align: 'right',
                render: (_, record) =>
                  record.type === 'fish'
                    ? formatTHB(record.pricePerKg)
                    : null
              },
              {
                title: localT('table.total'),
                align: 'right',
                render: (_, record) =>
                  record.type === 'fish'
                    ? formatTHB(record.amount)
                    : null
              }
            ]}
          />

          {/* Note */}
          {saleInvoice.note && (
            <>
              <Divider className="my-0" />
              <div>
                <Text type="secondary">Note</Text>
                <div>
                  <Text>{saleInvoice.note}</Text>
                </div>
              </div>
            </>
          )}

          {/* Total */}
          <Divider className="my-0" />

          <Flex justify="end">
            <div className="min-w-[320px] rounded-xl border border-slate-200 overflow-hidden">

              <div className="px-5 py-3 bg-slate-50 border-b">
                <Text strong>{localT('modal.summary')}</Text>
              </div>

              <div className="px-5 py-4 space-y-3">

                <Flex justify="space-between" align="center">
                  <Text type="secondary">
                    {localT('modal.total-containers')}
                  </Text>
                  <Text strong>
                    {saleInvoice.items.length}
                  </Text>
                </Flex>

                <Flex justify="space-between" align="center">
                  <Text type="secondary">
                    {localT('modal.total-weight')}
                  </Text>
                  <Text strong>
                    {totalWeight.toFixed(2)}
                  </Text>
                </Flex>

                <Divider className="my-2" />

                <Flex justify="space-between" align="center">
                  <Title level={5} className="!mb-0">
                    {localT('modal.total-amount')}
                  </Title>

                  <Title level={4} className="!m-0 text-blue-500">
                    {formatTHB(saleInvoice.totalAmount)}
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

export default SaleInvoiceDetailModal