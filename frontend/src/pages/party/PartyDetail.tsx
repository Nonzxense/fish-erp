import {
  App,
  Button,
  Card,
  Col,
  Descriptions,
  Flex,
  Row,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  TableColumnsType,
  Tooltip,
  Typography
} from 'antd'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Eye,
  PencilLine,
  Undo2,
  Wallet
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import PageTitle from '../../components/page-title/PageTitle'

import {
  formatDate,
  formatTHB,
} from '../../utils/formatter'

import {
  dto,
  invoice as invoiceModel,
  party as partyModel,
  payment as paymentModel,
  truckinvoice as truckinvoiceModel
} from '../../../wailsjs/go/models'

import PaymentModal from '../party/components/modal/PaymentModal'
import PartyFormModal from './components/modal/PartyFormModal'

import {
  GetFishPurchaseInvoices,
  GetFishSaleInvoices,
  GetParty,
  GetPaymentsByPartyID,
  GetShippingInvoicesByPartyID,
  RollbackPayment,
} from '../../../wailsjs/go/main/App'

import { Pagination } from '../../utils/types'

import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  REF_FISH_PURCHASE_INVOICE,
  REF_FISH_SALE_INVOICE,
  REF_TRUCK_INVOICE
} from '../../utils/constants'

import { getPaidStatusColor, getPaymentDirectionType } from '../../utils/getTagColor'
import { PayableInvoice } from '../../components/payment/interface'
import InvoicePaymentModal from '../../components/payment/InvoicePaymentModal'

const { Text } = Typography

