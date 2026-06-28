import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { generateAgentDocuments } from '../server/portfolio-markdown.mjs'

const require = createRequire(import.meta.url)
const portfolio = require('../src/data/portfolio.json')

const distDir = path.resolve('dist')
const baseUrl = (process.env.SITE_URL || 'https://cv-vipin.vercel.app').replace(/\/$/, '')
const template = await readFile(path.join(distDir, 'index.html'), 'utf8')

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function setCanonical(html, url) {
  return html
    .replace(/<link rel="canonical" href="[^"]+" \/>/, `<link rel="canonical" href="${url}" />`)
    .replace(/<meta property="og:url" content="[^"]+" \/>/, `<meta property="og:url" content="${url}" />`)
}

let home = template.replaceAll('https://cv-vipin.vercel.app', baseUrl)
await writeFile(path.join(distDir, 'index.html'), home)

const agentDocuments = generateAgentDocuments(baseUrl)
await writeFile(path.join(distDir, 'llms.txt'), agentDocuments.index)
await writeFile(path.join(distDir, 'llms-full.txt'), agentDocuments.full)

for (const project of portfolio.projects) {
  const url = `${baseUrl}/work/${project.slug}`
  let html = home
  html = html.replace(
    /<title>.*?<\/title>/,
    `<title>${escapeHtml(project.title)} | Vipin Neekamparambath</title>`,
  )
  html = html.replace(
    /<meta\s+name="description"[\s\S]*?content="[^"]*"\s*\/>/,
    `<meta name="description" content="${escapeHtml(project.oneLine)}" />`,
  )
  html = html.replace(
    /<meta property="og:title" content="[^"]+" \/>/,
    `<meta property="og:title" content="${escapeHtml(project.title)} | Vipin Neekamparambath" />`,
  )
  html = html.replace(
    /<meta\s+property="og:description"[\s\S]*?\/>/,
    `<meta property="og:description" content="${escapeHtml(project.oneLine)}" />`,
  )
  html = html.replace(
    /<meta property="og:type" content="[^"]+" \/>/,
    '<meta property="og:type" content="article" />',
  )
  html = html.replace(
    /<meta name="twitter:title" content="[^"]+" \/>/,
    `<meta name="twitter:title" content="${escapeHtml(project.title)} | Vipin Neekamparambath" />`,
  )
  html = html.replace(
    /<meta\s+name="twitter:description"[\s\S]*?\/>/,
    `<meta name="twitter:description" content="${escapeHtml(project.oneLine)}" />`,
  )
  html = setCanonical(html, url)

  const outputDir = path.join(distDir, 'work', project.slug)
  await mkdir(outputDir, { recursive: true })
  await writeFile(path.join(outputDir, 'index.html'), html)
}

const urls = [
  `<url><loc>${baseUrl}/</loc><changefreq>monthly</changefreq><priority>1.0</priority></url>`,
  `<url><loc>${baseUrl}/llms.txt</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`,
  `<url><loc>${baseUrl}/llms-full.txt</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`,
  ...portfolio.projects.map(
    (project) =>
      `<url><loc>${baseUrl}/work/${project.slug}</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>`,
  ),
]
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
await writeFile(path.join(distDir, 'sitemap.xml'), sitemap)
await writeFile(
  path.join(distDir, 'robots.txt'),
  `User-agent: *\nAllow: /\n\n# Agent-readable portfolio: ${baseUrl}/llms.txt\nSitemap: ${baseUrl}/sitemap.xml\n`,
)

console.log(`Prerendered ${portfolio.projects.length} case-study routes for ${baseUrl}`)
