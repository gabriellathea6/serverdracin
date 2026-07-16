import Link from 'next/link';
import { deleteDramaAction } from '@/app/actions/drama';
import DataTable, { type Column } from '../components/DataTable';
import { IconFilm } from '../components/Icons';
import PageHeader from '../components/PageHeader';
import { supabase } from '@/lib/supabase';
import type { Drama } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export const metadata = {
  title: 'Drama | MediaCDN.net',
};

type DramaRow = Drama & {
  provider_drama: { id: number; name: string; slug: string } | null;
};

export default async function DramaPage() {
  const { data, error } = await supabase
    .from('drama')
    .select('*, provider_drama(id, name, slug)')
    .order('create_at', { ascending: false });

  const rows = (data ?? []) as DramaRow[];

  const columns: Column<DramaRow>[] = [
    {
      key: 'title',
      header: 'Judul',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: '#2a392a' }}>{row.title}</div>
          <div style={{ fontSize: 11, color: '#7fa07f', marginTop: 2 }}>{row.slug}</div>
        </div>
      ),
    },
    {
      key: 'provider',
      header: 'Provider',
      nowrap: true,
      render: (row) => row.provider_drama?.name ?? '-',
    },
    {
      key: 'total_episode',
      header: 'Episode',
      nowrap: true,
      render: (row) => row.total_episode,
    },
    {
      key: 'cover',
      header: 'Cover',
      render: (row) =>
        row.cover_imagekit_url ? (
          <a
            href={row.cover_imagekit_url}
            target="_blank"
            rel="noreferrer"
            style={{ color: '#4a694a', fontSize: 12 }}
          >
            Lihat
          </a>
        ) : (
          <span style={{ color: '#7fa07f' }}>-</span>
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
        title="Drama"
        description="Kelola daftar drama dan metadata konten."
        createHref="/aplikasi/drama/create"
        createLabel="Tambah Drama"
      />
      {error && (
        <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 12 }}>
          Gagal memuat data: {error.message}
        </p>
      )}
      <DataTable
        columns={columns}
        rows={rows}
        editHref={(row) => `/aplikasi/drama/edit/${row.slug}`}
        deleteAction={deleteDramaAction}
        extraActions={(row) => (
          <Link
            href={`/aplikasi/episode/create?dramaId=${row.id}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 8,
              background: '#eef6ee',
              color: '#4a694a',
              textDecoration: 'none',
              border: '1px solid #d5e4d5',
            }}
            title="Isi Episode"
          >
            <IconFilm size={14} color="#4a694a" />
          </Link>
        )}
        emptyTitle="Belum ada drama"
        emptyDescription="Tambahkan drama setelah provider tersedia."
      />
    </div>
  );
}
