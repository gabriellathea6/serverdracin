'use client';

import { useEffect, useRef, useState } from 'react';

type EpisodeHlsPlayerProps = {
  src: string;
  title?: string;
};

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Hls?: any;
  }
}

function isHlsUrl(url: string) {
  return url.toLowerCase().includes('.m3u8');
}

export default function EpisodeHlsPlayer({ src, title }: EpisodeHlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<{ destroy: () => void } | null>(null);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    setError('');
    setReady(false);

    let cancelled = false;

    async function setup() {
      // Safari / iOS: native HLS
      if (video!.canPlayType('application/vnd.apple.mpegurl') && isHlsUrl(src)) {
        video!.src = src;
        setReady(true);
        return;
      }

      // Non-HLS (mp4 etc.)
      if (!isHlsUrl(src)) {
        video!.src = src;
        setReady(true);
        return;
      }

      // Chrome/Firefox: hls.js
      try {
        if (!window.Hls) {
          await new Promise<void>((resolve, reject) => {
            const existing = document.querySelector<HTMLScriptElement>('script[data-hls-js]');
            if (existing) {
              existing.addEventListener('load', () => resolve());
              existing.addEventListener('error', () => reject(new Error('Gagal memuat hls.js')));
              return;
            }
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
            script.async = true;
            script.dataset.hlsJs = 'true';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Gagal memuat hls.js'));
            document.head.appendChild(script);
          });
        }

        if (cancelled || !window.Hls) return;

        if (!window.Hls.isSupported()) {
          setError('Browser tidak mendukung pemutaran HLS.');
          return;
        }

        const hls = new window.Hls({
          enableWorker: true,
          xhrSetup: (xhr: XMLHttpRequest) => {
            xhr.withCredentials = false;
          },
        });
        hlsRef.current = hls;
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
          if (!cancelled) setReady(true);
        });
        hls.on(window.Hls.Events.ERROR, (_event: unknown, data: { fatal?: boolean; type?: string; details?: string }) => {
          if (data?.fatal) {
            setError(`Gagal memutar stream (${data.details || data.type || 'error'}).`);
          }
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal inisialisasi player.');
      }
    }

    void setup();

    return () => {
      cancelled = true;
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (video) {
        video.removeAttribute('src');
        video.load();
      }
    };
  }, [src]);

  return (
    <div
      style={{
        background: '#1a231a',
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid #334433',
      }}
    >
      {title && (
        <div style={{ padding: '10px 14px', color: '#e4ebe4', fontSize: 13, fontWeight: 600 }}>
          {title}
        </div>
      )}
      <video
        ref={videoRef}
        controls
        playsInline
        style={{
          width: '100%',
          maxHeight: 420,
          display: 'block',
          background: '#000',
        }}
      />
      {!ready && !error && (
        <p style={{ margin: 0, padding: '8px 14px', fontSize: 12, color: '#a7bfa7' }}>
          Menyiapkan player HLS...
        </p>
      )}
      {error && (
        <p style={{ margin: 0, padding: '8px 14px', fontSize: 12, color: '#fca5a5' }}>{error}</p>
      )}
      <p
        style={{
          margin: 0,
          padding: '8px 14px 12px',
          fontSize: 11,
          color: '#7fa07f',
          wordBreak: 'break-all',
        }}
      >
        {src}
      </p>
    </div>
  );
}
