import React from 'react'
import { Modal, Checkbox, Button, Space } from 'antd'
import { CloseOutlined } from '@ant-design/icons'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  fields: string[]
  selectedFields: Set<string>
  onToggleField: (field: string) => void
  onExport: () => void
  selectedCount: number
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  fields,
  selectedFields,
  onToggleField,
  onExport,
  selectedCount,
}) => {
  const handleSelectAll = () => {
    fields.forEach((f) => {
      if (!selectedFields.has(f)) onToggleField(f)
    })
  }

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      title={
        <div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>选择导出字段</div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
            已选择 {selectedCount} 张图片
          </div>
        </div>
      }
      closeIcon={<CloseOutlined />}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button onClick={handleSelectAll}>全选</Button>
          <Button
            type="primary"
            onClick={onExport}
            disabled={selectedFields.size === 0}
          >
            导出 CSV ({selectedFields.size} 个字段)
          </Button>
        </div>
      }
      width={480}
      bodyStyle={{ padding: '16px 24px', maxHeight: '50vh', overflowY: 'auto' }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size={8}>
        {fields.map((field) => (
          <Checkbox
            key={field}
            checked={selectedFields.has(field)}
            onChange={() => onToggleField(field)}
            style={{ padding: '8px 0' }}
          >
            {field}
          </Checkbox>
        ))}
      </Space>
    </Modal>
  )
}
