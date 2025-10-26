import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Check if user is trying to access admin routes
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return token?.role === 'admin'
        }
        
        // For other protected routes, just check if user is authenticated
        if (req.nextUrl.pathname.startsWith('/dashboard') ||
            req.nextUrl.pathname.startsWith('/profile') ||
            req.nextUrl.pathname.startsWith('/reports')) {
          return !!token
        }
        
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/admin/:path*',
    '/reports/:path*'
  ]
}