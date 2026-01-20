import React, { useEffect, useState } from 'react'
import { FieldMap } from './types'

interface Settings {
  layout?: {
    columns?: number
    gap?: number
  }
}

// 判断是否是 URL
const isUrl = (value: string): boolean => {
  if (!value || typeof value !== 'string') return false
  return value.startsWith('http://') || value.startsWith('https://')
}

// 判断是否是图片 URL
const isImageUrl = (value: string): boolean => {
  if (!isUrl(value)) return false

  // 检查常见图片扩展名
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico']
  const lowerValue = value.toLowerCase().split('?')[0]

  if (imageExtensions.some(ext => lowerValue.endsWith(ext))) {
    return true
  }

  // 检查常见图片服务的 URL 模式
  const imagePatterns = [
    /\/image\//i,
    /\/img\//i,
    /\/photo\//i,
    /\/pic\//i,
    /\.image$/i,
    /format=(?:jpg|jpeg|png|gif|webp)/i,
  ]

  return imagePatterns.some(pattern => pattern.test(value))
}

interface FieldInfo {
  key: string      // 字段 ID
  name: string     // 字段名称（alias）
  value: string    // 字段值
  isImage: boolean // 是否是图片
  isUrl: boolean   // 是否是普通 URL
}

interface ImageCard {
  imageUrl: string
  fields: FieldInfo[]  // 所有字段，包含 key
  lrZs?: string        // 模型一级分类 LR_ZS 字段
}

