import {
  ResourceType,
  type AudioResource,
  type VideoResource,
  type VideoResourceResponse,
  type AudioResourceResponse
} from '@/types'
import { get } from './axios'
import { durationToFrameCount } from '../helpers/time'

export async function getVideos(): Promise<VideoResource[]> {
  const list = await get<VideoResourceResponse[]>('/mock/resource?type=videos')
  return list.map((v) => ({ type: ResourceType.VIDEO, ...v }))
}

export async function getAudios(): Promise<AudioResource[]> {
  const list = await get<AudioResourceResponse[]>('/mock/resource?type=audios')
  return list.map((v) => ({
    type: ResourceType.AUDIO,
    ...v,
    frameCount: durationToFrameCount(v.duration)
  }))
}
