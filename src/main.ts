
import { FieldMap } from './types'

export const activate = (context) => {
  context.vizQueryChartRenderer.register({
    id: "<%= chartId %>",
    fields: [
      {
        label: '维度',
        location: FieldMap.Dimension,
        fieldType: 0,
      },
      {
        label: '指标',
        location: FieldMap.Measure,
        fieldType: 1,
      }
    ],
    constraints: [
      {
        [FieldMap.Dimension]: [1, 1],
        [FieldMap.Measure]: [1, 1],
      }
    ],
    settings: [
      {
        key: 'theme',
        label: '主题',
        switch: false,
        items: [{
          key: 'color',
          label: '颜色',
          component: {
            type: 'ColorPicker',
            props: {
              type: 'theme',
            },
          }
        }]
      },
    ],
  })
}

export const deactivate = () => { }

