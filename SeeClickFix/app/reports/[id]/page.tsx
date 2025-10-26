'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { 
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  Tag,
  DollarSign,
  Clock,
  Building,
  FileText,
  Edit3,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/Header'
import toast from 'react-hot-toast'

interface Report {
  _id: string
  reportId: string
  problemType: string
  description: string
  address: string
  coordinates?: {
    lat: number
    lng: number
  }
  imageURL?: string
  status: string
  priority: string
  createdAt: string
  updatedAt: string
  userId: string
  anonymous?: boolean
  estimatedCost?: number
  estimatedTime?: string
  assignedDept?: string
  adminNotes?: string
  userEmail?: string
}

export default function ReportDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [report, setReport] = useState<Report | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (params.id) {
      fetchReport()
    }
  }, [session, status, router, params.id])

  const fetchReport = async () => {
    try {
      const response = await fetch(`/api/reports/${params.id}`)
      
      if (response.ok) {
        const data = await response.json()
        setReport(data.report)
      } else if (response.status === 404) {
        toast.error('Report not found')
        router.push('/reports')
      } else {
        toast.error('Failed to load report')
      }
    } catch (error) {
      console.error('Report error:', error)
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteReport = async () => {
    if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/reports/${params.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Report deleted successfully')
        router.push('/reports')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete report')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Something went wrong')
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const formatProblemType = (type: string) => {
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-20 pb-8">
          <div className="container mx-auto px-4">
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h1 className="text-2xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                Report not found
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                The report you're looking for doesn't exist or has been removed.
              </p>
              <Button
                onClick={() => router.push('/reports')}
                variant="outline"
                className="border-gray-300 dark:border-gray-600"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Reports
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Check if current user owns this report
  const isOwner = session?.user?.email === report.userEmail || session?.user?.id === report.userId

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="border-gray-300 dark:border-gray-600"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="glass-card border-0 bg-white/10 dark:bg-black/10">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-lg font-mono text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20 px-3 py-1 rounded-lg">
                            #{report.reportId}
                          </span>
                          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(report.status)}`}>
                            {report.status.charAt(0).toUpperCase() + report.status.slice(1).replace('-', ' ')}
                          </span>
                        </div>
                        <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
                          {formatProblemType(report.problemType)}
                        </CardTitle>
                      </div>

                      {isOwner && report.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => router.push(`/reports/${report._id}/edit`)}
                            size="sm"
                            variant="outline"
                            className="border-gray-300 dark:border-gray-600"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={deleteReport}
                            size="sm"
                            variant="outline"
                            disabled={isDeleting}
                            className="border-red-300 dark:border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Report Image */}
                    {report.imageURL && (
                      <div className="rounded-xl overflow-hidden border border-white/20 dark:border-white/10">
                        <Image
                          src={report.imageURL}
                          alt="Report image"
                          width={1200}
                          height={600}
                          className="w-full h-auto object-cover"
                          priority
                        />
                      </div>
                    )}

                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {report.description}
                    </p>

                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <MapPin className="h-5 w-5 mr-2 text-blue-500" />
                      <span>{report.address}</span>
                    </div>

                    {/* Location Map */}
                    {report.coordinates?.lat && report.coordinates?.lng && (
                      <div className="rounded-xl overflow-hidden border border-white/20 dark:border-white/10 h-64">
                        <iframe
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${report.coordinates.lng-0.01},${report.coordinates.lat-0.01},${report.coordinates.lng+0.01},${report.coordinates.lat+0.01}&layer=mapnik&marker=${report.coordinates.lat},${report.coordinates.lng}`}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          title="Report location map"
                        ></iframe>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Admin Notes */}
              {report.adminNotes && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="glass-card border-0 bg-white/10 dark:bg-black/10">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-blue-500" />
                        Admin Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {report.adminNotes}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Report Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="glass-card border-0 bg-white/10 dark:bg-black/10">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">
                      Report Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400 text-sm flex items-center">
                        <Tag className="h-4 w-4 mr-2" />
                        Priority
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(report.priority)}`}>
                        {report.priority.charAt(0).toUpperCase() + report.priority.slice(1)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400 text-sm flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Created
                      </span>
                      <span className="text-gray-800 dark:text-gray-200 text-sm">
                        {formatDate(report.createdAt)}
                      </span>
                    </div>

                    {report.updatedAt !== report.createdAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400 text-sm flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          Updated
                        </span>
                        <span className="text-gray-800 dark:text-gray-200 text-sm">
                          {formatDate(report.updatedAt)}
                        </span>
                      </div>
                    )}

                    {report.assignedDept && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400 text-sm flex items-center">
                          <Building className="h-4 w-4 mr-2" />
                          Department
                        </span>
                        <span className="text-gray-800 dark:text-gray-200 text-sm font-medium">
                          {report.assignedDept}
                        </span>
                      </div>
                    )}

                    {report.estimatedCost && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400 text-sm flex items-center">
                          <DollarSign className="h-4 w-4 mr-2" />
                          Est. Cost
                        </span>
                        <span className="text-gray-800 dark:text-gray-200 text-sm font-medium">
                          ${report.estimatedCost.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {report.estimatedTime && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400 text-sm flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          Est. Time
                        </span>
                        <span className="text-gray-800 dark:text-gray-200 text-sm font-medium">
                          {report.estimatedTime}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Location Map Placeholder */}
              {report.coordinates && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="glass-card border-0 bg-white/10 dark:bg-black/10">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                        <MapPin className="h-5 w-5 mr-2 text-blue-500" />
                        Location
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Map view coming soon
                          </p>
                          {report.coordinates?.lat && report.coordinates?.lng && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              {report.coordinates.lat.toFixed(6)}, {report.coordinates.lng.toFixed(6)}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}