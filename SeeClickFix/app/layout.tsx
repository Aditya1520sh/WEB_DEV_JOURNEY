import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'
import { AIAssistant } from '@/components/ai/AIAssistant'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SeeClickFix - Report Civic Issues',
  description: 'Next-gen civic issue reporting platform for citizens and authorities',
  keywords: ['civic', 'issues', 'reporting', 'government', 'community'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900">
            {children}
            <AIAssistant />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                },
              }}
            />
          </div>
        </Providers>
      </body>
    </html>
  )
}