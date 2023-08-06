import type { AudioTrackItem } from './audio-track-item'
import type { StickerTrackItem } from './sticker-track-item'
import type { TextTrackItem } from './text-track-item'
import type { VideoTrackItem } from './video-track-item'

export type TrackItem = VideoTrackItem | TextTrackItem | StickerTrackItem | AudioTrackItem

export type PlayerTrackItem = VideoTrackItem | TextTrackItem | StickerTrackItem
