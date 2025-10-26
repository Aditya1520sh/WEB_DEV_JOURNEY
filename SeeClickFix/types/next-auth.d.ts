import 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    role: string
    username: string
    city: string
  }

  interface Session {
    user: {
      id: string
      name: string
      email: string
      image?: string
      role: string
      username: string
      city: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    username: string
    city: string
  }
}