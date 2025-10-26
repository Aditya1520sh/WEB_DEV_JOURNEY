'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Camera, MapPin, AlertCircle, Loader2, Send, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/Header'
import toast from 'react-hot-toast'

interface FormData {
  problemType: string
  description: string
  address: string
  anonymous: boolean
  imageURL?: string
}

const problemTypes = [
  { value: 'pothole', label: 'Pothole' },
  { value: 'water-leak', label: 'Water Leak' },
  { value: 'garbage-collection', label: 'Garbage Collection' },
  { value: 'street-light', label: 'Street Light' },
  { value: 'traffic-signal', label: 'Traffic Signal' },
  { value: 'road-damage', label: 'Road Damage' },
  { value: 'drainage', label: 'Drainage Issue' },
  { value: 'noise-pollution', label: 'Noise Pollution' },
  { value: 'air-pollution', label: 'Air Pollution' },
  { value: 'illegal-construction', label: 'Illegal Construction' },
  { value: 'public-transport', label: 'Public Transport' },
  { value: 'park-maintenance', label: 'Park Maintenance' },
  { value: 'other', label: 'Other' }
]

export default function CreateReport() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    problemType: '',
    description: '',
    address: '',
    anonymous: false
  })
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

  // Get user's current location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        (error) => {
          console.log('Location access denied or unavailable:', error)
        }
      )
    }
  }, [])

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.problemType) {
      newErrors.problemType = 'Please select a problem type'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size must be less than 5MB')
        return
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        return
      }

      setImageFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null

    const formData = new FormData()
    formData.append('file', imageFile)

    try {
      // Use our backend API endpoint for upload
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success('Image uploaded successfully!')
        return data.url
      } else {
        throw new Error(data.error || 'Failed to upload image')
      }
    } catch (error: any) {
      console.error('Image upload error:', error)
      toast.error(error.message || 'Image upload failed, but report will be submitted without image')
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    // Check if user is authenticated for non-anonymous reports
    if (!formData.anonymous && !session) {
      toast.error('Please sign in to create a report')
      router.push('/auth/signin')
      return
    }

    setIsLoading(true)

    try {
      // Upload image if provided
      let imageURL = null
      if (imageFile) {
        imageURL = await uploadImage()
      }

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          description: formData.description.trim(),
          address: formData.address.trim(),
          coordinates,
          imageURL
        })
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to create report')
        setIsLoading(false)
        return
      }

      toast.success('Report created successfully!')
      
      // Redirect based on authentication status
      if (session) {
        router.push('/dashboard')
      } else {
        router.push('/')
      }

    } catch (error) {
      console.error('Create report error:', error)
      toast.error('Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-20 pb-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Report Civic Issue
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Help improve your community by reporting local problems and issues.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-card border-0 bg-white/10 dark:bg-black/10">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
                  Issue Details
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Provide detailed information about the civic issue you're reporting.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Logged in user info */}
                  {session && (
                    <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                      <p className="text-sm text-green-800 dark:text-green-300">
                        ✓ Logged in as <strong>{session.user?.name}</strong>
                      </p>
                    </div>
                  )}

                  {/* Anonymous Toggle - Available for all users */}
                  <div className="flex items-center justify-between p-4 bg-white/20 dark:bg-black/20 rounded-xl border border-white/20 dark:border-white/10">
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-white">
                        Anonymous Report
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {session 
                          ? 'Hide your personal information from this report' 
                          : 'Report without providing your personal information'
                        }
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleInputChange('anonymous', !formData.anonymous)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.anonymous ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.anonymous ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Problem Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Problem Type *
                    </label>
                    <select
                      value={formData.problemType}
                      onChange={(e) => handleInputChange('problemType', e.target.value)}
                      className={`w-full px-4 py-3 bg-white/20 dark:bg-black/20 border ${
                        errors.problemType ? 'border-red-500' : 'border-white/30 dark:border-white/20'
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white`}
                      disabled={isLoading}
                    >
                      <option value="">Select a problem type</option>
                      {problemTypes.map((type) => (
                        <option key={type.value} value={type.value} className="bg-white dark:bg-gray-800">
                          {type.label}
                        </option>
                      ))}
                    </select>
                    {errors.problemType && (
                      <p className="mt-1 text-sm text-red-500 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.problemType}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      maxLength={1000}
                      className={`w-full px-4 py-3 bg-white/20 dark:bg-black/20 border ${
                        errors.description ? 'border-red-500' : 'border-white/30 dark:border-white/20'
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none`}
                      placeholder="Provide a detailed description of the issue, including when you noticed it and any safety concerns..."
                      disabled={isLoading}
                    />
                    <div className="flex justify-between items-center mt-1">
                      {errors.description ? (
                        <p className="text-sm text-red-500 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.description}
                        </p>
                      ) : (
                        <span></span>
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formData.description.length}/1000
                      </span>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Address/Location *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <textarea
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        rows={2}
                        className={`w-full pl-10 pr-4 py-3 bg-white/20 dark:bg-black/20 border ${
                          errors.address ? 'border-red-500' : 'border-white/30 dark:border-white/20'
                        } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none`}
                        placeholder="Enter the specific address or location where the issue is located..."
                        disabled={isLoading}
                      />
                    </div>
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-500 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.address}
                      </p>
                    )}
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Add Photo (Optional)
                    </label>
                    <div className="border-2 border-dashed border-white/30 dark:border-white/20 rounded-xl p-6 text-center">
                      {imagePreview ? (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="max-w-full h-48 object-cover rounded-lg mx-auto"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setImageFile(null)
                              setImagePreview('')
                            }}
                            className="mt-2"
                          >
                            Remove Image
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 dark:text-gray-300 mb-2">
                            Add a photo to help authorities understand the issue better
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            id="image-upload"
                            disabled={isLoading}
                          />
                          <label
                            htmlFor="image-upload"
                            className="cursor-pointer bg-white/20 dark:bg-black/20 hover:bg-white/30 dark:hover:bg-black/30 px-4 py-2 rounded-lg border border-white/20 dark:border-white/10 transition-colors"
                          >
                            Choose Image
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Maximum file size: 5MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Submitting Report...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Send className="mr-2 h-5 w-5" />
                          Submit Report
                        </div>
                      )}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={isLoading}
                      className="border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 px-6 py-3 rounded-xl font-semibold"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}