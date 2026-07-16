import PageHeader from '../../components/PageHeader';
import ImagekitForm from '../ImagekitForm';

export const metadata = {
  title: 'Tambah ImageKit API | MediaCDN.net',
};

export default function CreateImagekitApiPage() {
  return (
    <div>
      <PageHeader
        title="Tambah ImageKit API"
        description="Tambahkan kredensial ImageKit baru."
        backHref="/aplikasi/imgakit-api"
      />
      <ImagekitForm />
    </div>
  );
}
