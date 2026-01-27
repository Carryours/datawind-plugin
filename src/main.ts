
import { FieldMap } from './types'

export const activate = (context: any) => {
  context.vizQueryChartRenderer.register({
    id: "<%= chartId %>",
    fields: [
      {
        label: '维度',
        location: FieldMap.Dimension,
        fieldType: 0,
      },
    ],
    constraints: [
      {
        [FieldMap.Dimension]: [1, 10],
      }
    ],
    settings: [
      {
        key: 'layout',
        label: '布局设置',
        switch: false,
        items: [
          {
            key: 'columns',
            label: '列数',
            component: {
              type: 'InputNumber',
              props: {
                min: 1,
                max: 6,
                defaultValue: 5,
              },
            }
          },
          {
            key: 'gap',
            label: '间距',
            component: {
              type: 'InputNumber',
              props: {
                min: 8,
                max: 32,
                defaultValue: 8,
              },
            }
          }
        ]
      },
    ],
  })
}

export const deactivate = () => { }

