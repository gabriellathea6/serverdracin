import { deleteImagekitAction } from '@/app/actions/imagekit';
import DataTable, { type Column } from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import { supabase } from '@/lib/supabase';
import type { ImagekitApi } from '@/lib/types';
import { formatDate, maskSecret } from '@/lib/utils';

export const metadata = {
  title: 'ImageKit API | MediaCDN.net',
};

export default async function ImagekitApiPage() {
  const { data, error } = await supabase
    .from('imagekit_api')
    .select('*')
    .order('create_at', { ascending: false });

  const rows = (data ?? []) as ImagekitApi[];

  const columns: Column<ImagekitApi>[] = [
    {
      key: 'name',
      header: 'Nama',
      render: (row) => <span style={{ fontWeight: 600, color: '#2a392a' }}>{row.name}</span>,
    },
    {
      key: 'public_key',
      header: 'Public Key',
      nowrap: true,
      render: (row) => (
        <code style={{ fontSize: 12, color: '#4a694a' }}>{maskSecret(row.public_key, 10)}</code>
      ),
    },
    {
      key: 'private_key',
      header: 'Private Key',
      nowrap: true,
      render: (row) => (
        <code style={{ fontSize: 12, color: '#7fa07f' }}>{maskSecret(row.private_key, 4)}</code>
      ),
    },
    {
      key: 'endpoint_url',
      header: 'Endpoint',
      render: (row) => (
        <span
          style={{
            fontSize: 12,
            color: '#4a694a',
            maxWidth: 220,
            display: 'inline-block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {row.endpoint_url}
        </span>
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
        title="ImageKit API"
        description="Kelola kredensial ImageKit untuk upload cover dan media."
        createHref="/aplikasi/imgakit-api/create"
        createLabel="Tambah API Key"
      />
      {error && (
        <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 12 }}>
          Gagal memuat data: {error.message}
        </p>
      )}
      <DataTable
        columns={columns}
        rows={rows}
        editHref={(row) => `/aplikasi/imgakit-api/edit/${row.id}`}
        deleteAction={deleteImagekitAction}
        emptyTitle="Belum ada ImageKit API"
        emptyDescription="Tambahkan kredensial ImageKit untuk upload media."
      />
    </div>
  );
}
