import type { Plugin } from 'vite'
import url from 'url'
import { videos } from './mock/videos'

const dataMap = new Map()
dataMap.set('videos', videos)

export function mockServer(): Plugin {
  return {
    name: 'vite:mock-server',
    configureServer(server) {
      server.middlewares.use('/mock/resource', (req, res) => {
        const {
          query: { type }
        } = url.parse(req.url || '', true)
        const list = dataMap.get(type) ?? []

        res.setHeader('Content-type', 'application/json')
        res.statusCode = 200
        res.end(JSON.stringify(list))
      })
    }
  }
}
