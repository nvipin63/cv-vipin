import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

function portfolioApi(): Plugin {
  const canonicalSiteUrl =
    process.env.SITE_URL?.replace(/\/+$/, '') || 'https://cv-vipin.vercel.app'

  return {
    name: 'portfolio-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const pathname = new URL(request.url || '/', 'http://localhost').pathname
        if (pathname !== '/llms.txt' && pathname !== '/llms-full.txt') {
          next()
          return
        }

        try {
          // @ts-expect-error The shared Markdown generator is intentionally authored as JavaScript.
          const { generateAgentDocuments } = await import('./server/portfolio-markdown.mjs')
          const documents = generateAgentDocuments(canonicalSiteUrl)
          const content = pathname === '/llms.txt' ? documents.index : documents.full

          response.statusCode = 200
          response.setHeader('Content-Type', 'text/markdown; charset=utf-8')
          response.setHeader('Cache-Control', 'no-store')
          response.end(request.method === 'HEAD' ? undefined : content)
        } catch (error) {
          next(error)
        }
      })

      server.middlewares.use('/api/portfolio-chat', async (request, response, next) => {
        try {
          const chunks: Buffer[] = []
          for await (const chunk of request) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
          }

          const body = Buffer.concat(chunks)
          const headers = new Headers()
          for (const [name, value] of Object.entries(request.headers)) {
            if (Array.isArray(value)) value.forEach((item) => headers.append(name, item))
            else if (value !== undefined) headers.set(name, value)
          }

          const localRequest = new Request('http://localhost/api/portfolio-chat', {
            method: request.method,
            headers,
            body: body.length > 0 ? body : undefined,
          })
          // @ts-expect-error The Vercel edge handler is intentionally authored as JavaScript.
          const { default: handler } = await import('./api/portfolio-chat.js')
          const apiResponse: Response = await handler(localRequest)

          response.statusCode = apiResponse.status
          apiResponse.headers.forEach((value, name) => response.setHeader(name, value))

          if (!apiResponse.body) {
            response.end()
            return
          }

          const reader = apiResponse.body.getReader()
          while (true) {
            const { value, done } = await reader.read()
            if (done) break
            response.write(Buffer.from(value))
          }
          response.end()
        } catch (error) {
          next(error)
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  if (env.GROQ_API_KEY) process.env.GROQ_API_KEY = env.GROQ_API_KEY
  if (env.GROQ_MODEL) process.env.GROQ_MODEL = env.GROQ_MODEL
  if (env.SITE_URL) process.env.SITE_URL = env.SITE_URL

  return {
    plugins: [react(), tailwindcss(), portfolioApi()],
    publicDir: 'site-public',
    build: {
      target: 'es2022',
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react-dom') || (id.includes('react') && !id.includes('react-markdown') && !id.includes('react-router'))) {
                return 'vendor-react'
              }
              if (id.includes('motion')) {
                return 'vendor-motion'
              }
            }
          }
        },
      },
    },
  }
})
