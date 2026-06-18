import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import {
  createDocument, updateDocumentReady, updateDocumentError,
  insertChunks, listDocuments, getDocument, deleteDocument,
  fullTextSearch, getChunksByQdrantIds, getStats
} from './brain-db.js';
import { parseFile, splitIntoChunks } from './brain-parser.js';
import { embedTexts, embedQuery, isEmbeddingsEnabled } from './brain-embeddings.js';
import {
  ensureCollection, upsertVectors, searchVectors,
  deleteByDocumentId, isQdrantEnabled
} from './brain-qdrant.js';
import { logBrainSearch } from './analytics-service.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

function getOrgId(req) {
  return req.auth?.orgId || req.headers['x-org-id'] || 'default';
}

async function processDocument(docId, text, docType, orgId) {
  try {
    const chunks = splitIntoChunks(text);
    if (!chunks.length) throw new Error('No text content extracted from document.');

    let enrichedChunks = chunks.map(c => ({ ...c, qdrantId: null }));

    if (isEmbeddingsEnabled() && isQdrantEnabled()) {
      await ensureCollection();
      const texts = chunks.map(c => c.content);
      const embeddings = await embedTexts(texts);
      if (embeddings) {
        const points = embeddings.map((vec, i) => ({
          id: uuidv4().replace(/-/g, '').slice(0, 16),
          vector: vec,
          payload: { document_id: docId, chunk_index: i, content: chunks[i].content, type: docType, org_id: orgId }
        }));
        await upsertVectors(points);
        enrichedChunks = chunks.map((c, i) => ({ ...c, qdrantId: points[i].id }));
      }
    }

    await insertChunks(docId, enrichedChunks, orgId);
    await updateDocumentReady(docId, enrichedChunks.length);
  } catch (e) {
    console.error('processDocument error:', e.message);
    await updateDocumentError(docId, e.message);
  }
}

router.get('/status', async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const stats = await getStats(orgId);
    res.json({
      db: true,
      embeddings: isEmbeddingsEnabled(),
      qdrant: isQdrantEnabled(),
      stats
    });
  } catch (e) {
    res.json({ db: false, embeddings: isEmbeddingsEnabled(), qdrant: isQdrantEnabled(), stats: null, error: e.message });
  }
});

router.get('/documents', async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const docs = await listDocuments(orgId);
    res.json({ documents: docs });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  const { title, type } = req.body;
  if (!file) return res.status(400).json({ error: 'No file provided.' });
  if (!title) return res.status(400).json({ error: 'Document title required.' });

  const orgId = getOrgId(req);
  try {
    const doc = await createDocument({
      title, type: type || 'other',
      filename: file.originalname, sizeBytes: file.size, orgId
    });
    res.json({ document: doc, message: 'Upload received, processing in background…' });
    parseFile(file.buffer, file.mimetype, file.originalname)
      .then(text => processDocument(doc.id, text, type || 'other', orgId))
      .catch(() => {});
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/add', express.json(), async (req, res) => {
  const { title, type, content } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'title and content required.' });

  const orgId = getOrgId(req);
  try {
    const doc = await createDocument({
      title, type: type || 'other', filename: null,
      sizeBytes: Buffer.byteLength(content, 'utf-8'), orgId
    });
    res.json({ document: doc, message: 'Content received, processing in background…' });
    processDocument(doc.id, content, type || 'other', orgId).catch(() => {});
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/documents/:id', async (req, res) => {
  const { id } = req.params;
  const orgId = getOrgId(req);
  try {
    const doc = await getDocument(id);
    if (!doc) return res.status(404).json({ error: 'Document not found.' });
    if (doc.org_id !== orgId && orgId !== 'default') {
      return res.status(403).json({ error: 'Access denied.' });
    }
    if (isQdrantEnabled()) await deleteByDocumentId(id);
    await deleteDocument(id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/search', express.json(), async (req, res) => {
  const { query, limit = 8 } = req.body;
  if (!query) return res.status(400).json({ error: 'query required.' });
  const orgId = getOrgId(req);

  try {
    let results = [];

    if (isEmbeddingsEnabled() && isQdrantEnabled()) {
      const qVec = await embedQuery(query);
      if (qVec) {
        const hits = await searchVectors(qVec, limit);
        if (hits.length) {
          const qdrantIds = hits.map(h => String(h.id));
          const chunks = await getChunksByQdrantIds(qdrantIds, orgId);
          const chunkMap = Object.fromEntries(chunks.map(c => [c.qdrant_id, c]));
          results = hits
            .map(h => {
              const chunk = chunkMap[String(h.id)];
              if (!chunk) return null;
              return { content: chunk.content, score: h.score, doc_title: chunk.doc_title, doc_type: chunk.doc_type };
            })
            .filter(Boolean);
        }
      }
    }

    if (!results.length) {
      const rows = await fullTextSearch(query, orgId, limit);
      results = rows.map(r => ({ content: r.content, score: r.score, doc_title: r.doc_title, doc_type: r.doc_type }));
    }

    const mode = isEmbeddingsEnabled() && isQdrantEnabled() ? 'semantic' : 'fulltext';
    await logBrainSearch({ orgId, query, mode, resultCount: results.length }).catch(() => {});
    res.json({ results, mode });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/context', express.json(), async (req, res) => {
  const { query, limit = 5 } = req.body;
  if (!query) return res.status(400).json({ error: 'query required.' });
  const orgId = getOrgId(req);

  try {
    let results = [];

    if (isEmbeddingsEnabled() && isQdrantEnabled()) {
      const qVec = await embedQuery(query);
      if (qVec) {
        const hits = await searchVectors(qVec, limit, 0.25);
        if (hits.length) {
          const qdrantIds = hits.map(h => String(h.id));
          const chunks = await getChunksByQdrantIds(qdrantIds, orgId);
          const chunkMap = Object.fromEntries(chunks.map(c => [c.qdrant_id, c]));
          results = hits.map(h => chunkMap[String(h.id)]?.content).filter(Boolean);
        }
      }
    }

    if (!results.length) {
      const rows = await fullTextSearch(query, orgId, limit);
      results = rows.map(r => r.content);
    }

    const context = results.length
      ? `Relevant company knowledge:\n\n${results.map((r, i) => `[${i + 1}] ${r}`).join('\n\n')}`
      : '';

    await logBrainSearch({ orgId, query, mode: 'context', resultCount: results.length }).catch(() => {});
    res.json({ context, chunks: results.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
