'use client';

import { useEffect, useRef, useState } from 'react';
import { getImagekitAuthAction } from '@/app/actions/imagekit-upload';
import type { ImagekitOption } from '@/app/actions/imagekit-upload';

const ALLOWED_EXT = ['png', 'jpg', 'jpeg', 'webp', 'ico'] as const;
const ALLOWED_MIME = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/x-icon',
  'image/vnd.microsoft.icon',
  'image/ico',
]);
const MAX_SIZE_MB = 10;

type CoverUploadProps = {
  name?: string;
  defaultUrl?: string | null;
  imagekits: ImagekitOption[];
  onUploadingChange?: (uploading: boolean) => void;
};

type UploadState = 'idle' | 'uploading' | 'done' | 'error';

function getExtension(file: File): string {
  const fromName = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (ALLOWED_EXT.includes(fromName as (typeof ALLOWED_EXT)[number])) return fromName;
  if (file.type === 'image/png') return 'png';
  if (file.type === 'image/jpeg' || file.type === 'image/jpg') return 'jpg';
  if (file.type === 'image/webp') return 'webp';
  if (file.type.includes('icon')) return 'ico';
  return fromName;
}

function isAllowedFile(file: File): boolean {
  const ext = getExtension(file);
  const extOk = ALLOWED_EXT.includes(ext as (typeof ALLOWED_EXT)[number]);
  const mimeOk = !file.type || ALLOWED_MIME.has(file.type);
  return extOk && mimeOk;
}

