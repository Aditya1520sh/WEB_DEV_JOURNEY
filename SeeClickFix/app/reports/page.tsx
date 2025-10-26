'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Plus, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  MapPin,
  Calendar,
  Search,
  Filter
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
  status: string
  priority: string
  createdAt: string
  estimatedCost?: number
  estimatedTime?: string
  assignedDept?: string
}

export default function ReportsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchReports()
  }, [session, status, router])

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/reports?limit=100')
      
      if (response.ok) {
        const data = await response.json()
        setReports(data.reports || [])
      } else {
        toast.error('Failed to load reports')
      }
    } catch (error) {
      console.error('Reports error:', error)
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
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

  const formatProblemType = (type: string) => {
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredReports = reports
    .filter(report => statusFilter === 'all' || report.status === statusFilter)
    .filter(report => 
      searchQuery === '' || 
      report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formatProblemType(report.problemType).toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reportId.toLowerCase().includes(searchQuery.toLowerCase())
    )

  if (status === 'loading' || isLoading) {
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
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                My Reports
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Track the status of your civic issue reports.
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <Button
                onClick={() => router.push('/reports/create')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="mr-2 h-5 w-5" />
                New Report
              </Button>
            </div>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 space-y-4"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reports by description, address, type, or ID..."
                className="w-full pl-10 pr-4 py-3 bg-white/20 dark:bg-black/20 border border-white/30 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Filter className="h-5 w-5 text-gray-400 mt-1" />
              {['all', 'pending', 'in-progress', 'resolved'].map((filter) => (
                <Button
                  key={filter}
                  variant={statusFilter === filter ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(filter)}
                  className={`capitalize ${
                    statusFilter === filter 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {filter === 'all' ? 'All' : filter.replace('-', ' ')}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Reports Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {filteredReports.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredReports.map((report, index) => (
                  <motion.div
                    key={report._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <Card 
                      className="glass-card border-0 bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20 transition-all duration-300 cursor-pointer h-full"
                      onClick={() => router.push(`/reports/${report._id}`)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-mono text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20 px-2 py-1 rounded">
                            #{report.reportId}
                          </span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                            {report.status.charAt(0).toUpperCase() + report.status.slice(1).replace('-', ' ')}
                          </span>
                        </div>
                        
                        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">
                          {formatProblemType(report.problemType)}
                        </CardTitle>
                      </CardHeader>
                      
                      <CardContent className="space-y-3">
                        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
                          {report.description}
                        </p>
                        
                        <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="truncate">{report.address}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span>{formatDate(report.createdAt)}</span>
                          </div>
                        </div>

                        {(report.estimatedCost || report.estimatedTime || report.assignedDept) && (
                          <div className="pt-2 border-t border-white/20 dark:border-white/10">
                            {report.assignedDept && (
                              <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                                Assigned to: {report.assignedDept}
                              </p>
                            )}
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {report.estimatedCost && (
                                <span>Est. Cost: ${report.estimatedCost}</span>
                              )}
                              {report.estimatedTime && (
                                <span>Est. Time: {report.estimatedTime}</span>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="glass-card border-0 bg-white/10 dark:bg-black/10 p-12 rounded-2xl">
                  {searchQuery || statusFilter !== 'all' ? (
                    <>
                      <Search className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                        No reports found
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Try adjusting your search or filter criteria.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchQuery('')
                          setStatusFilter('all')
                        }}
                        className="border-gray-300 dark:border-gray-600"
                      >
                        Clear Filters
                      </Button>
                    </>
                  ) : (
                    <>
                      <FileText className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                        No reports yet
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Start by reporting your first civic issue to help improve your community.
                      </p>
                      <Button
                        onClick={() => router.push('/reports/create')}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create First Report
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  )
}