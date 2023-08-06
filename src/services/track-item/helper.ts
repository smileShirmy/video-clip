import { TrackItemName } from '@/types'
import type { PlayerTrackItem, TrackItem } from '.'

export const isPlayerTrackItem = (trackItem: TrackItem): trackItem is PlayerTrackItem =>
  trackItem.component === TrackItemName.TRACK_ITEM_VIDEO ||
  trackItem.component === TrackItemName.TRACK_ITEM_STICKER ||
  trackItem.component === TrackItemName.TRACK_ITEM_TEXT