export default function CoverUpload({
  name = 'cover_imagekit_url',
  defaultUrl,
  imagekits,
  onUploadingChange,
}: CoverUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const [imagekitId, setImagekitId] = useState<number>(imagekits[0]?.id ?? 0);
  const [url, setUrl] = useState(defaultUrl ?? '');
  const [preview, setPreview] = useState(defaultUrl ?? '');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<UploadState>(defaultUrl ? 'done' : 'idle');
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');

  const disabled = imagekits.length === 0;

  useEffect(() => {
    onUploadingChange?.(status === 'uploading');
  }, [status, onUploadingChange]);

  function resetInput() {
    if (inputRef.current) inputRef.current.value = '';
  }

  function cancelUpload() {
    xhrRef.current?.abort();
    xhrRef.current = null;
    setStatus(url ? 'done' : 'idle');
    setProgress(0);
  }

  async function handleFileChange(file: File | null) {
    setError('');
    if (!file) return;

    if (!isAllowedFile(file)) {
      setError('Format tidak didukung. Gunakan PNG, JPG, JPEG, WEBP, atau ICO.');
      resetInput();
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Ukuran file maksimal ${MAX_SIZE_MB} MB.`);
      resetInput();
      return;
    }

    if (!imagekitId) {
      setError('Pilih akun ImageKit API terlebih dahulu.');
      resetInput();
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setFileName(file.name);
    setStatus('uploading');
    setProgress(0);

    try {
      const auth = await getImagekitAuthAction(imagekitId);
      if (!auth.ok) {
        setStatus('error');
        setError(auth.error);
        resetInput();
        return;
      }

      const ext = getExtension(file);
      const safeName = `${Date.now()}-cover.${ext}`;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', safeName);
      formData.append('publicKey', auth.publicKey);
      formData.append('signature', auth.signature);
      formData.append('expire', String(auth.expire));
      formData.append('token', auth.token);
      formData.append('folder', '/drama-covers');
      formData.append('useUniqueFileName', 'true');

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;
        xhr.open('POST', 'https://upload.imagekit.io/api/v1/files/upload');

        xhr.upload.onprogress = (event) => {
          if (!event.lengthComputable) return;
          const pct = Math.round((event.loaded / event.total) * 100);
          setProgress(pct);
        };

        xhr.onload = () => {
          xhrRef.current = null;
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const json = JSON.parse(xhr.responseText) as { url?: string };
              if (!json.url) {
                reject(new Error('Respons ImageKit tidak berisi URL.'));
                return;
              }
              setUrl(json.url);
              setPreview(json.url);
              setProgress(100);
              setStatus('done');
              resolve();
            } catch {
              reject(new Error('Gagal membaca respons ImageKit.'));
            }
          } else {
            let message = `Upload gagal (${xhr.status}).`;
            try {
              const json = JSON.parse(xhr.responseText) as { message?: string };
              if (json.message) message = json.message;
            } catch {
              // ignore
            }
            reject(new Error(message));
          }
        };

        xhr.onerror = () => {
          xhrRef.current = null;
          reject(new Error('Koneksi upload gagal.'));
        };

        xhr.onabort = () => {
          xhrRef.current = null;
          reject(new Error('Upload dibatalkan.'));
        };

        xhr.send(formData);
      });
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Upload gagal.');
      if (!url) setPreview('');
      else setPreview(url);
    } finally {
      resetInput();
      URL.revokeObjectURL(localPreview);
    }
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{
          display: 'block',
          fontSize: 13,
          fontWeight: 600,
          color: '#334433',
          marginBottom: 6,
        }}
      >
        Cover Drama
      </label>

      <input type="hidden" name={name} value={url} />

      {imagekits.length > 1 && (
        <select
          value={imagekitId || ''}
          onChange={(e) => setImagekitId(Number(e.target.value))}
          disabled={status === 'uploading'}
          style={{
            width: '100%',
            marginBottom: 10,
            padding: '10px 12px',
            border: '1px solid #cbd9cb',
            borderRadius: 8,
            fontSize: 13,
            background: '#f4f7f4',
            color: '#2a392a',
            boxSizing: 'border-box',
          }}
        >
          {imagekits.map((ik) => (
            <option key={ik.id} value={ik.id}>
              {ik.name}
            </option>
          ))}
        </select>
      )}

      {disabled && (
        <div
          style={{
            background: '#fff7ed',
            border: '1px solid #fed7aa',
            color: '#c2410c',
            borderRadius: 8,
            padding: '10px 12px',
            fontSize: 13,
            marginBottom: 10,
          }}
        >
          Belum ada ImageKit API. Tambahkan di menu ImageKit API sebelum upload cover.
        </div>
      )}

      <div
        style={{
          border: '1px dashed #cbd9cb',
          borderRadius: 12,
          background: '#f4f7f4',
          padding: 16,
        }}
      >
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div
            style={{
              width: 112,
              height: 148,
              borderRadius: 10,
              overflow: 'hidden',
              background: '#e4ebe4',
              border: '1px solid #cbd9cb',
              flexShrink: 0,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Cover preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span style={{ fontSize: 11, color: '#7fa07f', textAlign: 'center', padding: 8 }}>
                Belum ada cover
              </span>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <p style={{ margin: '0 0 8px', fontSize: 12, color: '#608460' }}>
              Format: PNG, JPG, JPEG, WEBP, ICO · Maks {MAX_SIZE_MB} MB
            </p>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
              <button
                type="button"
                disabled={disabled || status === 'uploading'}
                onClick={() => inputRef.current?.click()}
                style={{
                  background: disabled || status === 'uploading' ? '#a7bfa7' : '#4a694a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '9px 14px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: disabled || status === 'uploading' ? 'not-allowed' : 'pointer',
                }}
              >
                {url ? 'Ganti Gambar' : 'Pilih Gambar'}
              </button>

              {status === 'uploading' && (
                <button
                  type="button"
                  onClick={cancelUpload}
                  style={{
                    background: '#fef2f2',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                    borderRadius: 8,
                    padding: '9px 14px',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Batalkan
                </button>
              )}

              {url && status !== 'uploading' && (
                <button
                  type="button"
                  onClick={() => {
                    setUrl('');
                    setPreview('');
                    setFileName('');
                    setProgress(0);
                    setStatus('idle');
                    setError('');
                  }}
                  style={{
                    background: '#fff',
                    color: '#4a694a',
                    border: '1px solid #cbd9cb',
                    borderRadius: 8,
                    padding: '9px 14px',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Hapus Cover
                </button>
              )}
            </div>

            <input
              ref={inputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.webp,.ico,image/png,image/jpeg,image/webp,image/x-icon,image/vnd.microsoft.icon"
              hidden
              onChange={(e) => {
                void handleFileChange(e.target.files?.[0] ?? null);
              }}
            />

            {(status === 'uploading' || (status === 'done' && progress === 100 && fileName)) && (
              <div style={{ marginTop: 4 }}>
                {fileName && (
                  <p style={{ margin: '0 0 6px', fontSize: 12, color: '#4a694a' }}>
                    {status === 'uploading' ? 'Mengunggah' : 'Selesai'}: {fileName}
                  </p>
                )}
                <div
                  style={{
                    height: 8,
                    borderRadius: 999,
                    background: '#e4ebe4',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${progress}%`,
                      background: '#4a694a',
                      transition: 'width 0.2s ease',
                    }}
                  />
                </div>
                <p style={{ margin: '6px 0 0', fontSize: 11, color: '#7fa07f' }}>
                  {status === 'uploading' ? `${progress}%` : status === 'done' ? 'Upload berhasil' : null}
                </p>
              </div>
            )}

            {error && (
              <p style={{ margin: '8px 0 0', fontSize: 12, color: '#dc2626' }}>{error}</p>
            )}

            {url && status === 'done' && !error && (
              <p
                style={{
                  margin: '8px 0 0',
                  fontSize: 11,
                  color: '#608460',
                  wordBreak: 'break-all',
                }}
              >
                {url}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
