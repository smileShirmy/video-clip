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

export interface TextResourceResponse {
  //
}

export interface StickerResourceResponse {
  name: string
}

export enum ResourceType {
  VIDEO = 'video',
  TEXT = 'text',
  STICKER = 'sticker'
}

export interface VideoResource extends VideoResourceResponse {
  type: ResourceType.VIDEO
}

export interface TextResource extends TextResourceResponse {
  type: ResourceType.TEXT
  frameCount: number
}

export interface StickerResource extends StickerResourceResponse {
  type: ResourceType.STICKER
  frameCount: number
}

/**
 * 轨道资源组件
 */
export enum TrackItemComponentName {
  TRACK_ITEM_VIDEO = 'TrackItemVideo',
  TRACK_ITEM_TEXT = 'TrackItemText',
  TRACK_ITEM_STICKER = 'TrackItemSticker'
}
