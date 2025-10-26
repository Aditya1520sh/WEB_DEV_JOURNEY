'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Moon, Sun, User, Settings, LogOut, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/')
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border-b border-white/20 dark:border-white/10"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center cursor-pointer"
            onClick={() => router.push('/')}
          >
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SeeClickFix
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {session ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => router.push('/dashboard')}
                  className="hover:bg-white/20 dark:hover:bg-black/20"
                >
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => router.push('/reports/create')}
                  className="hover:bg-white/20 dark:hover:bg-black/20"
                >
                  Report Issue
                </Button>
                {session.user.role !== 'admin' && (
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/about-city')}
                    className="hover:bg-white/20 dark:hover:bg-black/20"
                  >
                    About City
                  </Button>
                )}
                {session.user.role === 'admin' && (
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/admin')}
                    className="hover:bg-white/20 dark:hover:bg-black/20 text-orange-600 dark:text-orange-400"
                  >
                    Admin Panel
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => router.push('/auth/signin')}
                  className="hover:bg-white/20 dark:hover:bg-black/20"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => router.push('/auth/signup')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg px-4 py-2"
                >
                  Sign Up
                </Button>
              </>
            )}

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hover:bg-white/20 dark:hover:bg-black/20"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>

            {/* User Menu */}
            {session && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push('/profile')}
                  className="hover:bg-white/20 dark:hover:bg-black/20"
                >
                  <User className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  className="hover:bg-white/20 dark:hover:bg-black/20 text-red-500 hover:text-red-400"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="hover:bg-white/20 dark:hover:bg-black/20"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-white/20 dark:border-white/10"
          >
            <div className="flex flex-col space-y-2">
              {session ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      router.push('/dashboard')
                      setIsMobileMenuOpen(false)
                    }}
                    className="justify-start hover:bg-white/20 dark:hover:bg-black/20"
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      router.push('/reports/create')
                      setIsMobileMenuOpen(false)
                    }}
                    className="justify-start hover:bg-white/20 dark:hover:bg-black/20"
                  >
                    Report Issue
                  </Button>
                  {session.user.role !== 'admin' && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        router.push('/about-city')
                        setIsMobileMenuOpen(false)
                      }}
                      className="justify-start hover:bg-white/20 dark:hover:bg-black/20"
                    >
                      About City
                    </Button>
                  )}
                  {session.user.role === 'admin' && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        router.push('/admin')
                        setIsMobileMenuOpen(false)
                      }}
                      className="justify-start hover:bg-white/20 dark:hover:bg-black/20 text-orange-600 dark:text-orange-400"
                    >
                      Admin Panel
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    onClick={() => {
                      router.push('/profile')
                      setIsMobileMenuOpen(false)
                    }}
                    className="justify-start hover:bg-white/20 dark:hover:bg-black/20"
                  >
                    <User className="h-5 w-5 mr-2" />
                    Profile
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      handleSignOut()
                      setIsMobileMenuOpen(false)
                    }}
                    className="justify-start hover:bg-white/20 dark:hover:bg-black/20 text-red-500"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      router.push('/auth/signin')
                      setIsMobileMenuOpen(false)
                    }}
                    className="justify-start hover:bg-white/20 dark:hover:bg-black/20"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => {
                      router.push('/auth/signup')
                      setIsMobileMenuOpen(false)
                    }}
                    className="justify-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    Sign Up
                  </Button>
                </>
              )}
              
              <Button
                variant="ghost"
                onClick={toggleTheme}
                className="justify-start hover:bg-white/20 dark:hover:bg-black/20"
              >
                {theme === 'light' ? (
                  <>
                    <Moon className="h-5 w-5 mr-2" />
                    Dark Mode
                  </>
                ) : (
                  <>
                    <Sun className="h-5 w-5 mr-2" />
                    Light Mode
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  )
}