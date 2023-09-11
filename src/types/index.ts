import type { TrackType } from '@/services/track/base-track'

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
  cover: string
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
  format: string
  source: string
  width: number
  height: number
  frameCount: number
}

export interface AudioResourceResponse {
  name: string
  format: string
  source: string
  duration: number
}

export enum ResourceType {
  VIDEO = 'video',
  TEXT = 'text',
  STICKER = 'sticker',
  AUDIO = 'audio'
}

export interface VideoResource extends VideoResourceResponse {
  type: ResourceType.VIDEO
}

export interface TextResource extends TextResourceResponse {
  type: ResourceType.TEXT
  name: string
  frameCount: number
}

export interface StickerResource extends StickerResourceResponse {
  type: ResourceType.STICKER
}

export interface AudioResource extends AudioResourceResponse {
  type: ResourceType.AUDIO
  frameCount: number
}

/**
 * 轨道资源组件
 */
export enum TrackItemName {
  TRACK_ITEM_VIDEO = 'TrackItemVideo',
  TRACK_ITEM_TEXT = 'TrackItemText',
  TRACK_ITEM_STICKER = 'TrackItemSticker',
  TRACK_ITEM_AUDIO = 'TrackItemAudio'
}

/**
 * 画面资源属性
 */
export interface PlayerAttribute {
  topRatio: number
  leftRatio: number
  widthRatio: number
  heightRatio: number
  rotate: number
  scale: number
  opacity: number
}

export interface AttributeOptions extends Partial<PlayerAttribute> {
  topRatio: number
  leftRatio: number
  widthRatio: number
  heightRatio: number
}

/**
 * 文本属性
 */
export interface TextAttribute {
  letterSpacingRatio: number
  lineSpacingRatio: number
}

export interface BaseTrackItemData {
  id: string
  minFrame: number
  startFrame: number
  endFrame: number
  parentTrackId?: string
}

export interface TextTrackItemData {
  type: TrackItemName.TRACK_ITEM_TEXT
  base: BaseTrackItemData
  resource: TextResource
  attribute: PlayerAttribute
  textAttribute: TextAttribute
  text: string
}

export interface VideoTrackItemData {
  type: TrackItemName.TRACK_ITEM_VIDEO
  base: BaseTrackItemData
  resource: VideoResource
  attribute: PlayerAttribute
}

export interface StickerTrackItemData {
  type: TrackItemName.TRACK_ITEM_STICKER
  base: BaseTrackItemData
  resource: StickerResource
  attribute: PlayerAttribute
}

export interface AudioTrackItemData {
  type: TrackItemName.TRACK_ITEM_AUDIO
  base: BaseTrackItemData
  resource: AudioResource
}

export type TrackItemData =
  | TextTrackItemData
  | VideoTrackItemData
  | StickerTrackItemData
  | AudioTrackItemData

export interface BaseTrackData {
  id: string
}

export interface VideoTrackData {
  base: BaseTrackData
  type: TrackType.VIDEO
  height: number
}

export interface AudioTrackData {
  base: BaseTrackData
  type: TrackType.AUDIO
}

export interface MainTrackData {
  base: BaseTrackData
  type: TrackType.MAIN
}

export interface AudioInfo {
  filename: string
  delayMilliseconds: number
  trim?: {
    startSeconds: number
    endSeconds: number
  }
}

export type TrackData = VideoTrackData | AudioTrackData | MainTrackData
