# Vipin Neekamparambath - Interactive CV

A focused, responsive portfolio for Vipin Neekamparambath: Agentic AI, GenAI, and engineering digitization.

## What is included

- Interactive single-page portfolio
- Career timeline and selected enterprise AI projects
- Skills, education, languages, and contact details
- Dark/light theme switcher
- Downloadable PDF resume
- SEO metadata and Person structured data
- Vercel Analytics

The original repository's AI chatbot, voice mode, case studies, and operations dashboard are intentionally not mounted in this first personalized version. Their source files remain in the fork for future reuse.

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

The production build no longer needs the original portfolio's LLM, RAG, Langfuse, or Supabase credentials.

## Personal assets

- Replace the `VN` initials card in `src/App.tsx` with a portrait when one is available.
- Add a canonical URL and social sharing image in `index.html` after choosing a deployment domain.
- The public site uses email and LinkedIn; the phone number from the resume is intentionally omitted.
- Deployable static assets live in `site-public/`; the fork's original `public/` directory is retained only as dormant reference material and excluded from Vercel.
