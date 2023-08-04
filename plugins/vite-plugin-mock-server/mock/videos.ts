interface VideoResource {
  name: string
  format: string
  source: string
  cover: string
  width: number
  height: number
  fps: number
  frameCount: number
}

export const videos: VideoResource[] = [
  {
    name: 'video-1',
    format: 'mp4',
    source: '/videos/video-1.mp4',
    cover: '/images/cover/video-1.png',
    width: 1280,
    height: 720,
    fps: 30,
    frameCount: 115
  }
]
