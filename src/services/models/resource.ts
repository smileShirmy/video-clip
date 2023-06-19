import { get } from './axios'

export async function getVideos() {
  return get('/mock/resource?type=videos')
}
