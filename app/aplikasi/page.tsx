import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { logoutAction } from '@/app/actions/auth';

export default async function AplikasiPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');

  if (!session?.value) {
    redirect('/auth/login');
  }

  // Ambil data user
  const { data: user } = await supabase
    .from('users')
    .select('full_name, email')
    .eq('id', session.value)
    .single();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-indigo-600">Aplikasi ServerDracin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Halo, {user.full_name}</span>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="bg-red-50 text-red-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-100 transition-colors"
                >
                  Keluar
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex flex-col items-center justify-center bg-white p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Selamat Datang di Dashboard!</h2>
            <p className="text-gray-600 text-center max-w-lg">
              Anda berhasil masuk sebagai <span className="font-semibold">{user.email}</span>. Ini adalah rute <code className="bg-gray-100 px-2 py-1 rounded">/aplikasi</code> yang dilindungi.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
