'use client';

import { IconTrash } from './Icons';

type DeleteButtonProps = {
  id: number;
  deleteAction: (formData: FormData) => void | Promise<void>;
};

export default function DeleteButton({ id, deleteAction }: DeleteButtonProps) {
  return (
    <form
      action={deleteAction}
      onSubmit={(e) => {
        if (!confirm('Yakin ingin menghapus data ini?')) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        title="Hapus"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 32,
          height: 32,
          borderRadius: 8,
          background: '#fef2f2',
          color: '#dc2626',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <IconTrash size={14} color="#dc2626" />
      </button>
    </form>
  );
}
