import React, { useEffect, useState, useRef } from 'react'
import * as echarts from 'echarts'
import { FieldMap } from './types'

declare global {
  interface Window {
    google: any
  }
}
interface RenderData {
  name: string
  value: number
}

const useChart = (chartRef: React.RefObject<HTMLElement>, options: any) => {
  let chartInstance: echarts.ECharts

  const renderChart = () => {
    if (chartRef?.current) {
      chartInstance = echarts.init(chartRef?.current)
      chartInstance.setOption(options)
    }
  }
  useEffect(() => {
    renderChart()
  }, [options])
  useEffect(() => {
    return () => {
      chartInstance && chartInstance.dispose()
    }
  }, [])

  return
}

const App: React.FC = () => {
  const chartRef = useRef<HTMLElement>(null)
  const [vizData, setVizData] = useState(null)
  const [settings, setSettings] = useState(null)
  const [renderData, setRenderData] = useState<RenderData[]>()

  useEffect(() => {
    window.onmessage = (
      e: MessageEvent<{
        type: string
        data: {
          vizData: any;
          language: 'zh_CN' | 'en_US';
        }
      }>
    ) => {
      const { type, data } = e.data
      if (type === 'propertiesChange') {
        console.log(111, data.vizData)
        console.log(222, data.settings)
        setVizData(data.vizData)
        setSettings(data.settings)
      }
    }
  }, [])

  useEffect(() => {
    if (vizData) {
      const data = transformData(vizData)
      setRenderData(data)
    }
  }, [vizData])

  // 将vizData转换为echarts数据结构
  const transformData = (vizData) => {
    const { locationMap, datasets } = vizData
    const nameField = locationMap[FieldMap.Dimension]?.[0]
    const valueField = locationMap[FieldMap.Measure]?.[0]

    const data = datasets.map((item) => ({
      name: item[nameField],
      value: parseFloat(item[valueField]),
    }))
    return data
  }

  const color = settings?.theme?.color ?? [
    '#c23531',
    '#2f4554',
    '#61a0a8',
    '#d48265',
    '#91c7ae',
    '#749f83',
    '#ca8622',
    '#bda29a',
    '#6e7074',
    '#546570',
    '#c4ccd3'
  ]

  const options = {
    color,
    title: {
      text: 'react echarts demo',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      left: "center",
      top: "bottom",
      orient: "horizontal",
      // orient: 'vertical',
    },
    series: [
      {
        name: 'Access From',
        type: 'pie',
        radius: '50%',
        data: renderData,
      }
    ]
  }
  useChart(chartRef, options)

  return (
    <>
      <div
        style={{ width: "100%", height: "100%" }}
        ref={chartRef}
      />
    </>
  )
}

export default App
