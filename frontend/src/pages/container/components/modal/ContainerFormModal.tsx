import { Button, Form, Input, InputNumber, Modal, Select } from "antd"
import { ContainerFormValues, ContainerFormModalProp } from "./interface"
import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { CreateContainer, UpdateContainer } from "../../../../../wailsjs/go/main/App"
import { container as containerModel } from "../../../../../wailsjs/go/models"
import useContainerColorOptions from "../../../../hooks/useContainerColorOptions"
import useContainerTypeOptions from "../../../../hooks/useContainerTypeOptions"

const ContainerFormModal = ({ isOpen, onClose, onChange, container }: ContainerFormModalProp) => {
  const [isLoading, _setIsLoading] = useState<boolean>(false)
  const [form] = Form.useForm<ContainerFormValues>()
  const { t: localT } = useTranslation('container')
  const { t: commonT } = useTranslation('common')
  const containerColorOptions = useContainerColorOptions()
  const containerTypeOptions = useContainerTypeOptions()
  const isEdit = !!container

  const handleSubmit = async (values: ContainerFormValues) => {
    const payload = new containerModel.CreateContainerInput({
      containerNo: Number(values.containerNo),
      name: values.name,
      type: values.type,
      color: values.color,
      status: values.status ?? undefined
    })

    try {
      if (isEdit && container) {
        await UpdateContainer(container.id, payload)
      } else {
        await CreateContainer(payload)
      }
    } catch {
      // handle by interceptor
    }

    onChange()
    handleCloseModal()
  }

  const handleCloseModal = useCallback(() => {
    onClose()
    form.resetFields()
  }, [onClose, form])

  useEffect(() => {
    if (isOpen && container) {
      form.setFieldsValue({
        containerNo: container.containerNo,
        name: container.name,
        type: container.type,
        color: container.color,
      })
    } else if (isOpen && !container) {
      form.resetFields()
    }
  }, [isOpen, container, form])

  return (
    <Modal
      title={isEdit ? commonT('modal-common.title-edit') : commonT('modal-common.title-create')}
      open={isOpen}
      onCancel={handleCloseModal}
      footer={null}
      mask={{ closable: !isLoading }}
      classNames={{
        container: 'pb-1!',
      }}
    >
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
        onFinish={handleSubmit}
        disabled={isLoading}
      >
        <Form.Item
          name="name"
          label={localT('form.name.label')}
          rules={[{ required: true, message: localT('form.name.validate.required') }]}
        >
          <Input placeholder={localT('form.name.placeholder')} />
        </Form.Item>
        <Form.Item
          name="containerNo"
          label={localT('form.id.label')}
          rules={[{ required: true, message: localT('form.id.validate.required') }]}
        >
          <InputNumber
            className="w-full"
            placeholder={localT('form.id.placeholder')}
          />
        </Form.Item>
        <Form.Item
          name="type"
          label={localT('form.type.label')}
          rules={[{ required: true, message: localT('form.type.validate.required') }]}
        >
          <Select
            placeholder={localT('form.type.placeholder')}
            options={containerTypeOptions}
          />
        </Form.Item>
        <Form.Item
          name="color"
          label={localT('form.color.label')}
          rules={[{ required: true, message: localT('form.color.validate.required') }]}
        >
          <Select
            allowClear
            options={containerColorOptions}
            placeholder={localT('form.color.placeholder')}
          />
        </Form.Item>
        <Form.Item noStyle>
          <Button type="primary" htmlType="submit" loading={isLoading} block>
            {commonT('modal-common.ok')}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default ContainerFormModal