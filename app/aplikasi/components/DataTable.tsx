import Link from 'next/link';
import type { ReactNode } from 'react';
import DeleteButton from './DeleteButton';
import { IconPencil } from './Icons';

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  nowrap?: boolean;
};

type DataTableProps<T extends { id: number }> = {
  columns: Column<T>[];
  rows: T[];
  editHref?: (row: T) => string;
  deleteAction?: (formData: FormData) => void | Promise<void>;
  extraActions?: (row: T) => ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
};

export default function DataTable<T extends { id: number }>({
  columns,
  rows,
  editHref,
  deleteAction,
  extraActions,
  emptyTitle = 'Belum ada data',
  emptyDescription = 'Tambahkan data baru untuk mulai mengisi tabel ini.',
}: DataTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #e4ebe4',
          padding: '48px 24px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#334433', margin: '0 0 6px' }}>
          {emptyTitle}
        </h2>
        <p style={{ fontSize: 13, color: '#7fa07f', margin: 0 }}>{emptyDescription}</p>
      </div>
    );
  }

  const showActions = Boolean(editHref || deleteAction || extraActions);

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        border: '1px solid #e4ebe4',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'rgba(244,247,244,0.8)', borderBottom: '1px solid #e4ebe4' }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#608460',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col.header}
                </th>
              ))}
              {showActions && (
                <th
                  style={{
                    padding: '12px 16px',
                    textAlign: 'right',
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#608460',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Aksi
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} style={{ borderBottom: '1px solid #f4f7f4' }}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      padding: '12px 16px',
                      color: '#334433',
                      whiteSpace: col.nowrap ? 'nowrap' : undefined,
                      maxWidth: 320,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {col.render(row)}
                  </td>
                ))}
                {showActions && (
                  <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      {extraActions?.(row)}
                      {editHref && (
                        <Link
                          href={editHref(row)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: '#f4f7f4',
                            color: '#4a694a',
                            textDecoration: 'none',
                          }}
                          title="Edit"
                        >
                          <IconPencil size={14} color="#4a694a" />
                        </Link>
                      )}
                      {deleteAction && (
                        <DeleteButton id={row.id} deleteAction={deleteAction} />
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div
        style={{
          padding: '10px 16px',
          borderTop: '1px solid #e4ebe4',
          fontSize: 12,
          color: '#7fa07f',
        }}
      >
        Total {rows.length} data
      </div>
    </div>
  );
}
