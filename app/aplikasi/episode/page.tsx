import { deleteEpisodeAction } from '@/app/actions/episode';
import DataTable, { type Column } from '../components/DataTable';
import EpisodePlayButton from '../components/EpisodePlayButton';
import PageHeader from '../components/PageHeader';
import { supabase } from '@/lib/supabase';
import type { Episode } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export const metadata = {
  title: 'Episode | MediaCDN.net',
};

type EpisodeRow = Episode & {
  drama: { id: number; title: string; slug: string } | null;
};

export default async function EpisodePage() {
  const { data, error } = await supabase
    .from('episode')
    .select('*, drama(id, title, slug)')
    .order('create_at', { ascending: false });

  const rows = (data ?? []) as EpisodeRow[];

  const columns: Column<EpisodeRow>[] = [
    {
      key: 'drama',
      header: 'Drama',
      render: (row) => (
        <span style={{ fontWeight: 600, color: '#2a392a' }}>
          {row.drama?.title ?? '-'}
        </span>
      ),
    },
    {
      key: 'episode',
      header: 'Eps',
      nowrap: true,
      render: (row) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>#{row.episode}</span>
      ),
    },
    {
      key: 'url',
      header: 'Video',
      render: (row) => (
        <EpisodePlayButton
          url={row.url}
          label={`${row.drama?.title ?? 'Drama'} · Eps #${row.episode}`}
        />
      ),
    },
    {
      key: 'create_at',
      header: 'Dibuat',
      nowrap: true,
      render: (row) => formatDate(row.create_at),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Episode"
        description="Kelola episode dan stream HLS lokal."
        createHref="/aplikasi/episode/create"
        createLabel="Tambah Episode"
      />
      {error && (
        <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 12 }}>
          Gagal memuat data: {error.message}
        </p>
      )}
      <DataTable
        columns={columns}
        rows={rows}
        editHref={(row) => `/aplikasi/episode/edit/${row.id}`}
        deleteAction={deleteEpisodeAction}
        emptyTitle="Belum ada episode"
        emptyDescription="Tambahkan episode setelah drama tersedia."
      />
    </div>
  );
}
