import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // If no token and not on login page, redirect to login
    if (!token && pathname !== '/login') {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // If logged in and on login page, redirect to appropriate dashboard
    if (token && pathname === '/login') {
      if (token.role === 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/super-admin/dashboard', req.url))
      } else if (token.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url))
      } else if (token.role === 'STAFF') {
        return NextResponse.redirect(new URL('/staff/dashboard', req.url))
      }
    }

    // Role-based access control
    if (pathname.startsWith('/super-admin') && token?.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    if (pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    if (pathname.startsWith('/staff') && token?.role !== 'STAFF') {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: () => true, // Let the middleware function handle authorization
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     * - api routes (except auth)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api(?!/auth)).*)',
  ],
}
