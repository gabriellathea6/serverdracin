'use client';

import Link from 'next/link';
import { useActionState, useEffect, useState } from 'react';
import type { ActionState } from '@/lib/types';

type CrudFormProps = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  submitLabel: string;
  cancelHref: string;
  blockSubmit?: boolean;
  blockSubmitHint?: string;
};

const initialState: ActionState = {};

export default function CrudForm({
  action,
  children,
  submitLabel,
  cancelHref,
  blockSubmit = false,
  blockSubmitHint,
}: CrudFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [blocked, setBlocked] = useState(blockSubmit);

  useEffect(() => {
    setBlocked(blockSubmit);
  }, [blockSubmit]);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (blocked) {
          e.preventDefault();
        }
      }}
      style={{
        background: '#fff',
        borderRadius: 12,
        border: '1px solid #e4ebe4',
        padding: 24,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        maxWidth: 720,
      }}
    >
      {state.error && (
        <div
          style={{
            background: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fecaca',
            borderRadius: 8,
            padding: '10px 12px',
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          {state.error}
        </div>
      )}

      {children}

      {blocked && blockSubmitHint && (
        <p style={{ margin: '0 0 12px', fontSize: 12, color: '#c2410c' }}>
          {blockSubmitHint}
        </p>
      )}

      <div
        style={{
          display: 'flex',
          gap: 10,
          marginTop: 8,
          flexWrap: 'wrap',
        }}
      >
        <button
          type="submit"
          disabled={pending || blocked}
          style={{
            background: pending || blocked ? '#7fa07f' : '#4a694a',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 18px',
            fontSize: 13,
            fontWeight: 600,
            cursor: pending || blocked ? 'not-allowed' : 'pointer',
          }}
        >
          {pending ? 'Menyimpan...' : submitLabel}
        </button>
        <Link
          href={cancelHref}
          style={{
            background: '#f4f7f4',
            color: '#4a694a',
            borderRadius: 8,
            padding: '10px 18px',
            fontSize: 13,
            fontWeight: 500,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          Batal
        </Link>
      </div>
    </form>
  );
}
