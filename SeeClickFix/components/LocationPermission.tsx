'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LocationPermissionProps {
  onSuccess: (location: { city: string; address: string; lat?: number; lng?: number }) => void
}

export function LocationPermission({ onSuccess }: LocationPermissionProps) {
  const [step, setStep] = useState<'permission' | 'manual' | 'loading'>('permission')
  const [manualData, setManualData] = useState({ city: '', state: '', address: '' })
  const [error, setError] = useState('')

  const requestLocation = () => {
    setStep('loading')
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser')
      setStep('manual')
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          
          // Use OpenStreetMap's Nominatim API for reverse geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'SeeClickFix-App'
              }
            }
          )
          
          if (response.ok) {
            const data = await response.json()
            
            const city = data.address?.city || 
                        data.address?.town || 
                        data.address?.village || 
                        data.address?.municipality ||
                        data.address?.county ||
                        data.address?.state_district ||
                        'Your City'
            
            const location = {
              city: city,
              address: data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              lat: latitude,
              lng: longitude
            }
            
            onSuccess(location)
            return
          }
          
          // Fallback if API fails
          const location = {
            city: `Location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`,
            address: `Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            lat: latitude,
            lng: longitude
          }
          
          onSuccess(location)
        } catch (error) {
          console.error('Geocoding error:', error)
          setError('Failed to get your location details')
          setStep('manual')
        }
      },
      (error) => {
        console.error('Geolocation error:', error)
        setError('Location access denied or unavailable')
        setStep('manual')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!manualData.city || !manualData.state || !manualData.address) {
      setError('Please fill in all fields')
      return
    }

    const location = {
      city: `${manualData.city}, ${manualData.state}`,
      address: manualData.address
    }
    
    onSuccess(location)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900 p-4">
      <AnimatePresence mode="wait">
        {step === 'permission' && (
          <motion.div
            key="permission"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="glass-card max-w-md w-full p-8 text-center backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl"
          >
            <div className="mb-6">
              <MapPin className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                Location Required
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                SeeClickFix needs your location to show relevant civic issues and connect you with local authorities.
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={requestLocation}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg font-semibold rounded-xl"
              >
                Allow Location Access
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setStep('manual')}
                className="w-full border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 py-3 text-lg font-semibold rounded-xl"
              >
                Enter Manually
              </Button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
              We use your location only to provide relevant local services. Your privacy is protected.
            </p>
          </motion.div>
        )}

        {step === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="glass-card max-w-md w-full p-8 text-center backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl"
          >
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Getting Your Location
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Please wait while we determine your location...
            </p>
          </motion.div>
        )}

        {step === 'manual' && (
          <motion.div
            key="manual"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="glass-card max-w-md w-full p-8 backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Enter Location
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setStep('permission')}
                className="hover:bg-white/20 dark:hover:bg-black/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={manualData.city}
                  onChange={(e) => setManualData({ ...manualData, city: e.target.value })}
                  className="w-full px-4 py-3 bg-white/20 dark:bg-black/20 border border-white/30 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Enter your city"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  value={manualData.state}
                  onChange={(e) => setManualData({ ...manualData, state: e.target.value })}
                  className="w-full px-4 py-3 bg-white/20 dark:bg-black/20 border border-white/30 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Enter your state"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address *
                </label>
                <textarea
                  value={manualData.address}
                  onChange={(e) => setManualData({ ...manualData, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/20 dark:bg-black/20 border border-white/30 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                  placeholder="Enter your full address"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg font-semibold rounded-xl"
              >
                Continue
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}