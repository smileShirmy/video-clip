export enum ResourceComponentName {
  VIDEO_RESOURCE = 'videoResource',
  TEXT_RESOURCE = 'textResource',
  AUDIO_RESOURCE = 'audioResource',
  STICKER_RESOURCE = 'stickerResource'
}

export enum TrackItemName {
  TRACK_VIDEO = 'trackVideo'
}

export interface MenuItem {
  componentName: ResourceComponentName
  name: string
}
