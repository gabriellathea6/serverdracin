'use client';

import { useEffect, useState, useTransition } from 'react';
import {
  createEpisodeAction,
  getNextEpisodeNumber,
  updateEpisodeAction,
} from '@/app/actions/episode';
import type { Drama, Episode } from '@/lib/types';
import CrudForm from '../components/CrudForm';
import EpisodeVideoUpload from '../components/EpisodeVideoUpload';

export default function EpisodeForm({
  episode,
  dramas,
  defaultDramaId,
  initialEpisodeNumber,
  cancelHref = '/aplikasi/episode',
  returnTo,
}: {
  episode?: Episode;
  dramas: Drama[];
  defaultDramaId?: number;
  initialEpisodeNumber?: number;
  cancelHref?: string;
  returnTo?: string;
}) {
  const isEdit = Boolean(episode);
  const action = isEdit ? updateEpisodeAction : createEpisodeAction;
  const [dramaId, setDramaId] = useState<number | undefined>(
    episode?.id_drama ?? defaultDramaId,
  );
  const [episodeNumber, setEpisodeNumber] = useState<number>(
    episode?.episode ?? initialEpisodeNumber ?? 1,
  );
  const [uploading, setUploading] = useState(false);
  const [counting, startCounting] = useTransition();

  const selectedDrama = dramas.find((d) => d.id === dramaId);

  useEffect(() => {
    if (isEdit || !dramaId) return;

    startCounting(async () => {
      const next = await getNextEpisodeNumber(dramaId);
      setEpisodeNumber(next);
    });
  }, [dramaId, isEdit]);

  return (
    <CrudForm
      action={action}
      submitLabel={isEdit ? 'Simpan Perubahan' : 'Tambah Episode'}
      cancelHref={cancelHref}
      blockSubmit={uploading}
      blockSubmitHint="Tunggu upload & transcode selesai sebelum menyimpan."
    >
      {episode && <input type="hidden" name="id" value={episode.id} />}
      {returnTo && <input type="hidden" name="return_to" value={returnTo} />}

      <div style={{ marginBottom: 16 }}>
        <label
          htmlFor="id_drama"
          style={{
            display: 'block',
            fontSize: 13,
            fontWeight: 600,
            color: '#334433',
            marginBottom: 6,
          }}
        >
          Drama
          <span style={{ color: '#dc2626', marginLeft: 4 }}>*</span>
        </label>
        <select
          id="id_drama"
          name="id_drama"
          required
          value={dramaId ?? ''}
          onChange={(e) => setDramaId(Number(e.target.value) || undefined)}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #cbd9cb',
            borderRadius: 8,
            fontSize: 13,
            outline: 'none',
            background: '#f4f7f4',
            color: '#2a392a',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
          }}
        >
          <option value="">Pilih...</option>
          {dramas.map((d) => (
            <option key={d.id} value={d.id}>
              {d.title}
            </option>
          ))}
        </select>
        <p style={{ margin: '6px 0 0', fontSize: 11, color: '#7fa07f' }}>
          {dramas.length === 0
            ? 'Belum ada drama. Tambah drama dulu.'
            : selectedDrama
              ? `Folder media: app/media/${selectedDrama.slug || selectedDrama.title}`
              : undefined}
        </p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label
          htmlFor="episode"
          style={{
            display: 'block',
            fontSize: 13,
            fontWeight: 600,
            color: '#334433',
            marginBottom: 6,
          }}
        >
          Nomor Episode
          <span style={{ color: '#dc2626', marginLeft: 4 }}>*</span>
        </label>
        <input
          id="episode"
          name="episode"
          type="number"
          required
          min={1}
          value={episodeNumber}
          onChange={(e) => setEpisodeNumber(Number(e.target.value) || 1)}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #cbd9cb',
            borderRadius: 8,
            fontSize: 13,
            outline: 'none',
            background: counting ? '#e4ebe4' : '#f4f7f4',
            color: '#2a392a',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
          }}
        />
        <p style={{ margin: '6px 0 0', fontSize: 11, color: '#7fa07f' }}>
          {counting
            ? 'Menghitung nomor episode berikutnya...'
            : !isEdit && dramaId
              ? `Otomatis: episode berikutnya untuk drama ini adalah #${episodeNumber}`
              : !isEdit
                ? 'Pilih drama untuk mengisi nomor episode otomatis.'
                : undefined}
        </p>
      </div>

      <EpisodeVideoUpload
        defaultUrl={episode?.url}
        dramaId={dramaId}
        episodeNumber={episodeNumber}
        onUploadingChange={setUploading}
      />
    </CrudForm>
  );
}
