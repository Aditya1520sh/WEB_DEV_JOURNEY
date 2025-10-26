'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, Mail, MapPin, Calendar, Edit2, Save, X, Loader2 } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    city: '',
  })

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || '',
        city: session.user.city || '',
      })
    }
  }, [session])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!session) {
    router.push('/auth/signin')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to update profile')
        setIsLoading(false)
        return
      }

      // Update session
      await update({
        ...session,
        user: {
          ...session.user,
          name: formData.name,
          city: formData.city,
        }
      })

      toast.success('Profile updated successfully!')
      setIsEditing(false)
    } catch (error) {
      console.error('Update profile error:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: session.user.name || '',
      city: session.user.city || '',
    })
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-24 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="backdrop-blur-xl bg-white/50 dark:bg-black/30 border border-white/20 dark:border-white/10">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  My Profile
                </h1>
                {!isEditing && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <User className="inline h-4 w-4 mr-2" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-white/30 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    />
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <User className="inline h-4 w-4 mr-2" />
                      Username
                    </label>
                    <input
                      type="text"
                      value={session.user.username || 'N/A'}
                      disabled
                      className="w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-white/30 dark:border-white/20 rounded-xl text-gray-800 dark:text-white opacity-60 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Username cannot be changed</p>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Mail className="inline h-4 w-4 mr-2" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={session.user.email || 'N/A'}
                      disabled
                      className="w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-white/30 dark:border-white/20 rounded-xl text-gray-800 dark:text-white opacity-60 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <MapPin className="inline h-4 w-4 mr-2" />
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-white/30 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    />
                  </div>

                  {/* Role Badge */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Role
                    </label>
                    <div className="px-4 py-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                        session.user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      }`}>
                        {session.user.role === 'admin' ? '👑 Admin' : '👤 User'}
                      </span>
                    </div>
                  </div>

                  {/* Join Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Calendar className="inline h-4 w-4 mr-2" />
                      Member Since
                    </label>
                    <div className="px-4 py-3 text-gray-800 dark:text-white">
                      {new Date().toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCancel}
                      disabled={isLoading}
                      variant="outline"
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </form>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
