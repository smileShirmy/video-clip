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
interface BaseTrackItem {
  id: string
  startFrame: number
  endFrame: number
}

export interface VideoTrackItem extends BaseTrackItem {
  component: TrackComponentName.TRACK_VIDEO
  resource: VideoResource
}

export type TrackItem = VideoTrackItem

/**
 * 轨道
 */
interface BaseTrackLine {
  id: string
  height: number
}

export interface MainTrackLine extends BaseTrackLine {
  type: TrackLineType.MAIN
  trackList: VideoTrackItem[]
}

export interface VideoTrackLine extends BaseTrackLine {
  type: TrackLineType.VIDEO
  trackList: VideoTrackItem[]
}

export type TrackLine = MainTrackLine | VideoTrackLine
