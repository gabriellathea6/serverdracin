'use client';

import { useEffect, useRef, useState } from 'react';
import EpisodeHlsPlayer from './EpisodeHlsPlayer';

type EpisodeVideoUploadProps = {
  name?: string;
  defaultUrl?: string | null;
  dramaId?: number;
  episodeNumber?: number;
  onUploadingChange?: (uploading: boolean) => void;
};

type ProcessState = 'idle' | 'uploading' | 'transcoding' | 'done' | 'error';

const MAX_SIZE_MB = 500;

export default function EpisodeVideoUpload({
  name = 'url',
  defaultUrl,
  dramaId,
  episodeNumber,
  onUploadingChange,
}: EpisodeVideoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const abortTranscodeRef = useRef<AbortController | null>(null);

  const [url, setUrl] = useState(defaultUrl ?? '');
  const [fileName, setFileName] = useState('');
  const [progress, setProgress] = useState(0);
  const [phaseLabel, setPhaseLabel] = useState('');
  const [status, setStatus] = useState<ProcessState>(defaultUrl ? 'done' : 'idle');
  const [error, setError] = useState('');

  const busy = status === 'uploading' || status === 'transcoding';

  useEffect(() => {
    onUploadingChange?.(busy);
  }, [busy, onUploadingChange]);

  function resetInput() {
    if (inputRef.current) inputRef.current.value = '';
  }

  function cancelProcess() {
    xhrRef.current?.abort();
    xhrRef.current = null;
    abortTranscodeRef.current?.abort();
    abortTranscodeRef.current = null;
    setStatus(url ? 'done' : 'idle');
    setProgress(0);
    setPhaseLabel('');
  }

  async function runTranscode(relativePath: string) {
    if (!dramaId) {
      throw new Error('Drama wajib dipilih sebelum transcode.');
    }

    setStatus('transcoding');
    setProgress(0);
    setPhaseLabel('Transcoding ke HLS lokal...');

    const controller = new AbortController();
    abortTranscodeRef.current = controller;

    const response = await fetch('/api/media/transcode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        relativePath,
        baseUrl: window.location.origin,
      }),
      signal: controller.signal,
    });

    if (!response.ok || !response.body) {
      let message = `Transcode gagal (${response.status}).`;
      try {
        const json = (await response.json()) as { error?: string };
        if (json.error) message = json.error;
      } catch {
        // ignore
      }
      throw new Error(message);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let finalUrl = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        const event = JSON.parse(line) as {
          type: string;
          percent?: number;
          url?: string;
          error?: string;
          message?: string;
          phase?: string;
        };

        if (event.type === 'progress' && typeof event.percent === 'number') {
          setProgress(event.percent);
          setPhaseLabel(event.message || 'Transcoding ke HLS lokal...');
        }
        if (event.type === 'status' && event.message) {
          setPhaseLabel(event.message);
        }
        if (event.type === 'error') {
          throw new Error(event.error || 'Transcode gagal.');
        }
        if (event.type === 'done' && event.url) {
          finalUrl = event.url;
          setProgress(100);
        }
      }
    }

    if (!finalUrl) {
      throw new Error('Proses selesai tanpa URL m3u8 lokal.');
    }

    setUrl(finalUrl);
    setStatus('done');
    setPhaseLabel('Transcode lokal selesai');
    abortTranscodeRef.current = null;
  }

  async function handleFileChange(file: File | null) {
    setError('');
    if (!file) return;

    if (!dramaId) {
      setError('Pilih drama terlebih dahulu sebelum upload video.');
      resetInput();
      return;
    }

    const lower = file.name.toLowerCase();
    const mime = file.type || '';
    const mimeOk =
      !mime ||
      mime === 'video/mp4' ||
      mime === 'application/mp4' ||
      mime === 'video/mpeg' ||
      mime === 'application/octet-stream';
    if (!lower.endsWith('.mp4') || !mimeOk) {
      setError('Hanya file MP4 yang didukung.');
      resetInput();
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Ukuran file maksimal ${MAX_SIZE_MB} MB.`);
      resetInput();
      return;
    }

    setFileName(file.name);
    setStatus('uploading');
    setProgress(0);
    setPhaseLabel('Mengunggah MP4...');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('dramaId', String(dramaId));
    if (episodeNumber && episodeNumber > 0) {
      formData.append('episode', String(episodeNumber));
    }

    try {
      const uploadResult = await new Promise<{
        relativePath: string;
        fileName: string;
      }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;
        xhr.open('POST', '/api/media/upload');

        xhr.upload.onprogress = (event) => {
          if (!event.lengthComputable) return;
          setProgress(Math.round((event.loaded / event.total) * 100));
        };

        xhr.onload = () => {
          xhrRef.current = null;
          try {
            const json = JSON.parse(xhr.responseText) as {
              relativePath?: string;
              fileName?: string;
              error?: string;
            };
            if (xhr.status >= 200 && xhr.status < 300 && json.relativePath) {
              resolve({
                relativePath: json.relativePath,
                fileName: json.fileName || file.name,
              });
              return;
            }
            reject(new Error(json.error || `Upload gagal (${xhr.status}).`));
          } catch {
            reject(new Error('Gagal membaca respons upload.'));
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

      setFileName(uploadResult.fileName);
      await runTranscode(uploadResult.relativePath);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setStatus(url ? 'done' : 'idle');
        setPhaseLabel('');
        return;
      }
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Proses gagal.');
      if (!url) setFileName('');
      setPhaseLabel('');
    } finally {
      resetInput();
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
        File Video Episode
        <span style={{ color: '#dc2626', marginLeft: 4 }}>*</span>
      </label>

      <input type="hidden" name={name} value={url} required={!url} />

      <div
        style={{
          border: '1px dashed #cbd9cb',
          borderRadius: 12,
          background: '#f4f7f4',
          padding: 16,
        }}
      >
        <p style={{ margin: '0 0 10px', fontSize: 12, color: '#608460' }}>
          MP4 → HLS lokal · MP4 asli dihapus setelah transcode berhasil
        </p>

        {!dramaId && (
          <p style={{ margin: '0 0 10px', fontSize: 12, color: '#c2410c' }}>
            Pilih drama dulu agar file masuk ke folder judul yang benar.
          </p>
        )}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          <button
            type="button"
            disabled={!dramaId || busy}
            onClick={() => inputRef.current?.click()}
            style={{
              background: !dramaId || busy ? '#a7bfa7' : '#4a694a',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '9px 14px',
              fontSize: 13,
              fontWeight: 600,
              cursor: !dramaId || busy ? 'not-allowed' : 'pointer',
            }}
          >
            {url ? 'Ganti Video MP4' : 'Pilih Video MP4'}
          </button>

          {busy && (
            <button
              type="button"
              onClick={cancelProcess}
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

          {url && !busy && (
            <button
              type="button"
              onClick={() => {
                setUrl('');
                setFileName('');
                setProgress(0);
                setStatus('idle');
                setError('');
                setPhaseLabel('');
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
              Hapus Video
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,.mp4"
          hidden
          onChange={(e) => {
            void handleFileChange(e.target.files?.[0] ?? null);
          }}
        />

        {(busy || (status === 'done' && progress === 100)) && (
          <div>
            <p style={{ margin: '0 0 6px', fontSize: 12, color: '#4a694a' }}>
              {status === 'uploading' && `Upload: ${fileName || 'MP4'}`}
              {status === 'transcoding' && (phaseLabel || 'Transcoding...')}
              {status === 'done' && (phaseLabel || 'Selesai')}
            </p>
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
                  background: status === 'transcoding' ? '#334433' : '#4a694a',
                  transition: 'width 0.2s ease',
                }}
              />
            </div>
            <p style={{ margin: '6px 0 0', fontSize: 11, color: '#7fa07f' }}>
              {busy ? `${progress}%` : 'Siap diputar (HLS lokal)'}
            </p>
          </div>
        )}

        {error && (
          <p style={{ margin: '8px 0 0', fontSize: 12, color: '#dc2626' }}>{error}</p>
        )}

        {url && status === 'done' && !error && (
          <div style={{ marginTop: 12 }}>
            <p style={{ margin: '0 0 8px', fontSize: 11, color: '#608460', wordBreak: 'break-all' }}>
              Stream URL: {url}
            </p>
            {/* Preview player after successful ImageKit upload */}
            <EpisodeHlsPlayer src={url} title="Preview stream" />
          </div>
        )}
      </div>
    </div>
  );
}
