import type { Plugin } from 'vite'

export function mockServer(): Plugin {
  return {
    name: 'vite:mock-server',
    configureServer(server) {
      server.middlewares.use('/mock/resource', (req, res, next) => {
       res.setHeader('Content-type', 'application/json')
       res.statusCode = 200
       res.end('success')

       next();
      })
    }
  }
}
