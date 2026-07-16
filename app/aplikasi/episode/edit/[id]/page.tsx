import { notFound } from 'next/navigation';
import PageHeader from '../../../components/PageHeader';
import { supabase } from '@/lib/supabase';
import type { Drama, Episode } from '@/lib/types';
import EpisodeForm from '../../EpisodeForm';

export const metadata = {
  title: 'Edit Episode | MediaCDN.net',
};

export default async function EditEpisodePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [{ data: episode }, { data: dramas }] = await Promise.all([
    supabase.from('episode').select('*').eq('id', id).single(),
    supabase.from('drama').select('*').order('title', { ascending: true }),
  ]);

  if (!episode) notFound();

  return (
    <div>
      <PageHeader
        title="Edit Episode"
        description={`Mengubah episode #${episode.episode}`}
        backHref="/aplikasi/episode"
      />
      <EpisodeForm
        episode={episode as Episode}
        dramas={(dramas ?? []) as Drama[]}
      />
    </div>
  );
}
