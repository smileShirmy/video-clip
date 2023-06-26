import { ResourceType, type VideoResource, type VideoResourceResponse } from '@/types'
import { get } from './axios'

export async function getVideos(): Promise<VideoResource[]> {
  const list = await get<VideoResourceResponse[]>('/mock/resource?type=videos')
  return list.map((v) => ({ type: ResourceType.VIDEO, ...v }))
}
