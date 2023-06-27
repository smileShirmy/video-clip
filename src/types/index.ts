export enum ResourceComponentName {
  VIDEO_RESOURCE = 'videoResource',
  TEXT_RESOURCE = 'textResource',
  AUDIO_RESOURCE = 'audioResource',
  STICKER_RESOURCE = 'stickerResource'
}

export interface MenuItem {
  componentName: ResourceComponentName
  name: string
}

export interface VideoResourceResponse {
  name: string
  format: string
  source: string
  width: number
  height: number
  fps: number
  frameCount: number
}

export enum ResourceType {
  VIDEO = 'video'
}

export interface VideoResource extends VideoResourceResponse {
  type: ResourceType.VIDEO
}

/**
 * 轨道类型
 */
export enum TrackLineType {
  MAIN = 'main',
  VIDEO = 'video'
}

/**
 * 轨道资源组件
 */
export enum TrackComponentName {
  TRACK_VIDEO = 'trackVideo'
}

/**
 * 轨道资源
 */
export interface TrackItem {
  id: string
  resourceType: ResourceType
  component: TrackComponentName
  frameCount: number
  startFrame: number
  endFrame: number
}

/**
 * 轨道
 */
export interface TrackLine {
  type: TrackLineType
  id: string
  trackList: TrackItem[]
}
