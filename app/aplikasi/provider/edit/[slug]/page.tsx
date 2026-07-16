import { notFound } from 'next/navigation';
import PageHeader from '../../../components/PageHeader';
import { supabase } from '@/lib/supabase';
import type { ProviderDrama } from '@/lib/types';
import ProviderForm from '../../ProviderForm';

export const metadata = {
  title: 'Edit Provider | MediaCDN.net',
};

export default async function EditProviderPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data } = await supabase
    .from('provider_drama')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!data) notFound();

  return (
    <div>
      <PageHeader
        title="Edit Provider"
        description={`Mengubah provider: ${data.name}`}
        backHref="/aplikasi/provider"
      />
      <ProviderForm provider={data as ProviderDrama} />
    </div>
  );
}
