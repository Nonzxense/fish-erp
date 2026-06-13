import { Avatar, Divider, Flex, Layout, Menu, MenuProps, Typography } from 'antd'
import Sider from 'antd/es/layout/Sider'
import React, { useMemo, useState } from 'react'
import { Boxes, Fish, HandCoins, House, ReceiptText, Settings, ShoppingCart, Truck, Users, } from 'lucide-react'
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
  const [collapsed, setCollapsed] = useState(false)

  const selectedKey = location.pathname.split('/')[1] || 'home'

  const menuIconClass = 'w-5 h-5 shrink-0 min-w-5 min-h-5'

  const menuItems: MenuItem[] = useMemo(
    () => [
      {
        key: 'home',
        icon: <House className={menuIconClass} />,
        label: localT('home'),
      },
      {
        key: 'income-and-expenses',
        icon: <HandCoins className={menuIconClass} />,
        label: localT('income-and-expense'),
      },
      {
        key: 'sales-invoices',
        icon: <ReceiptText className={menuIconClass} />,
        label: localT('sales-invoice'),
      },
      {
        key: 'purchase-invoices',
        icon: <ShoppingCart className={menuIconClass} />,
        label: localT('purchase-invoice'),
      },
      {
        key: 'truck-invoices',
        icon: <Truck className={menuIconClass} />,
        label: localT('truck-invoice'),
      },
      {
        key: 'containers',
        icon: <Boxes className={menuIconClass} />,
        label: localT('container'),
      },
      {
        key: 'parties',
        icon: <Users className={menuIconClass} />,
        label: localT('party'),
      },
      {
        key: 'settings',
        icon: <Settings className={menuIconClass} />,
        label: localT('settings'),
      },
    ],
    [localT]
  )

  const onClickMenuItem: MenuProps['onClick'] = async (e) => {
    if (e.key) {
      await navigate(`/${e.key}`)
    }
  }

  return (
    <Layout className="min-h-screen! max-h-screen!">
      <Sider
        width={300}
        theme="light"
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        style={siderStyle}
        className='sidebar'
      >
        <Flex className={collapsed ? 'justify-center' : 'px-6'}>
          <Flex gap={12} className="items-center min-h-[48px]">
            <Avatar
              shape="square"
              size={collapsed ? 36 : 48}
              icon={<Fish className="text-white" />}
              className="
                bg-blue-500
                bg-[radial-gradient(circle_at_bottom_right,theme(colors.cyan.400)_0%,transparent_80%)]
                !border-0 !shadow-none
                !rounded-xl
              "
            />
            {!collapsed && (
              <div className="flex flex-col items-start overflow-hidden">
                <Title level={4} className="!mb-0 whitespace-nowrap">{localT('title')}</Title>
                <Text type="secondary" className="whitespace-nowrap">{localT('subtitle')}</Text>
              </div>
            )}
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