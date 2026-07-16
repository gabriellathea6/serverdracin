import { notFound } from 'next/navigation';
import PageHeader from '../../../components/PageHeader';
import { supabase } from '@/lib/supabase';
import type { ImagekitApi } from '@/lib/types';
import ImagekitForm from '../../ImagekitForm';

export const metadata = {
  title: 'Edit ImageKit API | MediaCDN.net',
};

export default async function EditImagekitApiPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data } = await supabase
    .from('imagekit_api')
    .select('*')
    .eq('id', id)
    .single();

  if (!data) notFound();

  return (
    <div>
      <PageHeader
        title="Edit ImageKit API"
        description={`Mengubah: ${data.name}`}
        backHref="/aplikasi/imgakit-api"
      />
      <ImagekitForm item={data as ImagekitApi} />
    </div>
  );
}
