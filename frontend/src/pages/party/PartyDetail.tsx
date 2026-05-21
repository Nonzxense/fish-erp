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
  Tooltip
} from 'antd'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Eye,
  PencilLine,
  Trash2,
  Undo2,
  Wallet
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import PageTitle from '../../components/page-title/PageTitle'

import {
  formatDate,
  formatTHB
} from '../../utils/formatter'

import {
  invoice as invoiceModel,
  party as partyModel,
  payment as paymentModel,
  truckinvoice as truckinvoiceModel
} from '../../../wailsjs/go/models'

import PaymentModal from '../party/components/modal/PaymentModal'

import {
  GetFishPurchaseInvoices,
  GetFishSaleInvoices,
  GetParty,
  GetPaymentsByPartyID,
} from '../../../wailsjs/go/main/App'

import { Pagination } from '../../utils/types'

import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE
} from '../../utils/constants'

import { getPaidStatusColor } from '../../utils/getTagColor'

const PartyDetail = () => {
  const { id } = useParams()

  const navigate = useNavigate()

  const { t: localT } =
    useTranslation('party')

  const { t: commonT } =
    useTranslation('common')

  const { modal, message } =
    App.useApp()

  // =========================
  // UI
  // =========================

  const [activeTab, setActiveTab] =
    useState('sales')

  const [
    isOpenPaymentModal,
    setIsOpenPaymentModal
  ] = useState(false)

  // =========================
  // LOADING
  // =========================

  const [isPartyLoading, setIsPartyLoading] =
    useState(false)

  const [isSaleLoading, setIsSaleLoading] =
    useState(false)

  const [
    isPurchaseLoading,
    setIsPurchaseLoading
  ] = useState(false)

  const [isTruckLoading, setIsTruckLoading] =
    useState(false)

  const [
    isPaymentLoading,
    setIsPaymentLoading
  ] = useState(false)

  // =========================
  // DATA
  // =========================

  const [partyDetail, setPartyDetail] =
    useState<partyModel.PartyWithDebt>()

  const [saleInvoices, setSaleInvoices] =
    useState<
      invoiceModel.FishSaleInvoice[]
    >([])

  const [
    purchaseInvoices,
    setPurchaseInvoices
  ] = useState<
    invoiceModel.FishPurchaseInvoice[]
  >([])

  const [truckInvoices, setTruckInvoices] =
    useState<
      truckinvoiceModel.TruckInvoice[]
    >([])

  const [payments, setPayments] =
    useState<
      paymentModel.Payment[]
    >([])

  // =========================
  // PAGINATION
  // =========================

  const [
    salePagination,
    setSalePagination
  ] = useState<Pagination>({
    page: DEFAULT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0
  })

  const [
    purchasePagination,
    setPurchasePagination
  ] = useState<Pagination>({
    page: DEFAULT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0
  })

  const [
    truckPagination,
    setTruckPagination
  ] = useState<Pagination>({
    page: DEFAULT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0
  })

  const [
    paymentPagination,
    setPaymentPagination
  ] = useState<Pagination>({
    page: DEFAULT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0
  })

  // =========================
  // STATS
  // =========================

  const totalPayments = payments.reduce(
    (sum, curr) => sum + curr.amount,
    0
  )

  // =========================
  // LOAD PARTY
  // =========================

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

  // =========================
  // LOAD SALE INVOICES
  // =========================

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

  // =========================
  // LOAD PURCHASE INVOICES
  // =========================

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

  // =========================
  // LOAD TRUCK INVOICES
  // =========================

  const loadTruckInvoices =
    useCallback(async () => {
      //     if (!id) return

      //     try {
      //       setIsTruckLoading(true)

      //       const result =
      //         await GetTruckInvoicesByPartyID(id)

      //       setTruckInvoices(result.data)

      //       setTruckPagination((prev) => ({
      //         ...prev,
      //         total: result.total
      //       }))
      //     } catch (err) {
      //       console.error(err)

      //       message.error(
      //         commonT('message.error-load-data')
      //       )
      //     } finally {
      //       setIsTruckLoading(false)
      //     }
    }, [id, message, commonT])

  // =========================
  // LOAD PAYMENTS
  // =========================

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

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    loadParty()
  }, [loadParty])

  // =========================
  // TAB LOAD
  // =========================

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

  // =========================
  // DELETE
  // =========================

  const handleDelete =
    useCallback(() => {
      modal.confirm({
        title:
          commonT(
            'modal-delete.title'
          ),

        content: commonT(
          'modal-delete.desc',
          {
            amount: 1
          }
        ),

        okText:
          commonT('modal-common.ok'),

        cancelText:
          commonT(
            'modal-common.cancel'
          ),

        okButtonProps: {
          danger: true
        },

        onOk: async () => {
          try {
            // TODO:
            // await DeleteParty(id)

            message.success(
              commonT(
                'message.delete-success'
              )
            )

            navigate('/parties')
          } catch (err) {
            console.error(err)

            message.error(
              commonT(
                'message.delete-error'
              )
            )
          }
        }
      })
    }, [
      modal,
      commonT,
      message,
      navigate
    ])

  // =========================
  // COLUMNS
  // =========================

  const commonInvoiceColumns: TableColumnsType =
    useMemo(
      () => [
        {
          title: localT('invoice.id'),
          dataIndex: 'id',
          key: 'id'
        },
        {
          title: localT(
            'invoice.date'
          ),
          dataIndex: 'createdAt',
          key: 'createdAt',
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
          render: (val: number) =>
            formatTHB(val)
        },
        {
          title:
            commonT('table.status'),
          dataIndex: 'status',
          key: 'status',
          align: 'center',
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
        {
          title:
            commonT('table.manage'),
          key: 'manage',
          align: 'center',
          render: (_, record) => (
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
          )
        }
      ],
      [localT, commonT, navigate]
    )

  const paymentColumns:
    TableColumnsType<paymentModel.Payment> =
    useMemo(
      () => [
        {
          title: localT(
            'payment.date'
          ),
          dataIndex: 'paymentDate',
          key: 'paymentDate',
          render: (val) =>
            formatDate(val)
        },
        {
          title: localT(
            'payment.direction'
          ),
          dataIndex: 'direction',
          key: 'direction',
          render: (val) => val.toUpperCase()
        },
        {
          title: localT(
            'payment.amount'
          ),
          dataIndex: 'amount',
          key: 'amount',
          align: 'right',
          render: (
            val: number
          ) => formatTHB(val)
        },
        {
          title: localT(
            'payment.method'
          ),
          dataIndex: 'method',
          key: 'method'
        },
        {
          title: localT('table.manage'),
          key: 'manage',
          align: 'center',
          width: 100,
          render: (_) => {
            return (
              <Space>
                <Tooltip title={localT('button-rollback')}>
                  <Button
                    icon={<Undo2 size={16} />}
                    variant="text"
                    color="danger"
                    // onClick={() => handleEditContainer(record)}
                  />
                </Tooltip>
              </Space>
            )
          }
        }
      ],
      [localT]
    )

  return (
    <>
      <PaymentModal
        isOpen={isOpenPaymentModal}
        onClose={() =>
          setIsOpenPaymentModal(false)
        }
        party={partyDetail}
        onSuccess={loadPayments}
      />

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

          <Space wrap>
            <Button
              icon={
                <Wallet size={16} />
              }
              className='gradient-btn'
              onClick={() =>
                setIsOpenPaymentModal(
                  true
                )
              }
            >
              {localT(
                'button.receive-payment'
              )}
            </Button>

            <Button
              icon={
                <PencilLine size={16} />
              }
              color='primary'
              variant='outlined'
            >
              {commonT('button-edit')}
            </Button>

            <Button
              danger
              icon={
                <Trash2 size={16} />
              }
              variant='outlined'
              onClick={handleDelete}
            >
              {commonT(
                'button-delete'
              )}
            </Button>
          </Space>
        </Flex>

        <Card loading={isPartyLoading}>
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
          <Col xs={24} md={6}>
            <Card>
              <Statistic
                title={localT(
                  'stats.total-debt'
                )}
                value={
                  partyDetail?.totalDebt ||
                  0
                }
                formatter={(val) =>
                  formatTHB(
                    Number(val)
                  )
                }
              />
            </Card>
          </Col>

          <Col xs={24} md={6}>
            <Card>
              <Statistic
                title={localT(
                  'stats.total-payments'
                )}
                value={totalPayments}
                formatter={(val) =>
                  formatTHB(
                    Number(val)
                  )
                }
              />
            </Card>
          </Col>
        </Row>

        <Card>
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
                      commonInvoiceColumns
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
                      commonInvoiceColumns
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
                      commonInvoiceColumns
                    }
                    dataSource={
                      truckInvoices
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