const PartyDetail = () => {
  const [activeTab, setActiveTab] = useState('sales')
  const [isOpenPaymentModal, setIsOpenPaymentModal] = useState(false)
  const [isOpenInvoicePaymentModal, setIsOpenInvoicePaymentModal] = useState(false)
  const [isOpenModalForm, setIsOpenModalForm] = useState(false)
  const [selectedInvoiceToPay, setSelectedInvoiceToPay] = useState<PayableInvoice | null>(null)
  const [isPartyLoading, setIsPartyLoading] = useState(false)
  const [isSaleLoading, setIsSaleLoading] = useState(false)
  const [isPurchaseLoading, setIsPurchaseLoading] = useState(false)
  const [isTruckLoading, setIsTruckLoading] = useState(false)
  const [isPaymentLoading, setIsPaymentLoading] = useState(false)
  const [partyDetail, setPartyDetail] = useState<dto.PartyDetailDTO>()
  const [saleInvoices, setSaleInvoices] = useState<invoiceModel.FishSaleInvoice[]>([])
  const [purchaseInvoices, setPurchaseInvoices] = useState<invoiceModel.FishPurchaseInvoice[]>([])
  const [shippingInvoices, setShippingInvoices] = useState<truckinvoiceModel.ShippingInvoice[]>([])
  const [payments, setPayments] = useState<paymentModel.Payment[]>([])
  const [salePagination, setSalePagination] = useState<Pagination>({
    page: DEFAULT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0
  })
  const [purchasePagination, setPurchasePagination] = useState<Pagination>({
    page: DEFAULT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0
  })
  const [truckPagination, setTruckPagination] = useState<Pagination>({
    page: DEFAULT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0
  })
  const [paymentPagination, setPaymentPagination] = useState<Pagination>({
    page: DEFAULT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0
  })

  const { id } = useParams()
  const navigate = useNavigate()
  const { t: localT } = useTranslation('party')
  const { t: paymentT } = useTranslation('payment')
  const { t: commonT } = useTranslation('common')
  const { modal, message } = App.useApp()

  const loadParty = useCallback(async () => {
    if (!id) return

    try {
      setIsPartyLoading(true)

      const party = await GetParty(id)

      setPartyDetail(party)
    } catch (err) {
      console.error(err)

      message.error(
        commonT('message.error-load-data')
      )
    } finally {
      setIsPartyLoading(false)
    }
  }, [id, message, commonT])

  const loadSaleInvoices =
    useCallback(async () => {
      if (!id) return

      try {
        setIsSaleLoading(true)

        const filter =
          new invoiceModel.InvoiceFilter({
            partyId: id,
            page: salePagination.page,
            pageSize:
              salePagination.pageSize
          })

        const result =
          await GetFishSaleInvoices(
            filter
          )

        setSaleInvoices(result.data)

        setSalePagination((prev) => ({
          ...prev,
          total: result.total
        }))
      } catch (err) {
        console.error(err)

        message.error(
          commonT('message.error-load-data')
        )
      } finally {
        setIsSaleLoading(false)
      }
    }, [
      id,
      salePagination.page,
      salePagination.pageSize,
      message,
      commonT
    ])

  const loadPurchaseInvoices =
    useCallback(async () => {
      if (!id) return

      try {
        setIsPurchaseLoading(true)

        const filter =
          new invoiceModel.InvoiceFilter({
            partyId: id,
            page: purchasePagination.page,
            pageSize:
              purchasePagination.pageSize
          })

        const result =
          await GetFishPurchaseInvoices(
            filter
          )

        setPurchaseInvoices(result.data)

        setPurchasePagination((prev) => ({
          ...prev,
          total: result.total
        }))
      } catch (err) {
        console.error(err)

        message.error(
          commonT('message.error-load-data')
        )
      } finally {
        setIsPurchaseLoading(false)
      }
    }, [
      id,
      purchasePagination.page,
      purchasePagination.pageSize,
      message,
      commonT
    ])

  const loadTruckInvoices =
    useCallback(async () => {
      if (!id) return

      try {
        setIsTruckLoading(true)

        const result = await GetShippingInvoicesByPartyID(id)

        setShippingInvoices(result.data)

        setTruckPagination((prev) => ({
          ...prev,
          total: result.total
        }))
      } catch (err) {
        console.error(err)

        message.error(
          commonT('message.error-load-data')
        )
      } finally {
        setIsTruckLoading(false)
      }
    }, [id, message, commonT])

  const loadPayments =
    useCallback(async () => {
      if (!id) return

      try {
        setIsPaymentLoading(true)

        const result =
          await GetPaymentsByPartyID(id)

        setPayments(result.data)

        setPaymentPagination((prev) => ({
          ...prev,
          total: result.total
        }))
      } catch (err) {
        console.error(err)

        message.error(
          commonT('message.error-load-data')
        )
      } finally {
        setIsPaymentLoading(false)
      }
    }, [id, message, commonT])

  const handlePaySpecificInvoice = useCallback((invoice: PayableInvoice) => {
    setSelectedInvoiceToPay(invoice)
    setIsOpenInvoicePaymentModal(true)
  }, [])

  useEffect(() => {
    loadParty()
  }, [loadParty])

  useEffect(() => {
    if (activeTab === 'sales') {
      loadSaleInvoices()
    }

    if (activeTab === 'purchases') {
      loadPurchaseInvoices()
    }

    if (activeTab === 'shipping') {
      loadTruckInvoices()
    }

    if (activeTab === 'payments') {
      loadPayments()
    }
  }, [
    activeTab,
    loadSaleInvoices,
    loadPurchaseInvoices,
    loadTruckInvoices,
    loadPayments
  ])

  const handleRollbackPayment = useCallback(async (record: paymentModel.Payment) => {
    await modal.confirm({
      title: paymentT('modal-rollback.title'),
      content: paymentT('modal-rollback.desc', { amount: formatTHB(record.amount) }),
      okText: commonT('modal-common.ok'),
      cancelText: commonT('modal-common.cancel'),
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await RollbackPayment(record.id)

          message.success(paymentT('message.rollback-success'))
          loadPayments()
          loadParty()
        } catch (err) {
          console.error(err)

          message.error(
            paymentT('message.rollback-error')
          )
        }
      }
    })
  }, [commonT, loadParty, loadPayments, message, modal, paymentT])

  const commonInvoiceColumns: TableColumnsType =
    useMemo(
      () => [
        {
          title: localT('invoice.id'),
          dataIndex: 'id',
          key: 'id',
          width: 150
        },
        {
          title: localT(
            'invoice.date'
          ),
          dataIndex: 'createdAt',
          key: 'createdAt',
          width: 120,
          render: (val) =>
            formatDate(val)
        },
        {
          title: localT(
            'invoice.total'
          ),
          dataIndex: 'totalAmount',
          key: 'totalAmount',
          align: 'right',
          width: 150,
          render: (val: number) =>
            formatTHB(val)
        },
        {
          title: localT(
            'invoice.paid'
          ),
          dataIndex: 'paidAmount',
          key: 'paidAmount',
          align: 'right',
          width: 150,
          render: (val: number) =>
            formatTHB(val)
        },
        {
          title:
            localT('table.status'),
          dataIndex: 'status',
          key: 'status',
          align: 'center',
          width: 120,
          render: (
            status: string
          ) => (
            <Tag
              color={getPaidStatusColor(
                status
              )}
            >
              {commonT(
                'invoice-status.' +
                status
              )}
            </Tag>
          )
        },
      ],
      [localT, commonT]
    )

  const createInvoiceColumns = <
    T extends {
      id: string
      totalAmount: number
      paidAmount: number
      status: string
    }
  >(
    onPay: (record: T) => void
  ): TableColumnsType<T> => [
      ...commonInvoiceColumns,

      {
        title: localT('table.manage'),
        key: 'manage',
        align: 'center',
        width: 120,

        render: (_, record) => {
          const isFullyPaid = record.paidAmount >= record.totalAmount

          return (
            <Space>
              <Tooltip
                title={commonT(
                  'button-view'
                )}
              >
                <Button
                  variant='text'
                  icon={<Eye size={16} />}
                  onClick={() => {
                    navigate(
                      `/invoices/${record.id}`
                    )
                  }}
                />
              </Tooltip>

              {!isFullyPaid && (
                <Tooltip
                  title={localT(
                    'button.receive-payment'
                  )}
                >
                  <Button
                    variant='text'
                    color='green'
                    icon={<Wallet size={16} />}
                    onClick={() =>
                      onPay(record)
                    }
                  />
                </Tooltip>
              )}
            </Space>
          )
        }
      }
    ]

  const saleInvoiceColumns = createInvoiceColumns<invoiceModel.FishSaleInvoice>((invoice) => {
    handlePaySpecificInvoice({
      id: invoice.id,
      refType: REF_FISH_SALE_INVOICE,
      remainingAmount: invoice.totalAmount - invoice.paidAmount
    })
  })

  const purchaseInvoiceColumns = createInvoiceColumns<invoiceModel.FishPurchaseInvoice>((invoice) => {
    handlePaySpecificInvoice({
      id: invoice.id,
      refType: REF_FISH_PURCHASE_INVOICE,
      remainingAmount: invoice.totalAmount - invoice.paidAmount
    })
  })

  const shippingInvoiceColumns = createInvoiceColumns<truckinvoiceModel.ShippingInvoice>((invoice) => {
    handlePaySpecificInvoice({
      id: invoice.id,
      refType: REF_TRUCK_INVOICE,
      remainingAmount: invoice.totalAmount - invoice.paidAmount
    })
  })

  const paymentColumns:
    TableColumnsType<paymentModel.Payment> =
    useMemo(
      () => [
        {
          title: paymentT(
            'table.date'
          ),
          dataIndex: 'paymentDate',
          key: 'paymentDate',
          render: (val) =>
            formatDate(val)
        },
        {
          title: paymentT(
            'table.direction'
          ),
          dataIndex: 'direction',
          key: 'direction',
          render: (val) =>
            <Text type={getPaymentDirectionType(val)}>
              {paymentT(`direction.${val}`)}
            </Text>
        },
        {
          title: paymentT(
            'table.amount'
          ),
          dataIndex: 'amount',
          key: 'amount',
          align: 'right',
          render: (
            val: number
          ) => formatTHB(val)
        },
        {
          title: paymentT(
            'table.method'
          ),
          dataIndex: 'method',
          key: 'method',
          render: (val) => paymentT(`method.${val}`)
        },
        {
          title: paymentT('table.manage'),
          key: 'manage',
          align: 'center',
          width: 100,
          render: (_, record) => {
            return (
              <Space>
                <Tooltip title={localT('button-rollback')}>
                  <Button
                    icon={<Undo2 size={16} />}
                    variant="text"
                    color="danger"
                    onClick={() => handleRollbackPayment(record)}
                  />
                </Tooltip>
              </Space>
            )
          }
        }
      ],
      [handleRollbackPayment, localT, paymentT]
    )

  return (
    <>
      <PaymentModal
        isOpen={isOpenPaymentModal}
        onClose={() =>
          setIsOpenPaymentModal(false)
        }
        party={partyDetail}
        onSuccess={() => {
          loadParty()
          loadPayments()
          loadSaleInvoices()
          loadPurchaseInvoices()
          loadTruckInvoices()
        }}
      />

      <PartyFormModal
        isOpen={isOpenModalForm}
        onClose={() => setIsOpenModalForm(false)}
        onChange={loadParty}
        party={partyDetail as unknown as partyModel.Party}
      />

      {selectedInvoiceToPay && partyDetail && (
        <InvoicePaymentModal
          isOpen={isOpenInvoicePaymentModal}
          onClose={() => {
            setIsOpenInvoicePaymentModal(false)
            setSelectedInvoiceToPay(null)
          }}
          invoice={selectedInvoiceToPay}
          party={partyDetail}
          onSuccess={() => {
            loadParty()
            loadPayments()
            loadSaleInvoices()
            loadPurchaseInvoices()
            loadTruckInvoices()
          }}
        />
      )}

      <Space
        orientation='vertical'
        size='large'
        className='w-full'
      >
        <Flex
          justify='space-between'
          align='center'
          wrap='wrap'
          gap={16}
        >
          <Flex
            align='center'
            gap={16}
          >
            <Button
              icon={
                <ArrowLeft size={16} />
              }
              onClick={() =>
                navigate(-1)
              }
            >
              {commonT('button-back')}
            </Button>

            <PageTitle
              title={
                partyDetail?.name || '-'
              }
              subtitle={localT(
                'detail.subtitle'
              )}
            />
          </Flex>
        </Flex>

        <Card
          loading={isPartyLoading}
          styles={{
            header: {
              borderBottom: 'none',
            },
          }}
          extra={
            <Button
              icon={<PencilLine size={16} />}
              color='primary'
              variant='outlined'
              onClick={() => setIsOpenModalForm(true)}
            >
              {commonT('button-edit')}
            </Button>
          }
        >
          <Descriptions
            bordered
            column={2}
          >
            <Descriptions.Item
              label={localT(
                'table.name'
              )}
            >
              {partyDetail?.name || '-'}
            </Descriptions.Item>

            <Descriptions.Item
              label={localT(
                'table.phone'
              )}
            >
              {partyDetail?.phone || '-'}
            </Descriptions.Item>

            <Descriptions.Item
              label={localT(
                'table.note'
              )}
              span={2}
            >
              {partyDetail?.note || '-'}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card variant="borderless">
              <Tooltip title={localT('stats.party-debt-tooltip')}>
                <Statistic
                  title={
                    <Space size={4}>
                      <ArrowUpRight size={16} className="text-green-500" />
                      <span>{localT('stats.party-debt')}</span>
                    </Space>
                  }
                  value={partyDetail?.totalReceivable || 0}
                  precision={2}
                  styles={{ content: { color: '#3f8600' } }}
                  formatter={(val) => formatTHB(Number(val))}
                />
                <Text type="secondary" className="text-xs">
                  {localT('stats.receivable-desc')}
                </Text>
              </Tooltip>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card variant="borderless">
              <Tooltip title={localT('stats.user-debt-tooltip')}>
                <Statistic
                  title={
                    <Space size={4}>
                      <ArrowDownLeft size={16} className="text-red-500" />
                      <span>{localT('stats.user-debt')}</span>
                    </Space>
                  }
                  value={partyDetail?.totalPayable || 0}
                  precision={2}
                  styles={{ content: { color: '#cf1322' } }}
                  formatter={(val) => formatTHB(Number(val))}
                />
                <Text type="secondary" className="text-xs">
                  {localT('stats.payable-desc')}
                </Text>
              </Tooltip>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card variant="borderless">
              <Tooltip title={localT('stats.total-payments-in-tooltip')}>
                <Statistic
                  title={
                    <Space size={4}>
                      <ArrowUpRight size={16} className="text-green-500" />
                      <span>{localT('stats.total-payments-in')}</span>
                    </Space>
                  }
                  value={partyDetail?.totalPaymentsIn || 0}
                  precision={2}
                  styles={{ content: { color: '#3f8600' } }}
                  formatter={(val) => formatTHB(Number(val))}
                />
                <Text type="secondary" className="text-xs">
                  {localT('stats.total-payments-in-desc')}
                </Text>
              </Tooltip>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card variant="borderless">
              <Tooltip title={localT('stats.total-payments-out-tooltip')}>
                <Statistic
                  title={
                    <Space size={4}>
                      <ArrowDownLeft size={16} className="text-red-500" />
                      <span>{localT('stats.total-payments-out')}</span>
                    </Space>
                  }
                  value={partyDetail?.totalPaymentsOut || 0}
                  precision={2}
                  styles={{ content: { color: '#cf1322' } }}
                  formatter={(val) => formatTHB(Number(val))}
                />
                <Text type="secondary" className="text-xs">
                  {localT('stats.total-payments-out-desc')}
                </Text>
              </Tooltip>
            </Card>
          </Col>
        </Row>

        <Card
          styles={{
            header: {
              borderBottom: 'none',
            },
          }}
          extra={
            <Button
              icon={<Wallet size={16} />}
              className='gradient-btn'
              onClick={() => setIsOpenPaymentModal(true)}
            >
              {localT('button.receive-payment')}
            </Button>
          }
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: 'sales',
                label:
                  localT('tabs.sales'),

                children: (
                  <Table
                    rowKey='id'
                    loading={
                      isSaleLoading
                    }
                    columns={
                      saleInvoiceColumns
                    }
                    dataSource={
                      saleInvoices
                    }
                    scroll={{
                      x: 'max-content'
                    }}
                    pagination={{
                      current:
                        salePagination.page,

                      pageSize:
                        salePagination.pageSize,

                      total:
                        salePagination.total,

                      onChange: (
                        page,
                        pageSize
                      ) => {
                        setSalePagination(
                          (
                            prev
                          ) => ({
                            ...prev,
                            page,
                            pageSize
                          })
                        )
                      }
                    }}
                  />
                )
              },

              {
                key: 'purchases',
                label: localT(
                  'tabs.purchases'
                ),

                children: (
                  <Table
                    rowKey='id'
                    loading={
                      isPurchaseLoading
                    }
                    columns={
                      purchaseInvoiceColumns
                    }
                    dataSource={
                      purchaseInvoices
                    }
                    scroll={{
                      x: 'max-content'
                    }}
                    pagination={{
                      current:
                        purchasePagination.page,

                      pageSize:
                        purchasePagination.pageSize,

                      total:
                        purchasePagination.total,

                      onChange: (
                        page,
                        pageSize
                      ) => {
                        setPurchasePagination(
                          (
                            prev
                          ) => ({
                            ...prev,
                            page,
                            pageSize
                          })
                        )
                      }
                    }}
                  />
                )
              },

              {
                key: 'shipping',
                label:
                  localT(
                    'tabs.shipping'
                  ),

                children: (
                  <Table
                    rowKey='id'
                    loading={
                      isTruckLoading
                    }
                    columns={
                      shippingInvoiceColumns
                    }
                    dataSource={
                      shippingInvoices
                    }
                    scroll={{
                      x: 'max-content'
                    }}
                    pagination={{
                      current:
                        truckPagination.page,

                      pageSize:
                        truckPagination.pageSize,

                      total:
                        truckPagination.total,

                      onChange: (
                        page,
                        pageSize
                      ) => {
                        setTruckPagination(
                          (
                            prev
                          ) => ({
                            ...prev,
                            page,
                            pageSize
                          })
                        )
                      }
                    }}
                  />
                )
              },

              {
                key: 'payments',
                label:
                  localT(
                    'tabs.payments'
                  ),

                children: (
                  <Table
                    rowKey='id'
                    loading={
                      isPaymentLoading
                    }
                    columns={
                      paymentColumns
                    }
                    dataSource={
                      payments
                    }
                    scroll={{
                      x: 'max-content'
                    }}
                    expandable={{
                      expandedRowRender: (record) => (
                        <Table
                          dataSource={record.allocations}
                          pagination={false}
                          size="small"
                          columns={[
                            { title: localT('allocation.ref-type'), dataIndex: 'referenceType', key: 'type' },
                            { title: localT('allocation.ref-id'), dataIndex: 'referenceId', key: 'id' },
                            {
                              title: localT('allocation.amount'),
                              dataIndex: 'allocatedAmount',
                              key: 'amount',
                              align: 'right',
                              render: (val) => formatTHB(val)
                            },
                          ]}
                          rowKey={(item) => `${item.referenceType}-${item.referenceId}`}
                        />
                      ),
                      rowExpandable: (record) => !!record.allocations && record.allocations.length > 0,
                    }}
                    pagination={{
                      current:
                        paymentPagination.page,

                      pageSize:
                        paymentPagination.pageSize,

                      total:
                        paymentPagination.total,

                      onChange: (
                        page,
                        pageSize
                      ) => {
                        setPaymentPagination(
                          (
                            prev
                          ) => ({
                            ...prev,
                            page,
                            pageSize
                          })
                        )
                      }
                    }}
                  />
                )
              }
            ]}
          />
        </Card>
      </Space>
    </>
  )
}

export default PartyDetail