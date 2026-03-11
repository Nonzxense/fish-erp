import { Avatar, Divider, Flex, Layout, Menu, MenuProps, Typography } from 'antd'
import Sider from 'antd/es/layout/Sider'
import React, { useMemo } from 'react'
import { FileText, Fish, House, Package, Receipt, Settings, Truck, Users, Wallet } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Content } from 'antd/es/layout/layout'

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

const AppLayout = () => {
  const { t: localT } = useTranslation('sidebar')
  const navigate = useNavigate()
  const location = useLocation()

  const selectedKey = location.pathname.split('/')[1] || 'home'

  const menuItems: MenuItem[] = useMemo(
    () => [
      {
        key: 'home',
        icon: <House size={20} />,
        label: localT('home'),
      },
      {
        key: 'income-and-expenses',
        icon: <Wallet size={20} />,
        label: localT('income-and-expense'),
      },
      {
        key: 'purchase-invoices',
        icon: <FileText size={20} />,
        label: localT('purchase-invoice'),
      },
      {
        key: 'sales-invoices',
        icon: <Receipt size={20} />,
        label: localT('sales-invoice'),
      },
      {
        key: 'truck-invoices',
        icon: <Truck size={20} />,
        label: localT('sales-invoice'),
      },
      {
        key: 'crates',
        icon: <Package size={20} />,
        label: localT('crate'),
      },
      {
        key: 'parties',
        icon: <Users size={20} />,
        label: localT('party'),
      },
      {
        key: 'settings',
        icon: <Settings size={20} />,
        label: localT('settings'),
      },
    ], [localT])

  const onClickMenuItem: MenuProps['onClick'] = async (e) => {
    if (e.key) {
      await navigate(`/${e.key}`)
    }
  }

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
            selectedKeys={[selectedKey]}
            onClick={onClickMenuItem}
            className='select-none'
          />
        </div>
      </Sider>
      <Layout>
        <Content className="overflow-auto p-8 border">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default AppLayout