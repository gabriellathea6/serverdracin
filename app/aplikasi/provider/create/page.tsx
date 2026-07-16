import PageHeader from '../../components/PageHeader';
import ProviderForm from '../ProviderForm';

export const metadata = {
  title: 'Tambah Provider | MediaCDN.net',
};

export default function CreateProviderPage() {
  return (
    <div>
      <PageHeader
        title="Tambah Provider"
        description="Buat provider drama baru."
        backHref="/aplikasi/provider"
      />
      <ProviderForm />
    </div>
  );
}
