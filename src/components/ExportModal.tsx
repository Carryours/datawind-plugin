import React from 'react'
import { theme } from '../theme'

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
  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        className="modal-enter"
        style={{
          backgroundColor: theme.bg.secondary,
          borderRadius: 16,
          border: `1px solid ${theme.border.medium}`,
          boxShadow: theme.shadow.lg,
          width: '90%',
          maxWidth: 480,
          maxHeight: '80vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: `1px solid ${theme.border.subtle}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 600,
                color: theme.text.primary,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              选择导出字段
            </h3>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: 13,
                color: theme.text.muted,
              }}
            >
              已选择 {selectedCount} 张图片
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: 'none',
              backgroundColor: theme.bg.tertiary,
              color: theme.text.secondary,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.bg.card
              e.currentTarget.style.color = theme.text.primary
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.bg.tertiary
              e.currentTarget.style.color = theme.text.secondary
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Field List */}
        <div
          style={{
            padding: '16px 24px',
            overflowY: 'auto',
            flex: 1,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {fields.map((field) => {
              const isChecked = selectedFields.has(field)
              return (
                <label
                  key={field}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    backgroundColor: isChecked ? theme.accent.glow : theme.bg.tertiary,
                    borderRadius: 10,
                    cursor: 'pointer',
                    border: `1px solid ${isChecked ? theme.accent.primary : theme.border.subtle}`,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isChecked) {
                      e.currentTarget.style.backgroundColor = theme.bg.card
                      e.currentTarget.style.borderColor = theme.border.medium
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isChecked) {
                      e.currentTarget.style.backgroundColor = theme.bg.tertiary
                      e.currentTarget.style.borderColor = theme.border.subtle
                    }
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      border: `2px solid ${isChecked ? theme.accent.primary : theme.border.strong}`,
                      backgroundColor: isChecked ? theme.accent.primary : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      flexShrink: 0,
                    }}
                  >
                    {isChecked && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={theme.bg.primary} strokeWidth="3">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleField(field)}
                    style={{ display: 'none' }}
                  />
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: isChecked ? theme.text.primary : theme.text.secondary,
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {field}
                  </span>
                </label>
              )
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: `1px solid ${theme.border.subtle}`,
            display: 'flex',
            gap: 12,
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={() => {
              fields.forEach((f) => {
                if (!selectedFields.has(f)) onToggleField(f)
              })
            }}
            style={{
              padding: '10px 18px',
              borderRadius: 8,
              border: `1px solid ${theme.border.medium}`,
              backgroundColor: 'transparent',
              color: theme.text.secondary,
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = theme.text.muted
              e.currentTarget.style.color = theme.text.primary
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = theme.border.medium
              e.currentTarget.style.color = theme.text.secondary
            }}
          >
            全选
          </button>
          <button
            onClick={onExport}
            disabled={selectedFields.size === 0}
            style={{
              padding: '10px 24px',
              borderRadius: 8,
              border: 'none',
              background: selectedFields.size > 0 ? theme.accent.gradient : theme.bg.tertiary,
              color: selectedFields.size > 0 ? theme.bg.primary : theme.text.muted,
              fontSize: 14,
              fontWeight: 600,
              cursor: selectedFields.size > 0 ? 'pointer' : 'not-allowed',
              fontFamily: "'DM Sans', sans-serif",
              transition: 'all 0.2s',
              boxShadow: selectedFields.size > 0 ? theme.shadow.glow : 'none',
            }}
          >
            导出 CSV ({selectedFields.size} 个字段)
          </button>
        </div>
      </div>
    </div>
  )
}
