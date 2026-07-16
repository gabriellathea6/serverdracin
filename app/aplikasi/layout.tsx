import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AppShell from './components/AppShell';

export default async function AplikasiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');

  if (!session?.value) {
    redirect('/auth/login');
  }

  const { data: user } = await supabase
    .from('users')
    .select('full_name, email')
    .eq('id', session.value)
    .single();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <AppShell userName={user.full_name} userEmail={user.email}>
      {children}
    </AppShell>
  );
}
