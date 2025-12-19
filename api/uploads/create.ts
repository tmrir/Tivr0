import type { VercelRequest, VercelResponse } from '@vercel/node';
import Busboy from 'busboy';
import { createClient } from '@supabase/supabase-js';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
]);

const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf']);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const MEDIA_BUCKET = process.env.SUPABASE_MEDIA_BUCKET || 'uploads';

function getExtensionFromFilename(filename: string): string {
  const last = filename.split('.').pop() || '';
  return last.toLowerCase().trim();
}

function bytesStartWith(bytes: Buffer, signature: number[]): boolean {
  if (bytes.length < signature.length) return false;
  for (let i = 0; i < signature.length; i += 1) {
    if (bytes[i] !== signature[i]) return false;
  }
  return true;
}

function isValidMagicBytes(mime: string, head: Buffer): boolean {
  switch (mime) {
    case 'image/jpeg':
      return bytesStartWith(head, [0xff, 0xd8, 0xff]);
    case 'image/png':
      return bytesStartWith(head, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case 'image/gif':
      return bytesStartWith(head, [0x47, 0x49, 0x46, 0x38]);
    case 'image/webp': {
      if (!bytesStartWith(head, [0x52, 0x49, 0x46, 0x46])) return false; // RIFF
      if (head.length < 12) return false;
      return head[8] === 0x57 && head[9] === 0x45 && head[10] === 0x42 && head[11] === 0x50; // WEBP
    }
    case 'application/pdf':
      return bytesStartWith(head, [0x25, 0x50, 0x44, 0x46, 0x2d]); // %PDF-
    default:
      return false;
  }
}

function json(res: VercelResponse, status: number, body: any) {
  res.status(status);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.end(JSON.stringify(body));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { ok: false, error: 'Method Not Allowed' });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return json(res, 500, { ok: false, error: 'Missing Supabase env vars' });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const contentType = String(req.headers['content-type'] || '');
    if (!contentType.toLowerCase().includes('multipart/form-data')) {
      return json(res, 400, { ok: false, error: 'Expected multipart/form-data' });
    }

    const busboy = Busboy({
      headers: req.headers,
      limits: {
        files: 1,
        fileSize: MAX_FILE_SIZE_BYTES,
      },
    });

    let fileBuffer: Buffer | null = null;
    let fileSize = 0;
    let filename = '';
    let mime = '';
    let ext = '';
    let rejected: { status: number; error: string } | null = null;

    const done = new Promise<void>((resolve, reject) => {
      busboy.on('file', (_name, file, info) => {
        filename = info.filename || '';
        mime = (info.mimeType || '').toLowerCase();
        ext = getExtensionFromFilename(filename);

        if (!ALLOWED_MIME_TYPES.has(mime) || !ALLOWED_EXTENSIONS.has(ext)) {
          rejected = { status: 400, error: 'File type not allowed' };
          file.resume();
          return;
        }

        const chunks: Buffer[] = [];

        file.on('data', (data: Buffer) => {
          if (rejected) return;
          fileSize += data.length;
          chunks.push(data);
        });

        file.on('limit', () => {
          rejected = { status: 400, error: 'File size not allowed' };
          file.resume();
        });

        file.on('end', () => {
          if (rejected) return;
          fileBuffer = Buffer.concat(chunks);
        });
      });

      busboy.on('finish', () => resolve());
      busboy.on('error', (e) => reject(e));
    });

    req.pipe(busboy);
    await done;

    if (rejected) {
      return json(res, rejected.status, { ok: false, error: rejected.error });
    }

    if (!fileBuffer || fileBuffer.length <= 0) {
      return json(res, 400, { ok: false, error: 'Missing file' });
    }

    const head = fileBuffer.subarray(0, 32);
    if (!isValidMagicBytes(mime, head)) {
      return json(res, 400, { ok: false, error: 'Invalid file signature' });
    }

    const safeId = (globalThis.crypto as any)?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
    const objectPath = `${new Date().toISOString().slice(0, 10)}/${safeId}.${ext}`;

    const uploadRes = await supabaseAdmin.storage.from(MEDIA_BUCKET).upload(objectPath, fileBuffer, {
      contentType: mime,
      upsert: false,
      cacheControl: '3600',
    });

    if (uploadRes.error) {
      return json(res, 500, { ok: false, error: uploadRes.error.message });
    }

    const { data: publicData } = supabaseAdmin.storage.from(MEDIA_BUCKET).getPublicUrl(objectPath);

    return json(res, 200, {
      ok: true,
      data: {
        url: publicData.publicUrl,
        path: objectPath,
        mime,
        size: fileBuffer.length,
        filename,
      },
    });
  } catch (e: any) {
    return json(res, 500, { ok: false, error: 'Internal Server Error', message: e?.message || 'Unknown error' });
  }
}
