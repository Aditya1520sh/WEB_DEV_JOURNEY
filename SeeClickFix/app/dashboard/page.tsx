'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, FileText, Clock, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/Header'
import toast from 'react-hot-toast'

interface DashboardStats {
  totalReports: number
  pendingReports: number
  inProgressReports: number
  resolvedReports: number
}

interface RecentReport {
  _id: string
  reportId: string
  problemType: string
  description: string
  status: string
  createdAt: string
  address: string
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentReports, setRecentReports] = useState<RecentReport[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchDashboardData()
  }, [session, status, router])

  const fetchDashboardData = async () => {
    try {
      // Fetch all user reports (API already filters by user)
      const response = await fetch('/api/reports?limit=100')
      
      if (response.ok) {
        const data = await response.json()
        const userReports = data.reports || []
        
        // Calculate stats from user's reports
        const stats: DashboardStats = {
          totalReports: userReports.length,
          pendingReports: userReports.filter((r: any) => r.status === 'pending').length,
          inProgressReports: userReports.filter((r: any) => r.status === 'in-progress').length,
          resolvedReports: userReports.filter((r: any) => r.status === 'resolved').length,
        }
        
        setStats(stats)
        setRecentReports(userReports.slice(0, 5))
      } else {
        toast.error('Failed to load dashboard data')
      }
    } catch (error) {
      console.error('Dashboard error:', error)
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

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Welcome back, {session?.user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Here's an overview of your civic issue reports and community activity.
            </p>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => router.push('/reports/create')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="mr-2 h-5 w-5" />
                Report New Issue
              </Button>
              
              <Button
                variant="outline"
                onClick={() => router.push('/reports')}
                className="border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 px-6 py-3 rounded-xl font-semibold transition-all duration-300"
              >
                <FileText className="mr-2 h-5 w-5" />
                View All Reports
              </Button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              <Card className="glass-card border-0 bg-white/10 dark:bg-black/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Total Reports
                  </CardTitle>
                  <FileText className="h-5 w-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">
                    {stats.totalReports}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 bg-white/10 dark:bg-black/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Pending
                  </CardTitle>
                  <Clock className="h-5 w-5 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">
                    {stats.pendingReports}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 bg-white/10 dark:bg-black/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    In Progress
                  </CardTitle>
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">
                    {stats.inProgressReports}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 bg-white/10 dark:bg-black/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Resolved
                  </CardTitle>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">
                    {stats.resolvedReports}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Recent Reports */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass-card border-0 bg-white/10 dark:bg-black/10">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
                  Recent Reports
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Your latest civic issue reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentReports.length > 0 ? (
                  <div className="space-y-4">
                    {recentReports.map((report, index) => (
                      <motion.div
                        key={report._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="p-4 bg-white/20 dark:bg-black/20 rounded-xl border border-white/20 dark:border-white/10 hover:bg-white/30 dark:hover:bg-black/30 transition-colors cursor-pointer"
                        onClick={() => router.push(`/reports/${report._id}`)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-sm font-mono text-blue-600 dark:text-blue-400">
                                #{report.reportId}
                              </span>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                                {report.status.charAt(0).toUpperCase() + report.status.slice(1).replace('-', ' ')}
                              </span>
                            </div>
                            
                            <h4 className="font-semibold text-gray-800 dark:text-white mb-1">
                              {formatProblemType(report.problemType)}
                            </h4>
                            
                            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-2">
                              {report.description}
                            </p>
                            
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <span>{report.address}</span>
                              <span className="mx-2">•</span>
                              <span>{formatDate(report.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <AlertTriangle className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                      No reports yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      Start by reporting your first civic issue to help improve your community.
                    </p>
                    <Button
                      onClick={() => router.push('/reports/create')}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl font-semibold"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create First Report
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}