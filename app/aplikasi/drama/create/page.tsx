import PageHeader from '../../components/PageHeader';
import { supabase } from '@/lib/supabase';
import type { ProviderDrama } from '@/lib/types';
import DramaForm from '../DramaForm';

export const metadata = {
  title: 'Tambah Drama | MediaCDN.net',
};

export default async function CreateDramaPage() {
  const [{ data: providers }, { data: imagekits }] = await Promise.all([
    supabase.from('provider_drama').select('*').order('name', { ascending: true }),
    supabase.from('imagekit_api').select('id, name').order('name', { ascending: true }),
  ]);

  return (
    <div>
      <PageHeader
        title="Tambah Drama"
        description="Buat entri drama baru."
        backHref="/aplikasi/drama"
      />
      <DramaForm
        providers={(providers ?? []) as ProviderDrama[]}
        imagekits={imagekits ?? []}
      />
    </div>
  );
}
