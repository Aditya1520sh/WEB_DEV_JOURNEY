'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { MapPin, Users, Building2, TrendingUp, Phone, Mail, Globe, ArrowLeft, Loader2, ExternalLink } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface CityInfo {
  name: string
  state?: string
  population?: string
  area?: string
  description: string
  coordinates: {
    lat: number
    lng: number
  }
  wikiUrl?: string
  imageUrl?: string
  country?: string
}

export default function AboutCityPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [cityInfo, setCityInfo] = useState<CityInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchCityInfo()
  }, [session, status, router])

  const fetchCityInfo = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      let userCity: string | undefined
      let coordinates = { lat: 19.0760, lng: 72.8777 } // Default to Mumbai

      // Priority 1: Session city
      if (session?.user?.city) {
        userCity = session.user.city
        console.log('📍 City from session:', userCity)
      }

      // Priority 2: localStorage
      if (!userCity) {
        const storedLocation = localStorage.getItem('userLocation')
        if (storedLocation) {
          try {
            const locationData = JSON.parse(storedLocation)
            console.log('📍 Stored location data:', locationData)
            
            userCity = locationData.city
            if (locationData.lat && locationData.lng) {
              coordinates = { lat: locationData.lat, lng: locationData.lng }
              console.log('📍 Using stored coordinates:', coordinates)
            }
          } catch (e) {
            console.error('Error parsing stored location:', e)
          }
        }
      }

      // Priority 3: GPS
      if (!userCity) {
        console.log('📍 Attempting GPS detection...')
        const gpsData = await getCurrentCityFromGPS()
        if (gpsData) {
          userCity = gpsData.city
          coordinates = gpsData.coordinates
          console.log('📍 GPS detected city:', userCity, coordinates)
        }
      }

      console.log('📍 Final city for API call:', userCity)
      console.log('📍 Final coordinates:', coordinates)

      // Fetch real city data from Wikipedia
      if (userCity) {
        const realCityData = await fetchCityDataFromWikipedia(userCity, coordinates)
        setCityInfo(realCityData)
      } else {
        // Fallback to Mumbai
        console.log('📍 No city found, using Mumbai fallback')
        const fallbackData = await fetchCityDataFromWikipedia('Mumbai', { lat: 19.0760, lng: 72.8777 })
        setCityInfo(fallbackData)
      }
    } catch (error) {
      console.error('Error fetching city info:', error)
      setError('Unable to load city information. Please check your internet connection.')
      // Emergency fallback
      setCityInfo({
        name: 'Mumbai',
        description: 'Unable to fetch detailed city information at this time.',
        coordinates: { lat: 19.0760, lng: 72.8777 }
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrentCityFromGPS = async (): Promise<{ city: string; coordinates: { lat: number; lng: number } } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null)
        return
      }

      const timeoutId = setTimeout(() => resolve(null), 10000)

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          clearTimeout(timeoutId)
          const { latitude, longitude } = position.coords

          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
            )
            
            if (response.ok) {
              const data = await response.json()
              const city = data.address?.city || 
                          data.address?.town || 
                          data.address?.village || 
                          data.address?.state_district
              
              if (city) {
                resolve({ 
                  city, 
                  coordinates: { lat: latitude, lng: longitude } 
                })
                return
              }
            }
            resolve(null)
          } catch (error) {
            console.error('Geocoding error:', error)
            resolve(null)
          }
        },
        (error) => {
          clearTimeout(timeoutId)
          console.error('Geolocation error:', error)
          resolve(null)
        },
        { timeout: 10000 }
      )
    })
  }

  const fetchCityDataFromWikipedia = async (cityName: string, coords: { lat: number; lng: number }): Promise<CityInfo> => {
    try {
      console.log('🌐 Fetching Wikipedia data for:', cityName)
      
      // Fetch Wikipedia summary
      const wikiResponse = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cityName)}`,
        {
          headers: {
            'Api-User-Agent': 'SeeClickFix/1.0 (Educational Project)'
          }
        }
      )
      
      console.log('🌐 Wikipedia response status:', wikiResponse.status)
      
      if (!wikiResponse.ok) {
        console.log('⚠️ Wikipedia API failed, trying fallback')
        throw new Error('Wikipedia API failed')
      }

      const wikiData = await wikiResponse.json()
      console.log('🌐 Wikipedia data received:', wikiData.title)
      
      // Extract basic information
      const description = wikiData.extract || `${cityName} is a city with rich history and culture.`
      const imageUrl = wikiData.thumbnail?.source || wikiData.originalimage?.source
      const wikiUrl = wikiData.content_urls?.desktop?.page

      // Try to get more details from Wikidata
      let population: string | undefined
      let area: string | undefined
      let state: string | undefined
      let country: string | undefined

      try {
        console.log('🌐 Fetching Wikidata for:', cityName)
        // Search for city in Wikidata
        const wikidataSearchResponse = await fetch(
          `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(cityName)}&language=en&format=json&origin=*`
        )
        const wikidataSearch = await wikidataSearchResponse.json()
        
        console.log('🌐 Wikidata search results:', wikidataSearch.search?.length || 0, 'items')
        
        if (wikidataSearch.search && wikidataSearch.search[0]) {
          const entityId = wikidataSearch.search[0].id
          console.log('🌐 Using entity ID:', entityId)
          
          // Fetch entity details
          const wikidataResponse = await fetch(
            `https://www.wikidata.org/wiki/Special:EntityData/${entityId}.json`
          )
          const wikidataEntity = await wikidataResponse.json()
          const entity = wikidataEntity.entities[entityId]
          const claims = entity?.claims

          // Extract population (P1082)
          if (claims?.P1082 && claims.P1082[0]?.mainsnak?.datavalue?.value?.amount) {
            const pop = parseInt(claims.P1082[0].mainsnak.datavalue.value.amount)
            if (pop > 1000000) {
              population = `${(pop / 1000000).toFixed(1)} Million`
            } else if (pop > 1000) {
              population = `${(pop / 1000).toFixed(0)}K`
            } else {
              population = pop.toString()
            }
            console.log('✅ Population:', population)
          }

          // Extract area (P2046)
          if (claims?.P2046 && claims.P2046[0]?.mainsnak?.datavalue?.value?.amount) {
            const areaValue = parseFloat(claims.P2046[0].mainsnak.datavalue.value.amount)
            area = `${areaValue.toFixed(2)} km²`
            console.log('✅ Area:', area)
          }

          // Extract state/province (P131)
          if (claims?.P131) {
            for (const claim of claims.P131) {
              if (claim?.mainsnak?.datavalue?.value?.id) {
                const stateId = claim.mainsnak.datavalue.value.id
                try {
                  const stateResponse = await fetch(
                    `https://www.wikidata.org/wiki/Special:EntityData/${stateId}.json`
                  )
                  const stateData = await stateResponse.json()
                  const stateEntity = stateData.entities[stateId]
                  
                  // Check if it's a state/province
                  if (stateEntity?.labels?.en?.value) {
                    state = stateEntity.labels.en.value
                    console.log('✅ State:', state)
                    break
                  }
                } catch (e) {
                  console.log('State fetch error:', e)
                }
              }
            }
          }

          // Extract country (P17)
          if (claims?.P17 && claims.P17[0]?.mainsnak?.datavalue?.value?.id) {
            const countryId = claims.P17[0].mainsnak.datavalue.value.id
            try {
              const countryResponse = await fetch(
                `https://www.wikidata.org/wiki/Special:EntityData/${countryId}.json`
              )
              const countryData = await countryResponse.json()
              country = countryData.entities[countryId]?.labels?.en?.value
              console.log('✅ Country:', country)
            } catch (e) {
              console.log('Country fetch error:', e)
            }
          }
        }
      } catch (error) {
        console.log('⚠️ Wikidata fetch failed:', error)
      }

      return {
        name: cityName,
        state,
        population,
        area,
        description,
        coordinates: coords,
        wikiUrl,
        imageUrl,
        country
      }
    } catch (error) {
      console.error('❌ Error fetching city data from Wikipedia:', error)
      // Return minimal info if API fails
      return {
        name: cityName,
        description: `${cityName} is a city. Unable to fetch detailed information at this time.`,
        coordinates: coords
      }
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading city information...</p>
      </div>
    )
  }

  if (error && !cityInfo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <Button onClick={() => fetchCityInfo()}>Retry</Button>
      </div>
    )
  }

  if (!cityInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900">
        <p className="text-gray-600 dark:text-gray-400">City information not available</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900">
      <Header />
      
      <main className="pt-24 pb-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="border-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
              About {cityInfo.name}
            </h1>
            {(cityInfo.state || cityInfo.country) && (
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {cityInfo.state && cityInfo.country 
                  ? `${cityInfo.state}, ${cityInfo.country}`
                  : cityInfo.state || cityInfo.country}
              </p>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              📍 Data fetched from Wikipedia & OpenStreetMap
            </p>
          </motion.div>

          {/* City Image */}
          {cityInfo.imageUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <Card className="backdrop-blur-xl bg-white/50 dark:bg-black/30 border border-white/20 dark:border-white/10 overflow-hidden">
                <img 
                  src={cityInfo.imageUrl} 
                  alt={cityInfo.name}
                  className="w-full h-64 object-cover"
                />
              </Card>
            </motion.div>
          )}

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card className="backdrop-blur-xl bg-white/50 dark:bg-black/30 border border-white/20 dark:border-white/10 overflow-hidden">
              <div className="h-96 relative">
                <iframe
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${cityInfo.coordinates.lng-0.1},${cityInfo.coordinates.lat-0.1},${cityInfo.coordinates.lng+0.1},${cityInfo.coordinates.lat+0.1}&layer=mapnik&marker=${cityInfo.coordinates.lat},${cityInfo.coordinates.lng}`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                ></iframe>
              </div>
            </Card>
          </motion.div>

          {/* Quick Stats */}
          {(cityInfo.population || cityInfo.area) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
            >
              {cityInfo.population && (
                <Card className="backdrop-blur-xl bg-white/50 dark:bg-black/30 border border-white/20 dark:border-white/10 p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                      <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Population</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-white">{cityInfo.population}</p>
                    </div>
                  </div>
                </Card>
              )}

              {cityInfo.area && (
                <Card className="backdrop-blur-xl bg-white/50 dark:bg-black/30 border border-white/20 dark:border-white/10 p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                      <MapPin className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Area</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-white">{cityInfo.area}</p>
                    </div>
                  </div>
                </Card>
              )}
            </motion.div>
          )}

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <Card className="backdrop-blur-xl bg-white/50 dark:bg-black/30 border border-white/20 dark:border-white/10 p-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">About the City</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                {cityInfo.description}
              </p>
              {cityInfo.wikiUrl && (
                <a
                  href={cityInfo.wikiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Read more on Wikipedia
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </Card>
          </motion.div>

          {/* Coordinates Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="backdrop-blur-xl bg-white/50 dark:bg-black/30 border border-white/20 dark:border-white/10 p-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Location Coordinates</h2>
              <div className="flex items-center gap-4 text-gray-700 dark:text-gray-300">
                <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span>
                  Latitude: {cityInfo.coordinates.lat.toFixed(4)}°, 
                  Longitude: {cityInfo.coordinates.lng.toFixed(4)}°
                </span>
              </div>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
