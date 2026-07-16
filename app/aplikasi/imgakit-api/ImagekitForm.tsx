'use client';

import { createImagekitAction, updateImagekitAction } from '@/app/actions/imagekit';
import type { ImagekitApi } from '@/lib/types';
import CrudForm from '../components/CrudForm';
import FormField from '../components/FormField';

export default function ImagekitForm({ item }: { item?: ImagekitApi }) {
  const action = item ? updateImagekitAction : createImagekitAction;

  return (
    <CrudForm
      action={action}
      submitLabel={item ? 'Simpan Perubahan' : 'Tambah ImageKit API'}
      cancelHref="/aplikasi/imgakit-api"
    >
      {item && <input type="hidden" name="id" value={item.id} />}
      <FormField
        label="Nama"
        name="name"
        required
        defaultValue={item?.name}
        placeholder="Akun ImageKit utama"
      />
      <FormField
        label="Public Key"
        name="public_key"
        required
        defaultValue={item?.public_key}
        placeholder="public_..."
      />
      <FormField
        label="Private Key"
        name="private_key"
        type="password"
        required
        defaultValue={item?.private_key}
        placeholder="private_..."
      />
      <FormField
        label="Endpoint URL"
        name="endpoint_url"
        type="url"
        required
        defaultValue={item?.endpoint_url}
        placeholder="https://ik.imagekit.io/..."
      />
    </CrudForm>
  );
}
