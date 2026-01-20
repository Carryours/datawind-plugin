import React, { useEffect, useState } from 'react'
import { FieldMap } from './types'

interface Settings {
  layout?: {
    columns?: number
    gap?: number
  }
}

const App: React.FC = () => {
  const [vizData, setVizData] = useState<any>(null)
  const [settings, setSettings] = useState<Settings | null>(null)

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

      // 忽略非对象类型的消息
      if (!e.data || typeof e.data !== 'object') {
        return
      }

      const { type, data } = e.data
      if (type === 'propertiesChange') {
        console.log('vizData:', data?.vizData)
        console.log('settings:', data?.settings)
        if (data?.vizData) {
          setVizData(data.vizData)
        }
        if (data?.settings) {
          setSettings(data.settings)
        }
      }
    }

    window.addEventListener('message', handleMessage)

    // 清理函数
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  // 获取表头（字段名称）
  const getHeaders = (): { id: string; name: string }[] => {
    if (!vizData?.fieldMap) return []
    const locationMap = vizData.locationMap || {}
    const dimensions = locationMap[FieldMap.Dimension] || []
    const measures = locationMap[FieldMap.Measure] || []
    const allFieldIds = [...dimensions, ...measures]

    return allFieldIds.map((id: string) => ({
      id,
      name: vizData.fieldMap[id]?.alias || id,
    }))
  }

  // 获取表格数据
  const getTableData = (): any[] => {
    return vizData?.datasets || []
  }

  const headers = getHeaders()
  const tableData = getTableData()

  const styles = {
    container: {
      width: '100%',
      height: '100%',
      overflow: 'auto',
      padding: 16,
      boxSizing: 'border-box' as const,
      backgroundColor: '#f5f5f5',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    debugInfo: {
      marginBottom: 16,
      padding: 12,
      backgroundColor: '#fff3cd',
      border: '1px solid #ffc107',
      borderRadius: 4,
      fontSize: 12,
      color: '#856404',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      backgroundColor: '#fff',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      borderRadius: 8,
      overflow: 'hidden',
    },
    th: {
      padding: '12px 16px',
      textAlign: 'left' as const,
      backgroundColor: '#1890ff',
      color: '#fff',
      fontWeight: 600,
      fontSize: 14,
      borderBottom: '2px solid #096dd9',
    },
    td: {
      padding: '12px 16px',
      textAlign: 'left' as const,
      borderBottom: '1px solid #e8e8e8',
      fontSize: 14,
      color: '#333',
      maxWidth: 300,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap' as const,
    },
    tr: {
      transition: 'background-color 0.2s',
    },
    trHover: {
      backgroundColor: '#f5f5f5',
    },
    empty: {
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      color: '#999',
      fontSize: 14,
      gap: 8,
    },
    rawData: {
      marginTop: 16,
      padding: 12,
      backgroundColor: '#f6f8fa',
      border: '1px solid #e1e4e8',
      borderRadius: 6,
      fontSize: 12,
      fontFamily: 'monospace',
      whiteSpace: 'pre-wrap' as const,
      wordBreak: 'break-all' as const,
      maxHeight: 200,
      overflow: 'auto',
    },
  }

  // 显示调试信息
  const renderDebugInfo = () => (
    <div style={styles.debugInfo}>
      <strong>调试信息：</strong>
      <div>vizData 状态: {vizData ? '已接收' : '未接收'}</div>
      <div>datasets 数量: {vizData?.datasets?.length ?? 0}</div>
      <div>字段数量: {headers.length}</div>
      <div>locationMap: {JSON.stringify(vizData?.locationMap || {})}</div>
    </div>
  )

  // 如果没有数据，显示提示信息和原始数据
  if (!vizData || tableData.length === 0) {
    return (
      <div style={styles.container}>
        {renderDebugInfo()}
        <div style={styles.empty}>
          <div>暂无数据</div>
          <div>请配置维度字段并执行查询</div>
        </div>
        {vizData && (
          <div style={styles.rawData}>
            <strong>原始 vizData：</strong>
            <pre>{JSON.stringify(vizData, null, 2)}</pre>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {renderDebugInfo()}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>#</th>
            {headers.map((header) => (
              <th key={header.id} style={styles.th}>
                {header.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, rowIndex) => (
            <tr key={rowIndex} style={styles.tr}>
              <td style={styles.td}>{rowIndex + 1}</td>
              {headers.map((header) => (
                <td key={header.id} style={styles.td} title={String(row[header.id] ?? '')}>
                  {String(row[header.id] ?? '-')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* 显示原始数据用于调试 */}
      <div style={styles.rawData}>
        <strong>原始 vizData：</strong>
        <pre>{JSON.stringify(vizData, null, 2)}</pre>
      </div>
    </div>
  )
}

export default App
