interface AudioResource {
  name: string
  format: string
  source: string
  duration: number
}

export const audios: AudioResource[] = [
  {
    name: 'audio-1',
    format: 'mp3',
    source: '/audios/audio-1.mp3',
    duration: 63980
  }
]
