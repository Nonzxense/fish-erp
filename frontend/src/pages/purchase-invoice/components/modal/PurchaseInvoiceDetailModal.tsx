import { PurchaseInvoiceDetailProps } from './interface'
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

const PurchaseInvoiceDetailModal = ({
  isOpen,
  purchaseInvoice,
  onClose
}: PurchaseInvoiceDetailProps) => {
  const { t: localT } = useTranslation('purchase-invoice')

  const invoiceNo = purchaseInvoice?.id ?? '-'

  const totalWeight =
    purchaseInvoice?.items.reduce(
      (sum, fish) => sum + fish.weightKg,
      0
    ) ?? 0

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
      {!purchaseInvoice ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : (
        <div className="space-y-5">

          {/* Supplier + Meta */}
          <Flex justify="space-between" align="start" wrap="wrap" gap={16}>
            <div>
              <Text type="secondary">
                {localT('table.supplier')}
              </Text>

              <div>
                <Text strong>
                  {purchaseInvoice.supplier?.name || '-'}
                </Text>
              </div>

              <div className="mt-3">
                <Text type="secondary">
                  {localT('table.date')}
                </Text>

                <div>
                  <Text>
                    {formatDate(dayjs(String(purchaseInvoice.createdAt)))}
                  </Text>
                </div>
              </div>
            </div>

            <div className="text-right">
              <Text type="secondary">
                {localT('table.status')}
              </Text>

              <div className="mt-1">
                <Tag color={getPaidStatusColor(purchaseInvoice.status)}>
                  {localT(`status.${purchaseInvoice.status}`)}
                </Tag>
              </div>
            </div>
          </Flex>

          <Divider className="my-0" />

          {/* Fish Items */}
          <Table
            dataSource={purchaseInvoice.items}
            pagination={false}
            size="small"
            rowKey="id"
            bordered
            columns={[
              {
                title: localT('table.description'),
                dataIndex: 'name'
              },
              {
                title: localT('table.weight'),
                align: 'right',
                render: (_, record) =>
                  record.weightKg.toFixed(2)
              },
              {
                title: localT('table.rate'),
                align: 'right',
                render: (_, record) =>
                  formatTHB(record.pricePerKg)
              },
              {
                title: localT('table.total'),
                align: 'right',
                render: (_, record) =>
                  formatTHB(record.weightKg * record.pricePerKg)
              }
            ]}
          />

          {/* Note */}
          {purchaseInvoice.note && (
            <>
              <Divider className="my-0" />

              <div>
                <Text type="secondary">
                  {localT('table.note')}
                </Text>

                <div>
                  <Text>
                    {purchaseInvoice.note}
                  </Text>
                </div>
              </div>
            </>
          )}

          <Divider className="my-0" />

          {/* Summary */}
          <Flex justify="end">
            <div className="min-w-[320px] rounded-xl border border-slate-200 overflow-hidden">

              <div className="px-5 py-3 bg-slate-50 border-b">
                <Text strong>
                  {localT('modal.summary')}
                </Text>
              </div>

              <div className="px-5 py-4 space-y-3">

                <Flex justify="space-between">
                  <Text type="secondary">
                    {localT('modal.total-items')}
                  </Text>

                  <Text strong>
                    {purchaseInvoice.items.length}
                  </Text>
                </Flex>

                <Flex justify="space-between">
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
                    {formatTHB(purchaseInvoice.totalAmount)}
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

export default PurchaseInvoiceDetailModal