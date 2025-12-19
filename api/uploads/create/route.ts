import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../utils/supabaseAdmin';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
]);

const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf']);

const MEDIA_BUCKET = process.env.SUPABASE_MEDIA_BUCKET || 'uploads';

function getExtensionFromFilename(filename: string): string {
  const last = filename.split('.').pop() || '';
  return last.toLowerCase().trim();
}

function bytesStartWith(bytes: Uint8Array, signature: number[]): boolean {
  if (bytes.length < signature.length) return false;
  for (let i = 0; i < signature.length; i += 1) {
    if (bytes[i] !== signature[i]) return false;
  }
  return true;
}

function isValidMagicBytes(mime: string, bytes: Uint8Array): boolean {
  switch (mime) {
    case 'image/jpeg':
      return bytesStartWith(bytes, [0xff, 0xd8, 0xff]);
    case 'image/png':
      return bytesStartWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case 'image/gif':
      return bytesStartWith(bytes, [0x47, 0x49, 0x46, 0x38]);
    case 'image/webp': {
      // RIFF....WEBP
      if (!bytesStartWith(bytes, [0x52, 0x49, 0x46, 0x46])) return false;
      if (bytes.length < 12) return false;
      return bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
    }
    case 'application/pdf':
      return bytesStartWith(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d]); // %PDF-
    default:
      return false;
  }
}

export async function POST(request: Request) {
  const baseHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
    'Surrogate-Control': 'no-store',
    Vary: '*',
  };

  if (!supabaseAdmin) {
    return NextResponse.json(
      { ok: false, error: 'Supabase Admin not initialized' },
      { status: 500, headers: baseHeaders }
    );
  }

  try {
    const form = await request.formData();
    const file = form.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: 'Missing file' },
        { status: 400, headers: baseHeaders }
      );
    }

    if (file.size <= 0 || file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { ok: false, error: 'File size not allowed' },
        { status: 400, headers: baseHeaders }
      );
    }

    const mime = (file.type || '').toLowerCase();
    const ext = getExtensionFromFilename(file.name || '');

    if (!ALLOWED_MIME_TYPES.has(mime) || !ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { ok: false, error: 'File type not allowed' },
        { status: 400, headers: baseHeaders }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer.slice(0, 32));

    if (!isValidMagicBytes(mime, bytes)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid file signature' },
        { status: 400, headers: baseHeaders }
      );
    }

    const safeId = globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    const objectPath = `${new Date().toISOString().slice(0, 10)}/${safeId}.${ext}`;

    const uploadRes = await supabaseAdmin.storage
      .from(MEDIA_BUCKET)
      .upload(objectPath, file, {
        contentType: mime,
        upsert: false,
        cacheControl: '3600',
      });

    if (uploadRes.error) {
      return NextResponse.json(
        { ok: false, error: uploadRes.error.message },
        { status: 500, headers: baseHeaders }
      );
    }

    const { data: publicData } = supabaseAdmin.storage.from(MEDIA_BUCKET).getPublicUrl(objectPath);

    return NextResponse.json(
      {
        ok: true,
        data: {
          url: publicData.publicUrl,
          path: objectPath,
          mime,
          size: file.size,
          filename: file.name,
        },
      },
      { status: 200, headers: baseHeaders }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: 'Internal Server Error', message: err?.message || 'Unknown error' },
      { status: 500, headers: baseHeaders }
    );
  }
}
