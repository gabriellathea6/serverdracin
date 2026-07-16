'use server';

import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

type ActionState = { error: string };

export async function registerAction(prevState: ActionState, formData: FormData) {
  const fullName = formData.get('fullName') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!fullName || !email || !password) {
    return { error: 'Semua kolom wajib diisi.' };
  }

  // Cek email apakah sudah ada
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (existingUser) {
    return { error: 'Email sudah terdaftar.' };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert user
  const { data, error } = await supabase
    .from('users')
    .insert([{ full_name: fullName, email, password: hashedPassword }])
    .select()
    .single();

  if (error || !data) {
    return { error: 'Gagal mendaftar, coba lagi.' };
  }

  // Set cookie session
  const cookieStore = await cookies();
  cookieStore.set('session', data.id.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 minggu
    path: '/',
  });

  redirect('/aplikasi');
}

export async function loginAction(prevState: ActionState, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email dan password wajib diisi.' };
  }

  // Cari user berdasarkan email
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) {
    return { error: 'Email atau password salah.' };
  }

  // Verifikasi password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return { error: 'Email atau password salah.' };
  }

  // Set cookie session
  const cookieStore = await cookies();
  cookieStore.set('session', user.id.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  redirect('/aplikasi');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  redirect('/auth/login');
}
