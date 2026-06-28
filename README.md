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

The portfolio guide uses keyless local hybrid retrieval: BM25-style ranking, concept expansion, and character-ngram similarity over the canonical CV data. To enable generated answers, add:

```bash
GROQ_API_KEY=...
GROQ_MODEL=qwen/qwen3.6-27b
```

No embedding API or external vector database is required for this CV-sized corpus. Generated answers remain bounded to selected, citation-backed source sections. The application does not persist prompts or transcripts.

## Agent-readable portfolio

The development server and production build expose two generated Markdown resources:

- `/llms.txt` — concise portfolio index for AI agents
- `/llms-full.txt` — complete approved public portfolio

Both files are generated from `src/data/portfolio.json`; they should not be edited separately.

## Validation and production

```bash
npm test
npm run lint
npm run build
```

`npm test` validates source references, agent-readable documents, strict source recall across 68 grounding, paraphrase, unsupported-question, and prompt-injection cases, plus multi-turn retrieval. `npm run build` prerenders every `/work/:slug` route and creates the sitemap and Markdown agent resources.

Set `SITE_URL` during production builds when the deployment domain differs from the documented `https://cv-vipin.vercel.app` fallback.

## Résumé and assets

```bash
npm run resume
```

The résumé generator reads the portfolio JSON, requires `reportlab` and `pypdf`, writes the reviewed artifact to `output/pdf/`, and synchronizes the public download in `site-public/`.

The deployable portrait, social card, résumé, favicon, and font assets live in `site-public/`. Legacy files and media from the original fork have been removed.