const App: React.FC = () => {
  const [vizData, setVizData] = useState<any>(null)
  const [settings, setSettings] = useState<Settings | null>(null)

  const columns = settings?.layout?.columns ?? 4
  const gap = settings?.layout?.gap ?? 16

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
      console.log('Received message:', e.data)

      if (!e.data || typeof e.data !== 'object') {
        return
      }

      const { type, data } = e.data
      if (type === 'propertiesChange') {
        if (data?.vizData) {
          setVizData(data.vizData)
        }
        if (data?.settings) {
          setSettings(data.settings)
        }
      }
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  // 从数据中提取图片卡片信息
  const getImageCards = (): ImageCard[] => {
    if (!vizData?.datasets || !vizData?.fieldMap) return []

    const locationMap = vizData.locationMap || {}
    const dimensions = locationMap[FieldMap.Dimension] || []
    const measures = locationMap[FieldMap.Measure] || []
    const allFieldIds = [...dimensions, ...measures]
    const datasets = vizData.datasets || []

    return datasets.map((row: any) => {
      let imageUrl = ''
      let lrZs = ''
      const fields: FieldInfo[] = []

      // 遍历所有字段
      for (const fieldId of allFieldIds) {
        const value = String(row[fieldId] ?? '')
        const fieldName = vizData.fieldMap[fieldId]?.alias || fieldId
        const fieldIsImage = isImageUrl(value)
        const fieldIsUrl = isUrl(value)

        // 找到第一个图片 URL 作为主图
        if (!imageUrl && fieldIsImage) {
          imageUrl = value
        }

        // 查找 LR_ZS 字段（模型一级分类）
        if (fieldName === 'LR_ZS' || fieldId === 'LR_ZS' || fieldName.includes('LR_ZS')) {
          lrZs = value
        }

        // 记录所有字段信息
        fields.push({
          key: fieldId,
          name: fieldName,
          value,
          isImage: fieldIsImage,
          isUrl: fieldIsUrl,
        })
      }

      return { imageUrl, fields, lrZs }
    }).filter((card: ImageCard) => card.imageUrl) // 只保留有图片的卡片
  }

  const imageCards = getImageCards()

  // 使用透明/适配的颜色方案
  const styles = {
    container: {
      width: '100%',
      height: '100%',
      overflow: 'auto',
      padding: gap,
      boxSizing: 'border-box' as const,
      backgroundColor: 'transparent',  // 透明背景，适配父级
    },
    debugInfo: {
      marginBottom: 16,
      padding: 12,
      backgroundColor: 'rgba(255, 243, 205, 0.9)',
      border: '1px solid #ffc107',
      borderRadius: 8,
      fontSize: 12,
      color: '#856404',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: gap,
    },
    card: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',  // 半透明白色，适配各种背景
      borderRadius: 12,
      overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(0, 0, 0, 0.06)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      cursor: 'pointer',
    },
    imageWrapper: {
      position: 'relative' as const,
      width: '100%',
      paddingTop: '75%', // 4:3 比例
      overflow: 'hidden',
      backgroundColor: '#f5f5f5',
    },
    badge: {
      position: 'absolute' as const,
      top: 0,
      right: 0,
      backgroundColor: '#f9c800',  // 黄色背景
      color: '#333',
      fontSize: 12,
      fontWeight: 600,
      padding: '4px 10px',
      borderBottomLeftRadius: 8,
      zIndex: 10,
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
    },
    image: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover' as const,
      transition: 'transform 0.3s ease',
    },
    cardContent: {
      padding: '12px 14px',
    },
    fieldRow: {
      display: 'flex',
      fontSize: 12,
      color: '#333',
      marginBottom: 6,
      lineHeight: 1.4,
    },
    fieldKey: {
      color: '#666',
      fontWeight: 500,
      marginRight: 6,
      flexShrink: 0,
      minWidth: 50,
    },
    fieldValue: {
      color: '#333',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap' as const,
      flex: 1,
    },
    fieldValueUrl: {
      color: '#1890ff',
      textDecoration: 'none',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap' as const,
      flex: 1,
    },
    empty: {
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      minHeight: 300,
      color: '#999',
      fontSize: 14,
      gap: 8,
    },
    rawData: {
      marginTop: 16,
      padding: 12,
      backgroundColor: 'rgba(246, 248, 250, 0.95)',
      border: '1px solid #e1e4e8',
      borderRadius: 8,
      fontSize: 12,
      fontFamily: 'monospace',
      whiteSpace: 'pre-wrap' as const,
      wordBreak: 'break-all' as const,
      maxHeight: 200,
      overflow: 'auto',
    },
  }

  // 渲染字段值
  const renderFieldValue = (field: FieldInfo) => {
    if (!field.value) return <span style={styles.fieldValue}>-</span>

    // 图片链接显示缩略标记
    if (field.isImage) {
      return (
        <span
          style={styles.fieldValueUrl}
          title={field.value}
          onClick={(e) => {
            e.stopPropagation()
            window.open(field.value, '_blank')
          }}
        >
          🖼️ [图片链接]
        </span>
      )
    }

    // 普通 URL
    if (field.isUrl) {
      return (
        <span
          style={styles.fieldValueUrl}
          title={field.value}
          onClick={(e) => {
            e.stopPropagation()
            window.open(field.value, '_blank')
          }}
        >
          🔗 [链接]
        </span>
      )
    }

    // 普通文本
    return (
      <span style={styles.fieldValue} title={field.value}>
        {field.value}
      </span>
    )
  }

  // 显示调试信息
  // const renderDebugInfo = () => (
  //   <div style={styles.debugInfo}>
  //     <strong>调试信息：</strong>
  //     <span style={{ marginLeft: 8 }}>
  //       vizData: {vizData ? '✓' : '✗'} |
  //       数据行: {vizData?.datasets?.length ?? 0} |
  //       图片卡片: {imageCards.length} |
  //       列数: {columns}
  //     </span>
  //   </div>
  // )

  // 如果没有数据
  if (!vizData || imageCards.length === 0) {
    return (
      <div style={styles.container}>
        {/* {renderDebugInfo()} */}
        <div style={styles.empty}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🖼️</div>
          <div>暂无图片数据</div>
          <div style={{ fontSize: 12 }}>请配置包含图片 URL 的维度字段</div>
        </div>
        {vizData && (
          <div style={styles.rawData}>
            <strong>原始数据：</strong>
            <pre>{JSON.stringify(vizData, null, 2)}</pre>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* {renderDebugInfo()} */}
      <div style={styles.grid}>
        {imageCards.map((card, index) => (
          <div
            key={index}
            style={styles.card}
            onClick={() => window.open(card.imageUrl, '_blank')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)'
              const img = e.currentTarget.querySelector('img')
              if (img) img.style.transform = 'scale(1.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = ''
              e.currentTarget.style.boxShadow = ''
              const img = e.currentTarget.querySelector('img')
              if (img) img.style.transform = ''
            }}
          >
            <div style={styles.imageWrapper}>
              {card.lrZs && (
                <div style={styles.badge}>
                  {card.lrZs}
                </div>
              )}
              <img
                src={card.imageUrl}
                alt="图片"
                style={styles.image}
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect fill="%23f0f0f0" width="100" height="100"/><text fill="%23999" font-size="12" x="50" y="50" text-anchor="middle" dy=".3em">加载失败</text></svg>'
                }}
              />
            </div>
            <div style={styles.cardContent}>
              {card.fields.filter((field) => field.name !== '预览').map((field, idx) => (
                <div key={idx} style={styles.fieldRow}>
                  <span style={styles.fieldKey}>{field.name}:</span>
                  {renderFieldValue(field)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
