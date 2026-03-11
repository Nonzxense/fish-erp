import { Typography } from "antd"
import { PageTitleProp } from "./interface"

const { Title, Text } = Typography

const PageTitle = ({ title, subtitle }: PageTitleProp) => {
  return (
    <div className="flex flex-col items-start">
      <Title level={4} className="!mb-0">
        {title}
      </Title>
      <Text type="secondary">{subtitle}</Text>
    </div>
  )
}

export default PageTitle