'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  AlertTriangle,
  Settings,
  Trash2,
  Edit,
  MapPin,
  Calendar,
  DollarSign,
  Timer
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/Header'
import toast from 'react-hot-toast'

interface AdminStats {
  totalReports: number
  pendingReports: number
  inProgressReports: number
  resolvedReports: number
  totalUsers: number
}

interface Report {
  _id: string
  reportId: string
  problemType: string
  description: string
  address: string
  status: string
  priority: string
  createdAt: string
  userId?: {
    name: string
    email: string
    username: string
  }
  anonymous: boolean
  estimatedCost?: number
  estimatedTime?: string
  assignedDept?: string
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'admin') {
      router.push('/auth/signin')
      return
    }

    fetchAdminData()
  }, [session, status, router])

  const fetchAdminData = async () => {
    try {
      const response = await fetch('/api/reports?limit=50')
      
      if (response.ok) {
        const data = await response.json()
        const allReports = data.reports || []
        
        // Calculate stats
        const stats: AdminStats = {
          totalReports: allReports.length,
          pendingReports: allReports.filter((r: Report) => r.status === 'pending').length,
          inProgressReports: allReports.filter((r: Report) => r.status === 'in-progress').length,
          resolvedReports: allReports.filter((r: Report) => r.status === 'resolved').length,
          totalUsers: new Set(allReports.filter((r: Report) => !r.anonymous).map((r: Report) => r.userId?._id)).size
        }
        
        setStats(stats)
        setReports(allReports)
      } else {
        toast.error('Failed to load admin data')
      }
    } catch (error) {
      console.error('Admin dashboard error:', error)
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const updateReportStatus = async (reportId: string, updates: Partial<Report>) => {
    setIsUpdating(true)
    
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        toast.success('Report updated successfully')
        fetchAdminData() // Refresh data
        setSelectedReport(null)
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to update report')
      }
    } catch (error) {
      console.error('Update report error:', error)
      toast.error('Something went wrong')
    } finally {
      setIsUpdating(false)
    }
  }

  const deleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this resolved report?')) return

    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Report deleted successfully')
        fetchAdminData() // Refresh data
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to delete report')
      }
    } catch (error) {
      console.error('Delete report error:', error)
      toast.error('Something went wrong')
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
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
      case 'medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'low':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
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

  const filteredReports = statusFilter === 'all' 
    ? reports 
    : reports.filter(report => report.status === statusFilter)

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
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
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <Settings className="h-8 w-8 text-orange-500" />
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                Admin Dashboard
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Manage civic issues and monitor community reports.
            </p>
          </motion.div>

          {/* Stats Cards */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
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

              <Card className="glass-card border-0 bg-white/10 dark:bg-black/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Active Users
                  </CardTitle>
                  <Users className="h-5 w-5 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">
                    {stats.totalUsers}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <div className="flex flex-wrap gap-2">
              {['all', 'pending', 'in-progress', 'resolved'].map((filter) => (
                <Button
                  key={filter}
                  variant={statusFilter === filter ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(filter)}
                  className={`capitalize ${
                    statusFilter === filter 
                      ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {filter === 'all' ? 'All Reports' : filter.replace('-', ' ')}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Reports List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass-card border-0 bg-white/10 dark:bg-black/10">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
                  Reports Management
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Monitor, update, and resolve civic issues reported by citizens.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredReports.length > 0 ? (
                  <div className="space-y-4">
                    {filteredReports.map((report, index) => (
                      <motion.div
                        key={report._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="p-4 bg-white/20 dark:bg-black/20 rounded-xl border border-white/20 dark:border-white/10 hover:bg-white/30 dark:hover:bg-black/30 transition-colors"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <span className="text-sm font-mono text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20 px-2 py-1 rounded">
                                #{report.reportId}
                              </span>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                                {report.status.charAt(0).toUpperCase() + report.status.slice(1).replace('-', ' ')}
                              </span>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(report.priority)}`}>
                                {report.priority.charAt(0).toUpperCase() + report.priority.slice(1)} Priority
                              </span>
                              {report.anonymous && (
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300">
                                  Anonymous
                                </span>
                              )}
                            </div>
                            
                            <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
                              {formatProblemType(report.problemType)}
                            </h4>
                            
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                              {report.description}
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-gray-500 dark:text-gray-400">
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span className="truncate">{report.address}</span>
                              </div>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>{formatDate(report.createdAt)}</span>
                              </div>
                              {report.estimatedCost && (
                                <div className="flex items-center">
                                  <DollarSign className="h-4 w-4 mr-1" />
                                  <span>${report.estimatedCost}</span>
                                </div>
                              )}
                              {report.estimatedTime && (
                                <div className="flex items-center">
                                  <Timer className="h-4 w-4 mr-1" />
                                  <span>{report.estimatedTime}</span>
                                </div>
                              )}
                            </div>
                            
                            {!report.anonymous && report.userId && (
                              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                Reported by: {report.userId.name} (@{report.userId.username})
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-row lg:flex-col gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedReport(report)}
                              className="flex-1 lg:flex-none"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Update
                            </Button>
                            
                            {report.status === 'resolved' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteReport(report._id)}
                                className="flex-1 lg:flex-none text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <AlertTriangle className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                      No reports found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {statusFilter === 'all' 
                        ? 'No civic issues have been reported yet.' 
                        : `No ${statusFilter.replace('-', ' ')} reports at the moment.`
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      {/* Update Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Update Report #{selectedReport.reportId}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  defaultValue={selectedReport.status}
                  onChange={(e) => setSelectedReport({ ...selectedReport, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <select
                  defaultValue={selectedReport.priority}
                  onChange={(e) => setSelectedReport({ ...selectedReport, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Estimated Cost ($)
                </label>
                <input
                  type="number"
                  defaultValue={selectedReport.estimatedCost || ''}
                  onChange={(e) => setSelectedReport({ ...selectedReport, estimatedCost: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  placeholder="Enter estimated cost"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Estimated Time
                </label>
                <input
                  type="text"
                  defaultValue={selectedReport.estimatedTime || ''}
                  onChange={(e) => setSelectedReport({ ...selectedReport, estimatedTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  placeholder="e.g., 2-3 days"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Assigned Department
                </label>
                <select
                  defaultValue={selectedReport.assignedDept || ''}
                  onChange={(e) => setSelectedReport({ ...selectedReport, assignedDept: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                >
                  <option value="">Select Department</option>
                  <option value="Public Works">Public Works</option>
                  <option value="Water Department">Water Department</option>
                  <option value="Waste Management">Waste Management</option>
                  <option value="Traffic Department">Traffic Department</option>
                  <option value="Parks & Recreation">Parks & Recreation</option>
                  <option value="Environmental Services">Environmental Services</option>
                  <option value="Building & Safety">Building & Safety</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Emergency Services">Emergency Services</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => updateReportStatus(selectedReport._id, selectedReport)}
                disabled={isUpdating}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
              >
                {isUpdating ? 'Updating...' : 'Update Report'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedReport(null)}
                disabled={isUpdating}
                className="px-6"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}