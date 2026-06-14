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

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

async function processDocument(docId, text, docType) {
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
          payload: { document_id: docId, chunk_index: i, content: chunks[i].content, type: docType }
        }));
        await upsertVectors(points);
        enrichedChunks = chunks.map((c, i) => ({ ...c, qdrantId: points[i].id }));
      }
    }

    await insertChunks(docId, enrichedChunks);
    await updateDocumentReady(docId, enrichedChunks.length);
  } catch (e) {
    console.error('processDocument error:', e.message);
    await updateDocumentError(docId, e.message);
  }
}

router.get('/status', async (req, res) => {
  try {
    const stats = await getStats();
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
    const docs = await listDocuments();
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

  try {
    const doc = await createDocument({
      title,
      type: type || 'other',
      filename: file.originalname,
      sizeBytes: file.size
    });
    res.json({ document: doc, message: 'Upload received, processing in background…' });
    processDocument(doc.id, await parseFile(file.buffer, file.mimetype, file.originalname), type || 'other').catch(() => {});
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/add', express.json(), async (req, res) => {
  const { title, type, content } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'title and content required.' });

  try {
    const doc = await createDocument({
      title,
      type: type || 'other',
      filename: null,
      sizeBytes: Buffer.byteLength(content, 'utf-8')
    });
    res.json({ document: doc, message: 'Content received, processing in background…' });
    processDocument(doc.id, content, type || 'other').catch(() => {});
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/documents/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await getDocument(id);
    if (!doc) return res.status(404).json({ error: 'Document not found.' });
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

  try {
    let results = [];

    if (isEmbeddingsEnabled() && isQdrantEnabled()) {
      const qVec = await embedQuery(query);
      if (qVec) {
        const hits = await searchVectors(qVec, limit);
        if (hits.length) {
          const qdrantIds = hits.map(h => String(h.id));
          const chunks = await getChunksByQdrantIds(qdrantIds);
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
      const rows = await fullTextSearch(query, limit);
      results = rows.map(r => ({ content: r.content, score: r.score, doc_title: r.doc_title, doc_type: r.doc_type }));
    }

    res.json({ results, mode: isEmbeddingsEnabled() && isQdrantEnabled() ? 'semantic' : 'fulltext' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/context', express.json(), async (req, res) => {
  const { query, limit = 5 } = req.body;
  if (!query) return res.status(400).json({ error: 'query required.' });

  try {
    let results = [];

    if (isEmbeddingsEnabled() && isQdrantEnabled()) {
      const qVec = await embedQuery(query);
      if (qVec) {
        const hits = await searchVectors(qVec, limit, 0.25);
        if (hits.length) {
          const qdrantIds = hits.map(h => String(h.id));
          const chunks = await getChunksByQdrantIds(qdrantIds);
          const chunkMap = Object.fromEntries(chunks.map(c => [c.qdrant_id, c]));
          results = hits.map(h => chunkMap[String(h.id)]?.content).filter(Boolean);
        }
      }
    }

    if (!results.length) {
      const rows = await fullTextSearch(query, limit);
      results = rows.map(r => r.content);
    }

    const context = results.length
      ? `Relevant company knowledge:\n\n${results.map((r, i) => `[${i + 1}] ${r}`).join('\n\n')}`
      : '';

    res.json({ context, chunks: results.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
