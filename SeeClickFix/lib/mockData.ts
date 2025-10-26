// Mock data for development when database is not available
export const mockUsers = [
  {
    _id: '673d5f2e4a8b9c1d2e3f4567',
    name: 'Admin User',
    email: 'admin@seeclickfix.com',
    username: 'admin',
    password: '$2b$12$LQv3c1yqBwEHXqzqL5QhL.eXZbfKR7eQi8nYKVHYLfXFJwqJFVvZu', // admin123
    city: 'Mumbai',
    address: 'Admin Office, Mumbai, Maharashtra',
    role: 'admin',
    provider: 'credentials',
    createdAt: new Date('2024-01-15T08:00:00Z'),
    updatedAt: new Date('2024-01-15T08:00:00Z')
  },
  {
    _id: '673d5f2e4a8b9c1d2e3f4568',
    name: 'John Doe',
    email: 'john@example.com', 
    username: 'johndoe',
    password: '$2b$12$LQv3c1yqBwEHXqzqL5QhL.eXZbfKR7eQi8nYKVHYLfXFJwqJFVvZu', // admin123
    city: 'Mumbai',
    address: 'Bandra West, Mumbai, Maharashtra',
    role: 'user',
    provider: 'credentials',
    createdAt: new Date('2024-01-16T09:00:00Z'),
    updatedAt: new Date('2024-01-16T09:00:00Z')
  },
  {
    _id: '673d5f2e4a8b9c1d2e3f4569',
    name: 'Jane Smith',
    email: 'jane@example.com',
    username: 'janesmith', 
    password: '$2b$12$LQv3c1yqBwEHXqzqL5QhL.eXZbfKR7eQi8nYKVHYLfXFJwqJFVvZu', // admin123
    city: 'Delhi',
    address: 'CP, New Delhi, Delhi',
    role: 'user',
    provider: 'credentials',
    createdAt: new Date('2024-01-17T10:00:00Z'),
    updatedAt: new Date('2024-01-17T10:00:00Z')
  }
]

export const mockReports = [
  {
    _id: '673d5f2e4a8b9c1d2e3f4570',
    reportId: 'SCF-001',
    userId: '673d5f2e4a8b9c1d2e3f4568',
    problemType: 'pothole',
    description: 'Large pothole on the main road causing damage to vehicles. Needs immediate attention.',
    address: 'Linking Road, Bandra West, Mumbai',
    coordinates: { lat: 19.0596, lng: 72.8295 },
    priority: 'high',
    status: 'pending',
    createdAt: new Date('2024-01-20T08:30:00Z'),
    updatedAt: new Date('2024-01-20T08:30:00Z')
  },
  {
    _id: '673d5f2e4a8b9c1d2e3f4571',
    reportId: 'SCF-002',
    userId: '673d5f2e4a8b9c1d2e3f4568',
    problemType: 'street-light',
    description: 'Street light not working since last week. Area becomes very dark at night.',
    address: 'SV Road, Bandra West, Mumbai',
    coordinates: { lat: 19.0606, lng: 72.8306 },
    priority: 'medium',
    status: 'in-progress',
    assignedDept: 'Municipal Corporation',
    estimatedTime: '3-5 days',
    createdAt: new Date('2024-01-21T09:15:00Z'),
    updatedAt: new Date('2024-01-22T14:20:00Z')
  },
  {
    _id: '673d5f2e4a8b9c1d2e3f4572',
    reportId: 'SCF-003',
    userId: '673d5f2e4a8b9c1d2e3f4568',
    problemType: 'water-leak',
    description: 'Water pipeline burst, causing water wastage and road flooding.',
    address: 'Hill Road, Bandra West, Mumbai',
    coordinates: { lat: 19.0567, lng: 72.8280 },
    priority: 'urgent',
    status: 'resolved',
    assignedDept: 'Water Department',
    estimatedCost: 15000,
    estimatedTime: '1-2 days',
    adminNotes: 'Issue resolved. New pipeline installed and tested.',
    createdAt: new Date('2024-01-18T07:45:00Z'),
    updatedAt: new Date('2024-01-19T16:30:00Z')
  },
  {
    _id: '673d5f2e4a8b9c1d2e3f4573',
    reportId: 'SCF-004',
    userId: '673d5f2e4a8b9c1d2e3f4569',
    problemType: 'garbage-collection',
    description: 'Garbage not collected for 3 days. Bins overflowing and creating unhygienic conditions.',
    address: 'Turner Road, Bandra West, Mumbai',
    coordinates: { lat: 19.0587, lng: 72.8297 },
    priority: 'medium',
    status: 'pending',
    createdAt: new Date('2024-01-22T11:00:00Z'),
    updatedAt: new Date('2024-01-22T11:00:00Z')
  },
  {
    _id: '673d5f2e4a8b9c1d2e3f4574',
    reportId: 'SCF-005',
    userId: '673d5f2e4a8b9c1d2e3f4569',
    problemType: 'traffic-signal',
    description: 'Traffic signal malfunctioning, causing traffic jams during peak hours.',
    address: 'Bandra-Worli Sea Link Junction, Mumbai',
    coordinates: { lat: 19.0330, lng: 72.8200 },
    priority: 'high',
    status: 'in-progress',
    assignedDept: 'Traffic Police',
    estimatedCost: 25000,
    estimatedTime: '2-3 days',
    createdAt: new Date('2024-01-23T13:20:00Z'),
    updatedAt: new Date('2024-01-24T10:15:00Z')
  },
  {
    _id: '673d5f2e4a8b9c1d2e3f4575',
    reportId: 'SCF-006',
    userId: '673d5f2e4a8b9c1d2e3f4568',
    problemType: 'public-toilet',
    description: 'Public toilet facility broken and not maintained. Very unhygienic condition.',
    address: 'Carter Road, Bandra West, Mumbai',
    coordinates: { lat: 19.0500, lng: 72.8200 },
    priority: 'medium',
    status: 'pending',
    createdAt: new Date('2024-01-25T15:30:00Z'),
    updatedAt: new Date('2024-01-25T15:30:00Z')
  }
]

