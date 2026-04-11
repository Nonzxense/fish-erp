import { Button, Form, InputNumber, Modal, Select } from "antd"
import { ContainerFormValues, ContainerFormModalProp } from "./interface"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { CreateContainer, UpdateContainer } from "../../../../../wailsjs/go/main/App"
import { container as containerModel } from "../../../../../wailsjs/go/models"

const ContainerFormModal = ({ isOpen, onClose, onChange, container }: ContainerFormModalProp) => {
  const [isLoading, _setIsLoading] = useState<boolean>(false)
  const [form] = Form.useForm<ContainerFormValues>()
  const { t: localT } = useTranslation('container')
  const { t: commonT } = useTranslation('common')
  const isEdit = !!container

  const containerColorOptions = useMemo(() => [
    {
      label: localT('color.blue'),
      value: 'blue'
    },
    {
      label: localT('color.light-green'),
      value: 'light-green'
    },
    {
      label: localT('color.green'),
      value: 'green'
    },
    {
      label: localT('color.orange'),
      value: 'orange'
    },
    {
      label: localT('color.yellow'),
      value: 'yellow'
    },
    {
      label: localT('color.red'),
      value: 'red'
    },
  ], [localT])

  const handleSubmit = async (values: ContainerFormValues) => {
    const payload = new containerModel.CreateContainerInput({
      id: Number(values.id),
      type: values.type,
      color: values.color,
      status: values.status ?? undefined
    })

    if (isEdit && container) {
      await UpdateContainer(container.id, payload)
    } else {
      try {
        await CreateContainer(payload)
      } catch {
        // handle by interceptor
      }
    }

    onChange()
    form.resetFields()
    onClose()
  }

  const handleCloseModal = useCallback(() => {
    onClose()
    form.resetFields()
  }, [onClose, form])

  useEffect(() => {
    if (isOpen && container) {
      form.setFieldsValue({
        id: container.id,
        type: container.type,
        color: container.color,
        status: container.status ?? undefined
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
          name="id"
          label={localT('form.id.label')}
          rules={[{ required: true, message: localT('form.id.validate.required') }]}
        >
          <InputNumber
            className="w-full"
            placeholder={localT('form.id.placeholder')}
            disabled={isEdit}
          />
        </Form.Item>
        <Form.Item
          name="type"
          label={localT('form.type.label')}
          rules={[{ required: true, message: localT('form.type.validate.required') }]}
        >
          <Select
            placeholder={localT('form.type.placeholder')}
            options={[
              { label: commonT('plastic-l'), value: 'plastic_l' },
              { label: commonT('plastic-s'), value: 'plastic_s' },
              { label: commonT('foam-l'), value: 'foam_l' },
              { label: commonT('foam-m'), value: 'foam_m' },
              { label: commonT('foam-s'), value: 'foam_s' },
            ]}
          />
        </Form.Item>
        <Form.Item
          name="color"
          label={localT('form.color.label')}
        >
          <Select
            allowClear
            options={containerColorOptions}
            placeholder={localT('form.color.placeholder')}
          />
        </Form.Item>
        <Form.Item
          name="status"
          label={localT('form.status.label')}
        >
          <Select
            placeholder={localT('form.status.placeholder')}
            allowClear
            options={[
              { label: localT('at-store'), value: 'at_store' },
              { label: localT('with-customer'), value: 'with_customer' },
              { label: localT('lost'), value: 'lost' },
            ]}
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