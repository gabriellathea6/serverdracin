import { deleteProviderAction } from '@/app/actions/provider';
import DataTable, { type Column } from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import { supabase } from '@/lib/supabase';
import type { ProviderDrama } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export const metadata = {
  title: 'Provider | MediaCDN.net',
};

export default async function ProviderPage() {
  const { data, error } = await supabase
    .from('provider_drama')
    .select('*')
    .order('create_at', { ascending: false });

  const rows = (data ?? []) as ProviderDrama[];

  const columns: Column<ProviderDrama>[] = [
    {
      key: 'name',
      header: 'Nama',
      render: (row) => <span style={{ fontWeight: 600, color: '#2a392a' }}>{row.name}</span>,
    },
    {
      key: 'slug',
      header: 'Slug',
      nowrap: true,
      render: (row) => (
        <code style={{ fontSize: 12, color: '#4a694a', background: '#f4f7f4', padding: '2px 6px', borderRadius: 4 }}>
          {row.slug}
        </code>
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
        title="Provider"
        description="Kelola provider drama dan slug sumber konten."
        createHref="/aplikasi/provider/create"
        createLabel="Tambah Provider"
      />
      {error && (
        <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 12 }}>
          Gagal memuat data: {error.message}
        </p>
      )}
      <DataTable
        columns={columns}
        rows={rows}
        editHref={(row) => `/aplikasi/provider/edit/${row.slug}`}
        deleteAction={deleteProviderAction}
        emptyTitle="Belum ada provider"
        emptyDescription="Tambahkan provider untuk mengaitkan drama."
      />
    </div>
  );
}
