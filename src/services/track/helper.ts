import type { MainTrack, MainTrackAllowItem } from './main-track'
import type { VideoTrack, VideoTrackAllowItem } from './video-track'
import type { AudioTrack } from './audio-track'
import type { TrackItem } from '../track-item'
import { TrackItemName } from '@/types'
import type { AudioTrackItem } from '../track-item/audio-track-item'
import { TrackType } from './base-track'
import type { Track } from '.'

export const isAudioTrackAllowItem = (trackItem: TrackItem): trackItem is AudioTrackItem => {
  return trackItem.component === TrackItemName.TRACK_ITEM_AUDIO
}

export const isAudioTrackAllowItems = (trackItems: TrackItem[]): trackItems is AudioTrackItem[] => {
  return trackItems.every((item) => isAudioTrackAllowItem(item))
}

export const isAudioTrack = (track: Track): track is AudioTrack => {
  return track.type === TrackType.AUDIO
}

export const isMainTrackAllowItem = (trackItem: TrackItem): trackItem is MainTrackAllowItem => {
  return [TrackItemName.TRACK_ITEM_VIDEO, TrackItemName.TRACK_ITEM_STICKER].includes(
    trackItem.component
  )
}

export const isMainTrackAllowItems = (
  trackItems: TrackItem[]
): trackItems is MainTrackAllowItem[] => {
  return trackItems.every((item) => isMainTrackAllowItem(item))
}

export const isMainTrack = (track: Track): track is MainTrack => {
  return track.type === TrackType.MAIN
}

export const isVideoTrackAllowItem = (trackItem: TrackItem): trackItem is VideoTrackAllowItem => {
  return [
    TrackItemName.TRACK_ITEM_VIDEO,
    TrackItemName.TRACK_ITEM_TEXT,
    TrackItemName.TRACK_ITEM_STICKER
  ].includes(trackItem.component)
}

export const isVideoTrackAllowItems = (
  trackItems: TrackItem[]
): trackItems is VideoTrackAllowItem[] => {
  return trackItems.every((item) => isMainTrackAllowItem(item))
}

export const isVideoTrack = (track: Track): track is VideoTrack => {
  return track.type === TrackType.VIDEO
}
