import { getNextEpisodeNumber } from '@/app/actions/episode';
import PageHeader from '../../components/PageHeader';
import { supabase } from '@/lib/supabase';
import type { Drama } from '@/lib/types';
import EpisodeForm from '../EpisodeForm';

export const metadata = {
  title: 'Tambah Episode | MediaCDN.net',
};

export default async function CreateEpisodePage({
  searchParams,
}: {
  searchParams: Promise<{ dramaId?: string }>;
}) {
  const { dramaId } = await searchParams;
  const parsedDramaId = dramaId ? Number(dramaId) : undefined;
  const defaultDramaId =
    parsedDramaId && !Number.isNaN(parsedDramaId) ? parsedDramaId : undefined;

  const { data: dramasData } = await supabase
    .from('drama')
    .select('*')
    .order('title', { ascending: true });

  const dramas = (dramasData ?? []) as Drama[];
  const selected = defaultDramaId
    ? dramas.find((d) => d.id === defaultDramaId)
    : undefined;

  const initialEpisodeNumber = defaultDramaId
    ? await getNextEpisodeNumber(defaultDramaId)
    : 1;

  return (
    <div>
      <PageHeader
        title="Tambah Episode"
        description={
          selected
            ? `Tambah episode untuk drama: ${selected.title}`
            : 'Tambah episode untuk drama yang dipilih.'
        }
        backHref={selected ? '/aplikasi/drama' : '/aplikasi/episode'}
      />
      <EpisodeForm
        dramas={dramas}
        defaultDramaId={defaultDramaId}
        initialEpisodeNumber={initialEpisodeNumber}
        cancelHref={selected ? '/aplikasi/drama' : '/aplikasi/episode'}
        returnTo={selected ? '/aplikasi/drama' : '/aplikasi/episode'}
      />
    </div>
  );
}
