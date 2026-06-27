# Vipin Neekamparambath - Interactive CV

An evidence-led portfolio for an Agentic AI Engineer working at the intersection of enterprise AI and engineering digitization.

## Experience

- 30-second overview and URL-persisted technical-depth mode
- Interactive career progression from CAE automation to agentic systems
- Nine searchable, shareable, confidentiality-safe case studies
- Capability-to-project evidence mapping
- Cited portfolio guide with five-question sessions and deterministic fallback
- Synchronized two-page ATS-friendly résumé
- Static case-study prerendering, sitemap, social preview, structured data, and Vercel Analytics

The canonical content source is [`src/data/portfolio.json`](src/data/portfolio.json). The home page, case studies, assistant grounding, evaluations, metadata generation, and résumé generator all consume it.

## Local development

```bash
npm install
npm run dev
```

The portfolio guide works without credentials using approved deterministic answers. To enable generated answers, add:

```bash
ANTHROPIC_API_KEY=...
ANTHROPIC_MODEL=claude-haiku-4-5-20251001
```

Generated answers remain bounded to selected source sections. The application does not persist prompts or transcripts.

## Validation and production

```bash
npm test
npm run lint
npm run build
```

`npm test` validates source references and 43 grounding, unsupported-question, and prompt-injection cases. `npm run build` prerenders every `/work/:slug` route and creates `dist/sitemap.xml`.

Set `SITE_URL` during production builds when the deployment domain differs from the documented `https://cv-vipin.vercel.app` fallback.

## Résumé and assets

```bash
npm run resume
```

The résumé generator reads the portfolio JSON, requires `reportlab` and `pypdf`, writes the reviewed artifact to `output/pdf/`, and synchronizes the public download in `site-public/`.

The deployable portrait, social card, résumé, favicon, and font assets live in `site-public/`. Legacy files and media from the original fork have been removed.
