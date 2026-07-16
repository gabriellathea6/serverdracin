'use client';

import { useState } from 'react';
import { createProviderAction, updateProviderAction } from '@/app/actions/provider';
import type { ProviderDrama } from '@/lib/types';
import { slugify } from '@/lib/utils';
import CrudForm from '../components/CrudForm';
import FormField from '../components/FormField';

export default function ProviderForm({ provider }: { provider?: ProviderDrama }) {
  const [name, setName] = useState(provider?.name ?? '');
  const [slug, setSlug] = useState(provider?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(provider));

  const action = provider ? updateProviderAction : createProviderAction;

  return (
    <CrudForm
      action={action}
      submitLabel={provider ? 'Simpan Perubahan' : 'Tambah Provider'}
      cancelHref="/aplikasi/provider"
    >
      {provider && <input type="hidden" name="id" value={provider.id} />}
      <FormField
        label="Nama Provider"
        name="name"
        required
        value={name}
        placeholder="Contoh: DramaBox"
        onChange={(value) => {
          setName(value);
          if (!slugTouched) setSlug(slugify(value));
        }}
      />
      <FormField
        label="Slug"
        name="slug"
        required
        value={slug}
        placeholder="dramabox"
        hint="Digunakan di URL. Huruf kecil, angka, dan strip."
        onChange={(value) => {
          setSlugTouched(true);
          setSlug(slugify(value));
        }}
      />
    </CrudForm>
  );
}
