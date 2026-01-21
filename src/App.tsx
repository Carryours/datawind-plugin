import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { FieldMap, Settings, FieldInfo, ImageCard } from './types'
import { theme } from './theme'
import { isUrl, isImageUrl } from './utils'
import { CARD_HEIGHT, BUFFER_SIZE, ROW_GAP } from './constants'
import { ExportModal } from './components/ExportModal'
import { ImageCardItem } from './components/ImageCardItem'
import './styles/index.less'

const App: React.FC = () => {
  const [vizData, setVizData] = useState<any>(null)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportFields, setExportFields] = useState<Set<string>>(new Set())

  // 虚拟滚动状态
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const columns = settings?.layout?.columns ?? 4
  const gap = settings?.layout?.gap ?? ROW_GAP


  // 切换选中状态
  const toggleSelect = useCallback((index: number) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }, [])

  // 切换导出字段
  const toggleExportField = useCallback((field: string) => {
    setExportFields((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(field)) {
        newSet.delete(field)
      } else {
        newSet.add(field)
      }
      return newSet
    })
  }, [])

  // 从数据中提取图片卡片信息
  const getImageCards = useCallback((): ImageCard[] => {
    if (!vizData?.datasets || !vizData?.fieldMap) return []

    const locationMap = vizData.locationMap || {}
    const dimensions = locationMap[FieldMap.Dimension] || []
    const measures = locationMap[FieldMap.Measure] || []
    const allFieldIds = [...dimensions, ...measures]
    const datasets = vizData.datasets || []

    return datasets
      .map((row: any) => {
        let imageUrl = ''
        let lrZs = ''
        let materialId = ''
        const fields: FieldInfo[] = []

        for (const fieldId of allFieldIds) {
          const value = String(row[fieldId] ?? '')
          const fieldName = vizData.fieldMap[fieldId]?.alias || fieldId
          const fieldIsImage = isImageUrl(value)
          const fieldIsUrl = isUrl(value)

          if (!imageUrl && fieldIsImage) {
            imageUrl = value
          }

          if (fieldName === 'LR_ZS' || fieldId === 'LR_ZS' || fieldName.includes('LR_ZS')) {
            lrZs = value
          }

          if (!materialId && (fieldName === '素材id' || fieldName === '素材ID' || fieldName === '素材Id')) {
            materialId = value
          }

          fields.push({
            key: fieldId,
            name: fieldName,
            value,
            isImage: fieldIsImage,
            isUrl: fieldIsUrl,
          })
        }

        return { imageUrl, fields, lrZs, materialId }
      })
      .filter((card: ImageCard) => card.imageUrl)
  }, [vizData])

  const imageCards = useMemo(() => getImageCards(), [getImageCards])

  // 导出 CSV（支持自定义字段）
  const handleExport = useCallback(() => {
    if (exportFields.size === 0 || selectedIds.size === 0) return

    const selectedCards = Array.from(selectedIds)
      .map((index) => imageCards[index])
      .filter(Boolean)

    if (selectedCards.length === 0) {
      alert('请先选择要导出的图片')
      return
    }

    const fieldNames = Array.from(exportFields)
    const headers = fieldNames.join(',')
    const rows = selectedCards.map((card) => {
      return fieldNames
        .map((fieldName) => {
          const field = card.fields.find((f) => f.name === fieldName)
          const value = field?.value || ''
          // CSV 转义处理
          if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        })
        .join(',')
    })

    const csvContent = [headers, ...rows].join('\n')
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `导出数据_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
    setShowExportModal(false)
  }, [exportFields, selectedIds, imageCards])

  // 全选/取消全选
  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === imageCards.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(imageCards.map((_, i) => i)))
    }
  }, [selectedIds.size, imageCards])

  // 监听消息
  useEffect(() => {
    const handleMessage = (
      e: MessageEvent<{
        type: string
        data: {
          vizData: any
          settings: Settings
        }
      }>
    ) => {
      if (!e.data || typeof e.data !== 'object') return
      const { type, data } = e.data
      if (type === 'propertiesChange') {
        if (data?.vizData) {
          setVizData(data.vizData)
          setSelectedIds(new Set())
        }
        if (data?.settings) {
          setSettings(data.settings)
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // 获取所有可导出的字段名
  const availableFields = useMemo(() => {
    if (imageCards.length === 0) return []
    const fieldSet = new Set<string>()
    imageCards.forEach((card) => {
      card.fields.forEach((field) => {
        if (field.name !== '预览') {
          fieldSet.add(field.name)
        }
      })
    })
    return Array.from(fieldSet)
  }, [imageCards])

  // ============ 虚拟滚动计算 ============
  const containerHeight = containerRef.current?.clientHeight || 800
  const totalRows = Math.ceil(imageCards.length / columns)
  const rowHeight = CARD_HEIGHT + gap
  const totalHeight = totalRows * rowHeight

  const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - BUFFER_SIZE)
  const endRow = Math.min(totalRows, Math.ceil((scrollTop + containerHeight) / rowHeight) + BUFFER_SIZE)

  const visibleCards = useMemo(() => {
    const startIndex = startRow * columns
    const endIndex = Math.min(endRow * columns, imageCards.length)
    return imageCards.slice(startIndex, endIndex).map((card, i) => ({
      card,
      originalIndex: startIndex + i,
    }))
  }, [imageCards, startRow, endRow, columns])

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  // 空状态
  if (!vizData || imageCards.length === 0) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: theme.bg.primary,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme.text.muted,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            backgroundColor: theme.bg.secondary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
          }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={theme.text.muted} strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </div>
        <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>暂无图片数据</p>
        <p style={{ fontSize: 13, color: theme.text.muted }}>请配置包含图片 URL 的维度字段</p>
      </div>
    )
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: theme.bg.primary,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* 顶部工具栏 */}
      <div
        style={{
          padding: '14px 24px',
          background: 'linear-gradient(to right, #ffffff, #f8fafc)',
          borderBottom: `1px solid ${theme.border.medium}`,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* 全选按钮 */}
          <button
            onClick={toggleSelectAll}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              borderRadius: 8,
              border: `1px solid ${theme.border.medium}`,
              backgroundColor: 'transparent',
              color: theme.text.secondary,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
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
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                border: `2px solid ${selectedIds.size === imageCards.length && imageCards.length > 0 ? theme.accent.primary : theme.border.strong}`,
                backgroundColor: selectedIds.size === imageCards.length && imageCards.length > 0 ? theme.accent.primary : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {selectedIds.size === imageCards.length && imageCards.length > 0 && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={theme.bg.primary} strokeWidth="3">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </div>
            全选
          </button>

          {/* 统计信息 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: theme.text.secondary, fontSize: 13 }}>
            <span>
              已选择{' '}
              <span style={{ color: theme.accent.primary, fontWeight: 600 }}>{selectedIds.size}</span>
            </span>
            <span style={{ color: theme.text.muted }}>/</span>
            <span>{imageCards.length} 张图片</span>
          </div>
        </div>

        {/* 导出按钮 */}
        <button
          onClick={() => {
            if (selectedIds.size === 0) {
              alert('请先选择要导出的图片')
              return
            }
            // 默认选中所有字段
            if (exportFields.size === 0) {
              setExportFields(new Set(availableFields))
            }
            setShowExportModal(true)
          }}
          disabled={selectedIds.size === 0}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            borderRadius: 8,
            border: 'none',
            background: selectedIds.size > 0 ? theme.accent.gradient : theme.bg.tertiary,
            color: selectedIds.size > 0 ? theme.bg.primary : theme.text.muted,
            fontSize: 14,
            fontWeight: 600,
            cursor: selectedIds.size > 0 ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
            boxShadow: selectedIds.size > 0 ? theme.shadow.glow : 'none',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          导出 CSV
        </button>
      </div>

      {/* 虚拟滚动容器 */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflow: 'auto',
          padding: 24,
        }}
      >
        <div
          style={{
            height: totalHeight,
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: startRow * rowHeight,
              left: 0,
              right: 0,
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: gap,
            }}
          >
            {visibleCards.map(({ card, originalIndex }, i) => (
              <ImageCardItem
                key={originalIndex}
                card={card}
                index={originalIndex}
                isSelected={selectedIds.has(originalIndex)}
                onToggleSelect={toggleSelect}
                animationDelay={(i % (columns * 2)) * 30}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 导出字段选择 Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        fields={availableFields}
        selectedFields={exportFields}
        onToggleField={toggleExportField}
        onExport={handleExport}
        selectedCount={selectedIds.size}
      />
    </div>
  )
}

export default App
