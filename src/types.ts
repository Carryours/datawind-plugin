export enum FieldMap {
  Dimension = 'dimensions',
  Measure = 'measures',
}

export interface Settings {
  layout?: {
    columns?: number
    gap?: number
  }
}

export interface FieldInfo {
  key: string
  name: string
  value: string
  isImage: boolean
  isUrl: boolean
}

export interface ImageCard {
  imageUrl: string
  fields: FieldInfo[]
  lrZs?: string
  materialId?: string
}
