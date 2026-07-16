'use client';

import { useState } from 'react';
import EpisodeHlsPlayer from './EpisodeHlsPlayer';

export default function EpisodePlayButton({
  url,
  label,
}: {
  url: string;
  label: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          background: open ? '#334433' : '#4a694a',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '6px 10px',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {open ? 'Tutup Player' : 'Play'}
      </button>
      {open && (
        <div style={{ marginTop: 10, minWidth: 280, maxWidth: 480 }}>
          <EpisodeHlsPlayer src={url} title={label} />
        </div>
      )}
    </div>
  );
}
