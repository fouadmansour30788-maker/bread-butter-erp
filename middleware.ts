import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { hashPassword, ADMIN_AUTH_COOKIE } from '@/lib/adminAuth'

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/admin/login') {
    return NextResponse.next()
  }

  const cookie = request.cookies.get(ADMIN_AUTH_COOKIE)?.value
  const expected = await hashPassword(process.env.ADMIN_PASSWORD ?? '')

  if (!cookie || cookie !== expected) {
    const loginUrl = new URL('/admin/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
