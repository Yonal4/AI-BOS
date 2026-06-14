import pg from 'pg';

const { Pool } = pg;

let pool = null;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
    });
  }
  return pool;
}

export async function createDocument({ title, type, filename, sizeBytes }) {
  const { rows } = await getPool().query(
    `INSERT INTO brain_documents (title, type, filename, size_bytes, status)
     VALUES ($1, $2, $3, $4, 'processing')
     RETURNING *`,
    [title, type, filename || null, sizeBytes || 0]
  );
  return rows[0];
}

export async function updateDocumentReady(id, chunkCount) {
  const { rows } = await getPool().query(
    `UPDATE brain_documents
     SET status='ready', chunk_count=$2, updated_at=NOW()
     WHERE id=$1 RETURNING *`,
    [id, chunkCount]
  );
  return rows[0];
}

export async function updateDocumentError(id, errorMsg) {
  await getPool().query(
    `UPDATE brain_documents SET status='error', error_msg=$2, updated_at=NOW() WHERE id=$1`,
    [id, errorMsg]
  );
}

export async function insertChunks(documentId, chunks) {
  if (!chunks.length) return;
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    for (let i = 0; i < chunks.length; i++) {
      await client.query(
        `INSERT INTO brain_chunks (document_id, content, chunk_index, qdrant_id)
         VALUES ($1, $2, $3, $4)`,
        [documentId, chunks[i].content, i, chunks[i].qdrantId || null]
      );
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function listDocuments() {
  const { rows } = await getPool().query(
    `SELECT * FROM brain_documents ORDER BY created_at DESC`
  );
  return rows;
}

export async function getDocument(id) {
  const { rows } = await getPool().query(
    `SELECT * FROM brain_documents WHERE id=$1`, [id]
  );
  return rows[0] || null;
}

export async function deleteDocument(id) {
  await getPool().query(`DELETE FROM brain_documents WHERE id=$1`, [id]);
}

export async function getChunksByDocument(documentId) {
  const { rows } = await getPool().query(
    `SELECT * FROM brain_chunks WHERE document_id=$1 ORDER BY chunk_index`, [documentId]
  );
  return rows;
}

export async function fullTextSearch(query, limit = 8) {
  const { rows } = await getPool().query(
    `SELECT
       bc.id,
       bc.content,
       bc.chunk_index,
       bd.title AS doc_title,
       bd.type  AS doc_type,
       ts_rank(bc.tsv, plainto_tsquery('english', $1)) AS score
     FROM brain_chunks bc
     JOIN brain_documents bd ON bd.id = bc.document_id
     WHERE bc.tsv @@ plainto_tsquery('english', $1)
       AND bd.status = 'ready'
     ORDER BY score DESC
     LIMIT $2`,
    [query, limit]
  );
  return rows;
}

export async function getChunksByQdrantIds(qdrantIds) {
  if (!qdrantIds.length) return [];
  const { rows } = await getPool().query(
    `SELECT bc.id, bc.content, bc.chunk_index, bc.qdrant_id,
            bd.title AS doc_title, bd.type AS doc_type
     FROM brain_chunks bc
     JOIN brain_documents bd ON bd.id = bc.document_id
     WHERE bc.qdrant_id = ANY($1::text[])`,
    [qdrantIds]
  );
  return rows;
}

export async function getStats() {
  const { rows } = await getPool().query(
    `SELECT
       (SELECT COUNT(*) FROM brain_documents WHERE status='ready')::int AS doc_count,
       (SELECT COALESCE(SUM(chunk_count),0) FROM brain_documents WHERE status='ready')::int AS chunk_count,
       (SELECT COUNT(*) FROM brain_documents WHERE status='processing')::int AS processing_count`
  );
  return rows[0];
}
