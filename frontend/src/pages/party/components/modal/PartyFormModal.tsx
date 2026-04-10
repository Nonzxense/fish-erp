import { App, Button, Flex, Form, Input, Modal, Select } from "antd"
import { PartyFormModalProp, PartyFormValues } from "./interface"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { CreateParty } from "../../../../../wailsjs/go/main/App"
import { party as partyModel } from "../../../../../wailsjs/go/models"

const PartyFormModal = ({ isOpen, onClose, onChange, party }: PartyFormModalProp) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [form] = Form.useForm<PartyFormValues>()
  const { t: localT } = useTranslation('party')
  const { t: commonT } = useTranslation('common')
  const { message } = App.useApp()
  const isEdit = !!party

  const partyTypeOptions = useMemo(() => [
    { label: localT('type.driver'), value: 'driver' },
    { label: localT('type.mover'), value: 'mover' },
    { label: localT('type.customer'), value: 'customer' },
  ], [localT])

  const handleSubmit = async (values: PartyFormValues) => {
    setIsLoading(true)
    try {
      const payload = new partyModel.Party({
        name: values.name,
        phone: values.phone,
        note: values.note
      })

      if (isEdit && party) {
        // await UpdateParty(party.id, payload)
        message.success(commonT('message.update-success'))
      } else {
        await CreateParty(payload)
        message.success(commonT('message.create-success'))
      }

      onChange()
      handleCloseModal()
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseModal = useCallback(() => {
    onClose()
    form.resetFields()
  }, [onClose, form])

  useEffect(() => {
    if (isOpen) {
      if (party) {
        form.setFieldsValue({
          name: party.name,
          phone: party.phone,
          note: party.note
        })
      } else {
        form.resetFields()
      }
    }
  }, [isOpen, party, form])

  return (
    <Modal
      title={isEdit ? localT('modal.title-edit') : localT('modal.title-create')}
      open={isOpen}
      onCancel={handleCloseModal}
      footer={null}
      mask={{ closable: !isLoading }}
      destroyOnHidden
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
          label={localT('table.name')}
          rules={[{ required: true, message: localT('form.name.validate.required') }]}
        >
          <Input placeholder={localT('form.name.placeholder')} />
        </Form.Item>
        <Form.Item
          name="phone"
          label={localT('table.phone')}
          rules={[{ required: true, message: localT('form.phone.validate.required') }]}
        >
          <Input placeholder={localT('form.phone.placeholder')} />
        </Form.Item>
        <Form.Item
          name="type"
          label={localT('table.type')}
          rules={[{ required: true, message: localT('form.type.validate.required') }]}
        >
          <Select
            placeholder={localT('form.type.placeholder')}
            options={partyTypeOptions}
          />
        </Form.Item>
        <Form.Item
          name="note"
          label={localT('table.note')}
        >
          <Input.TextArea
            rows={3}
            placeholder={localT('form.note.placeholder')}
          />
        </Form.Item>
        <Form.Item noStyle>
          <Flex gap={12} justify="end">
            <Button onClick={handleCloseModal}>
              {commonT('modal-common.cancel')}
            </Button>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              {commonT('modal-common.ok')}
            </Button>
          </Flex>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default PartyFormModal