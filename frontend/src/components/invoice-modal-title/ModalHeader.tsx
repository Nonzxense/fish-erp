import { Avatar, Divider, Flex, Typography } from 'antd'
import { ModalHeaderProps } from './interface'

const { Text, Title } = Typography

const ModalHeader = ({ icon, title, subtitle, rightContent }: ModalHeaderProps) => {

  return (
    <>
      <Flex justify="space-between" align="center" className="w-full pr-8">
        <Flex gap={12} align="center">
          <Avatar
            shape="square"
            size={48}
            icon={icon}
            className="bg-blue-500 bg-[radial-gradient(circle_at_bottom_right,theme(colors.cyan.400)_0%,transparent_80%)] !border-0 !shadow-none !rounded-xl"
          />
          <div className="flex flex-col justify-center">
            <Title level={4} className="!mb-0">{title}</Title>
            <Text type='secondary'>{subtitle}</Text>
          </div>
        </Flex>
        {rightContent}
      </Flex>
      <Divider className="mb-4" />
    </>
  )
}

export default ModalHeader