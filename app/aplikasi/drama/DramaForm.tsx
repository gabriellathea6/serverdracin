'use client';

import { useState } from 'react';
import { createDramaAction, updateDramaAction } from '@/app/actions/drama';
import type { ImagekitOption } from '@/app/actions/imagekit-upload';
import type { Drama, ProviderDrama } from '@/lib/types';
import { slugify } from '@/lib/utils';
import CoverUpload from '../components/CoverUpload';
import CrudForm from '../components/CrudForm';
import FormField from '../components/FormField';

export default function DramaForm({
  drama,
  providers,
  imagekits,
}: {
  drama?: Drama;
  providers: ProviderDrama[];
  imagekits: ImagekitOption[];
}) {
  const [title, setTitle] = useState(drama?.title ?? '');
  const [slug, setSlug] = useState(drama?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(drama));
  const [uploading, setUploading] = useState(false);

  const action = drama ? updateDramaAction : createDramaAction;

  return (
    <CrudForm
      action={action}
      submitLabel={drama ? 'Simpan Perubahan' : 'Tambah Drama'}
      cancelHref="/aplikasi/drama"
      blockSubmit={uploading}
      blockSubmitHint="Tunggu upload cover selesai sebelum menyimpan."
    >
      {drama && <input type="hidden" name="id" value={drama.id} />}
      <FormField
        label="Provider"
        name="id_provider_drama"
        type="select"
        required
        defaultValue={drama?.id_provider_drama}
        options={providers.map((p) => ({ value: p.id, label: p.name }))}
        hint={providers.length === 0 ? 'Belum ada provider. Tambah provider dulu.' : undefined}
      />
      <FormField
        label="Judul"
        name="title"
        required
        value={title}
        placeholder="Judul drama"
        onChange={(value) => {
          setTitle(value);
          if (!slugTouched) setSlug(slugify(value));
        }}
      />
      <FormField
        label="Slug"
        name="slug"
        required
        value={slug}
        placeholder="judul-drama"
        onChange={(value) => {
          setSlugTouched(true);
          setSlug(slugify(value));
        }}
      />
      <FormField
        label="Deskripsi"
        name="deskripsi"
        type="textarea"
        defaultValue={drama?.deskripsi}
        placeholder="Sinopsis singkat..."
      />
      <FormField
        label="Total Episode"
        name="total_episode"
        type="number"
        required
        defaultValue={drama?.total_episode ?? 0}
      />
      <CoverUpload
        defaultUrl={drama?.cover_imagekit_url}
        imagekits={imagekits}
        onUploadingChange={setUploading}
      />
    </CrudForm>
  );
}
