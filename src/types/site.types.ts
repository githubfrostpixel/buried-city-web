export interface SiteCoordinate {
  x: number
  y: number
}

export interface SiteProduceItem {
  itemId: string
  weight: number
}

export interface SiteFixedProduceItem {
  itemId: string
  num: number
}

export interface SiteConfig {
  id: number
  coordinate: SiteCoordinate
  battleRoom?: number
  difficulty?: number[]
  workRoom?: number
  produceValue?: number
  produceList?: SiteProduceItem[]
  fixedProduceList?: SiteFixedProduceItem[]
  [key: string]: any
}

export type SiteConfigMap = Record<string, SiteConfig>

export interface Site {
  id: number
  explored: boolean
  cleared: boolean
  storage?: any
}


