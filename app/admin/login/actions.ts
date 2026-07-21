'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { hashPassword, ADMIN_AUTH_COOKIE } from '@/lib/adminAuth'

export type LoginState = { error?: string }

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get('password') ?? '')

  if (!password || !process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return { error: 'Incorrect password.' }
  }

  const hash = await hashPassword(password)
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_AUTH_COOKIE, hash, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  redirect('/admin')
}
