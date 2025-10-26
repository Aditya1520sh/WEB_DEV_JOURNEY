import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import { findUserByEmail, findUserByUsername } from '@/lib/mockData'

export const authOptions: NextAuthOptions = {
  providers: [
    // Only add Google provider if credentials are available
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })]
      : []),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Try database first if available
        const hasDatabase = process.env.MONGODB_URI
        
        if (hasDatabase) {
          try {
            await dbConnect()
            
            const user = await User.findOne({
              $or: [
                { email: credentials.email },
                { username: credentials.email }
              ]
            })

            if (user && user.password) {
              const isPasswordValid = await bcrypt.compare(
                credentials.password,
                user.password
              )

              if (isPasswordValid) {
                return {
                  id: user._id.toString(),
                  email: user.email,
                  name: user.name,
                  username: user.username,
                  role: user.role,
                  city: user.city,
                  image: user.image,
                }
              }
            }
          } catch (dbError) {
            console.log('Database error, trying mock data:', dbError)
          }
        }

        // Fallback to mock data
        try {
          const userByEmail = findUserByEmail(credentials.email)
          const userByUsername = findUserByUsername(credentials.email)
          const user = userByEmail || userByUsername

          if (!user || !user.password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user._id,
            email: user.email,
            name: user.name,
            username: user.username,
            role: user.role,
            city: user.city,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Check if MONGODB_URI exists
          if (!process.env.MONGODB_URI) {
            console.error('No MONGODB_URI found for Google sign-in')
            return false
          }

          await dbConnect()
          
          let existingUser = await User.findOne({ email: user.email })
          
          if (!existingUser) {
            // Create new user for Google OAuth
            existingUser = await User.create({
              name: user.name || 'Google User',
              email: user.email,
              username: (user.email?.split('@')[0] || 'user') + Math.random().toString(36).substr(2, 4),
              city: 'Not specified',
              address: 'Not specified',
              role: 'user',
              image: user.image,
              provider: 'google',
              providerId: account.providerAccountId,
            })
          }
          
          return true
        } catch (error) {
          console.error('Google sign-in error:', error)
          return false
        }
      }
      
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        // For Google OAuth, fetch the database user to get MongoDB _id
        if (account?.provider === 'google' && process.env.MONGODB_URI) {
          try {
            await dbConnect()
            const dbUser = await User.findOne({ email: user.email })
            if (dbUser) {
              token.id = dbUser._id.toString()
              token.role = dbUser.role
              token.username = dbUser.username
              token.city = dbUser.city
            }
          } catch (error) {
            console.error('Error fetching Google user from DB:', error)
          }
        } else {
          // For credentials login
          token.id = user.id
          token.role = user.role
          token.username = user.username
          token.city = user.city
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = (token.id as string) || token.sub!
        session.user.role = token.role as string
        session.user.username = token.username as string
        session.user.city = token.city as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}