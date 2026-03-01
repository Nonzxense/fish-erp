import { Avatar, Divider, Flex, Layout, Menu, MenuProps, Typography } from 'antd'
import Sider from 'antd/es/layout/Sider'
import React, { useMemo } from 'react'
import { FileText, Fish, House, Package, Receipt, Settings, Truck, Users, Wallet } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

type MenuItem = Required<MenuProps>['items'][number]

const siderStyle: React.CSSProperties = {
  overflow: 'auto',
  height: '100vh',
  position: 'sticky',
  insetInlineStart: 0,
  top: 0,
  bottom: 0,
  paddingTop: 16
}

const { Title, Text } = Typography

const AppSidebar: React.FC = () => {
  const { t: localT } = useTranslation('sidebar')
  const navigate = useNavigate()

  const menuItems: MenuItem[] = useMemo(
    () => [
      {
        key: 'home',
        icon: <House size={20} />,
        label: localT('home'),
        onClick: () => {navigate('/')}
      },
      {
        key: 'iae',
        icon: <Wallet size={20} />,
        label: localT('iae'),
        onClick: () => {navigate('/income-and-expense')}
      },
      {
        key: 'purchase-invoice',
        icon: <FileText size={20} />,
        label: localT('purchase-invoice'),
        onClick: () => {navigate('/purchase-invoices')}
      },
      {
        key: 'sales-invoice',
        icon: <Receipt size={20} />,
        label: localT('sales-invoice'),
        onClick: () => {navigate('/sales-invoices')}
      },
      {
        key: 'truck-invoice',
        icon: <Truck size={20} />,
        label: localT('sales-invoice'),
        onClick: () => {navigate('/truck-invoices')}
      },
      {
        key: 'crate',
        icon: <Package size={20} />,
        label: localT('crate'),
        onClick: () => {navigate('/crates')}
      },
      {
        key: 'party',
        icon: <Users size={20} />,
        label: localT('party'),
        onClick: () => {navigate('/parties')}
      },
      {
        key: 'settings',
        icon: <Settings size={20} />,
        label: localT('settings'),
        onClick: () => {navigate('/settings')}
      },
    ], [localT, navigate])

  return (
    <Layout className="min-h-screen! max-h-screen!">
      <Sider width={300} theme="light" style={siderStyle} className='sidebar'>
        <Flex className='justify-center'>
          <Flex gap={10} className="items-center ">
            <Avatar
              shape="square"
              size={48}
              icon={<Fish className="text-white" />}
              className="
                bg-blue-500
                bg-[radial-gradient(circle_at_bottom_right,theme(colors.cyan.400)_0%,transparent_80%)]
                !border-0 !shadow-none
                !rounded-xl
              "
            />
            <div className="flex flex-col items-start">
              <Title level={4} className="!mb-0">{localT('title')}</Title>
              <Text type="secondary">{localT('subtitle')}</Text>
            </div>
          </Flex>
        </Flex>
        <Divider size='small' />
        <div className='px-2'>
          <Menu
            theme="light"
            mode="inline"
            defaultSelectedKeys={['home']}
            items={menuItems}
            className='select-none'
          />
        </div>
      </Sider>
    </Layout>
  )
}

export default AppSidebar