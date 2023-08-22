import { TrackItemName, type TrackData, type TrackItemData } from '@/types'
import { AudioTrackItem } from '../track-item/audio-track-item'
import { StickerTrackItem } from '../track-item/sticker-track-item'
import { TextTrackItem } from '../track-item/text-track-item'
import { VideoTrackItem } from '../track-item/video-track-item'
import { TrackType } from '../track/base-track'
import { AudioTrack } from '../track/audio-track'
import { VideoTrack } from '../track/video-track'
import { MainTrack } from '../track/main-track'

export function toTrackItem(trackItemData: TrackItemData) {
  if (trackItemData.type === TrackItemName.TRACK_ITEM_AUDIO) {
    return AudioTrackItem.toTrackItem(trackItemData)
  } else if (trackItemData.type === TrackItemName.TRACK_ITEM_STICKER) {
    return StickerTrackItem.toTrackItem(trackItemData)
  } else if (trackItemData.type === TrackItemName.TRACK_ITEM_TEXT) {
    return TextTrackItem.toTrackItem(trackItemData)
  } else {
    return VideoTrackItem.toTrackItem(trackItemData)
  }
}

export function toTrack(trackData: TrackData) {
  if (trackData.type === TrackType.AUDIO) {
    return AudioTrack.toTrack(trackData)
  } else if (trackData.type === TrackType.VIDEO) {
    return VideoTrack.toTrack(trackData)
  } else {
    // 不应该走到这一步，MainTrack 有且仅有一个且一开始就存在
    return MainTrack.toTrack(trackData)
  }
}