// Mock data helper functions
export const findUserByEmail = (email: string) => {
  return mockUsers.find(user => user.email === email)
}

export const findUserById = (id: string) => {
  return mockUsers.find(user => user._id === id)
}

export const findUserByUsername = (username: string) => {
  return mockUsers.find(user => user.username === username)
}

export const createUser = (userData: any) => {
  const newUser = {
    _id: Date.now().toString(),
    ...userData,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  mockUsers.push(newUser)
  return newUser
}

export const getReports = (filters: any = {}) => {
  let reports = [...mockReports]
  
  if (filters.userId) {
    reports = reports.filter(report => report.userId === filters.userId)
  }
  
  if (filters.status) {
    reports = reports.filter(report => report.status === filters.status)
  }
  
  return reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export const createReport = (reportData: any) => {
  const reportId = `SCF-${String(mockReports.length + 1).padStart(3, '0')}`
  const newReport = {
    _id: Date.now().toString(),
    reportId,
    ...reportData,
    status: 'pending',
    priority: reportData.priority || 'medium',
    createdAt: new Date(),
    updatedAt: new Date()
  }
  mockReports.push(newReport)
  return newReport
}

export const findReportById = (id: string) => {
  return mockReports.find(report => report._id === id)
}

export const updateReport = (id: string, updateData: any) => {
  const reportIndex = mockReports.findIndex(report => report._id === id)
  if (reportIndex !== -1) {
    mockReports[reportIndex] = {
      ...mockReports[reportIndex],
      ...updateData,
      updatedAt: new Date()
    }
    return mockReports[reportIndex]
  }
  return null
}

export const deleteReport = (id: string) => {
  const reportIndex = mockReports.findIndex(report => report._id === id)
  if (reportIndex !== -1) {
    mockReports.splice(reportIndex, 1)
    return true
  }
  return false
}

export const getStats = () => {
  const totalReports = mockReports.length
  const resolvedReports = mockReports.filter(r => r.status === 'resolved').length
  const pendingReports = mockReports.filter(r => r.status === 'pending').length
  const inProgressReports = mockReports.filter(r => r.status === 'in-progress').length
  
  return {
    totalReports,
    resolvedReports,
    pendingReports,
    inProgressReports,
    avgResolutionTime: '4-6 days'
  }
}