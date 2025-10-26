'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { MapPin, Thermometer, Wind, Cloud, Users, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LocationPermission } from '@/components/LocationPermission'
import { Header } from '@/components/layout/Header'

interface WeatherData {
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  aqi: number
}

interface Stats {
  totalReports: number
  resolvedReports: number
  pendingReports: number
  avgResolutionTime: string
}

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [location, setLocation] = useState<{ city: string; address: string; lat?: number; lng?: number } | null>(null)
  const [hasLocationPermission, setHasLocationPermission] = useState(false)
  const [isCheckingPermission, setIsCheckingPermission] = useState(true)

  useEffect(() => {
    // Check if location was previously stored
    const storedLocation = localStorage.getItem('userLocation')
    if (storedLocation) {
      try {
        const parsedLocation = JSON.parse(storedLocation)
        setLocation(parsedLocation)
        setHasLocationPermission(true)
      } catch (error) {
        console.error('Error parsing stored location:', error)
      }
    }
    setIsCheckingPermission(false)
  }, [])

  useEffect(() => {
    if (status === 'loading' || isCheckingPermission) return
    
    // Fetch mock weather data
    setWeather({
      temperature: 24,
      condition: 'Partly Cloudy',
      humidity: 65,
      windSpeed: 12,
      aqi: 85
    })

    // Fetch mock stats
    setStats({
      totalReports: 1247,
      resolvedReports: 892,
      pendingReports: 355,
      avgResolutionTime: '4.2 days'
    })
  }, [session, status, hasLocationPermission, location, isCheckingPermission])

  const handleLocationSuccess = (locationData: { city: string; address: string; lat?: number; lng?: number }) => {
    setLocation(locationData)
    setHasLocationPermission(true)
    // Store location in localStorage
    localStorage.setItem('userLocation', JSON.stringify(locationData))
  }

  const handleGetStarted = () => {
    if (session) {
      router.push('/dashboard')
    } else {
      router.push('/auth/signin')
    }
  }

  // Show loading while checking permission
  if (isCheckingPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  // Only show location permission if not previously granted
  if (!hasLocationPermission && !location) {
    return <LocationPermission onSuccess={handleLocationSuccess} />
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                  SeeClickFix
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                  Report civic issues in your community and track their resolution in real-time. 
                  Join thousands of citizens making their cities better, one report at a time.
                </p>
              </div>

              {location && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <MapPin className="h-5 w-5 text-blue-500" />
                  <span>{location.city}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={handleGetStarted}
                >
                  Get Started
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-3 text-lg font-semibold rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                  onClick={() => router.push('/reports')}
                >
                  View Reports
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="glass-card p-8 backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl">
                <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
                  Live City Stats
                </h3>
                
                {weather && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-white/20 dark:bg-black/20 rounded-xl">
                        <Thermometer className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">{weather.temperature}°C</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{weather.condition}</p>
                      </div>
                      
                      <div className="text-center p-4 bg-white/20 dark:bg-black/20 rounded-xl">
                        <Wind className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">{weather.windSpeed} km/h</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Wind Speed</p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-white/20 dark:bg-black/20 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600 dark:text-gray-300">Air Quality</span>
                        <Cloud className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-green-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${weather.aqi}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">AQI: {weather.aqi} - Good</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {stats && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="py-16 bg-white/50 dark:bg-black/20 backdrop-blur-sm"
        >
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-white">
              Community Impact
            </h2>
            
            <div className="grid md:grid-cols-4 gap-8">
              <Card className="glass-card border-0 bg-white/10 dark:bg-black/10">
                <CardHeader className="text-center">
                  <Users className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                  <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
                    {stats.totalReports.toLocaleString()}
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    Total Reports
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="glass-card border-0 bg-white/10 dark:bg-black/10">
                <CardHeader className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
                    {stats.resolvedReports.toLocaleString()}
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    Resolved Issues
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="glass-card border-0 bg-white/10 dark:bg-black/10">
                <CardHeader className="text-center">
                  <Clock className="h-12 w-12 text-orange-500 mx-auto mb-2" />
                  <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
                    {stats.pendingReports.toLocaleString()}
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    In Progress
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="glass-card border-0 bg-white/10 dark:bg-black/10">
                <CardHeader className="text-center">
                  <AlertTriangle className="h-12 w-12 text-purple-500 mx-auto mb-2" />
                  <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
                    {stats.avgResolutionTime}
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    Avg. Resolution
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </motion.section>
      )}

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="py-20"
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6 text-gray-800 dark:text-white">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Join our community of active citizens working together to improve their neighborhoods. 
            Your voice matters, and every report helps build a better city.
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-4 text-xl font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={handleGetStarted}
          >
            Start Reporting Issues
          </Button>
        </div>
      </motion.section>
    </div>
  )
}