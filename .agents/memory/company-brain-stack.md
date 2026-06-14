---
name: Company Brain Stack
description: Real RAG implementation decisions — storage, embeddings, vector DB, fallback strategy, and agent context API.
---

## Storage
- PostgreSQL (Replit native): `brain_documents` + `brain_chunks` tables. Chunks have a generated `tsvector` column with GIN index for full-text search fallback.
- Qdrant Cloud: collection `brain_embeddings`, vector size 1024, Cosine distance.

## Embeddings
- Provider: Voyage AI (`voyage-3-lite` model, 1024 dims) — Anthropic's recommended embedding partner.
- Env var: `VOYAGE_API_KEY`
- Batch size: 128 texts per request.

## Graceful Fallback
If `VOYAGE_API_KEY` or `QDRANT_URL` are not set, the system falls back to PostgreSQL full-text search automatically. The `/api/brain/status` endpoint reports which services are active.

**Why:** Allows the app to work out-of-the-box with only PostgreSQL, and upgrades to full semantic search when the user adds secrets.

## Files
- `server/brain-db.js` — all DB queries
- `server/brain-parser.js` — PDF/DOCX/TXT parsing + 400-word overlapping chunks
- `server/brain-embeddings.js` — Voyage AI batch embedding
- `server/brain-qdrant.js` — Qdrant client + collection management
- `server/brain-routes.js` — Express routes mounted at `/api/brain`

## Agent Context API
`POST /api/brain/context` — call from any agent hub to inject relevant company knowledge into the AI system prompt. Returns a formatted string with top-N matching chunks.

## Required Secrets for Full Semantic Search
- `VOYAGE_API_KEY` — Voyage AI embeddings
- `QDRANT_URL` — Qdrant Cloud cluster URL (e.g. https://xxx.qdrant.io:6333)
- `QDRANT_API_KEY` — Qdrant Cloud API key
