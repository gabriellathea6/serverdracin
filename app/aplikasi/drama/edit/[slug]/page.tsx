import { notFound } from 'next/navigation';
import PageHeader from '../../../components/PageHeader';
import { supabase } from '@/lib/supabase';
import type { Drama, ProviderDrama } from '@/lib/types';
import DramaForm from '../../DramaForm';

export const metadata = {
  title: 'Edit Drama | MediaCDN.net',
};

export default async function EditDramaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [{ data: drama }, { data: providers }, { data: imagekits }] = await Promise.all([
    supabase.from('drama').select('*').eq('slug', slug).single(),
    supabase.from('provider_drama').select('*').order('name', { ascending: true }),
    supabase.from('imagekit_api').select('id, name').order('name', { ascending: true }),
  ]);

  if (!drama) notFound();

  return (
    <div>
      <PageHeader
        title="Edit Drama"
        description={`Mengubah drama: ${drama.title}`}
        backHref="/aplikasi/drama"
      />
      <DramaForm
        drama={drama as Drama}
        providers={(providers ?? []) as ProviderDrama[]}
        imagekits={imagekits ?? []}
      />
    </div>
  );
}
