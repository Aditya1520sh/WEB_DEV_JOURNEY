import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import dbConnect from '@/lib/dbConnect'
import Report from '@/models/Report'
import { authOptions } from '@/lib/auth'
import { getReports, createReport, getStats } from '@/lib/mockData'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    const { 
      problemType, 
      description, 
      address, 
      coordinates,
      imageURL, 
      anonymous 
    } = await request.json()

    console.log('🔍 POST Report Debug:')
    console.log('   Session:', session ? 'EXISTS' : 'NULL')
    console.log('   User ID:', session?.user?.id)
    console.log('   Anonymous:', anonymous)

    // Validation
    if (!problemType || !description || !address) {
      return NextResponse.json(
        { error: 'Problem type, description, and address are required' },
        { status: 400 }
      )
    }

    // For anonymous reports, don't require session
    if (!anonymous && !session) {
      return NextResponse.json(
        { error: 'Authentication required for non-anonymous reports' },
        { status: 401 }
      )
    }

    const reportData = {
      problemType,
      description,
      address,
      coordinates,
      imageURL,
      anonymous: Boolean(anonymous),
      userId: anonymous ? null : session?.user.id,
    }

    console.log('   Report Data userId:', reportData.userId)

    // Try database first if available
    const hasDatabase = process.env.MONGODB_URI
    
    if (hasDatabase) {
      try {
        await dbConnect()
        const report = new Report(reportData)
        await report.save()
        
        console.log('   ✅ Report saved with userId:', report.userId)
        
        return NextResponse.json({
          message: 'Report created successfully',
          report
        }, { status: 201 })
        
      } catch (dbError) {
        console.log('Database error, using mock data:', dbError)
      }
    }

    // Use mock data as fallback
    const report = createReport(reportData)

    return NextResponse.json(
      { 
        message: 'Report created successfully',
        report: {
          reportId: report.reportId,
          problemType: report.problemType,
          description: report.description,
          address: report.address,
          status: report.status,
          createdAt: report.createdAt
        }
      },
      { status: 201 }
    )

  } catch (error: any) {
    console.error('Create report error:', error)
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json(
        { error: errors.join(', ') },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log('🔍 GET Reports Debug:')
    console.log('   Session User ID:', session.user.id)
    console.log('   Session User ID Type:', typeof session.user.id)
    console.log('   Session User Role:', session.user.role)

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Try database first if available
    const hasDatabase = process.env.MONGODB_URI
    
    if (hasDatabase) {
      try {
        await dbConnect()
        
        const skip = (page - 1) * limit
        let query: any = {}

        // Admin can see all reports, users only their own
        if (session.user.role === 'admin') {
          // Admin sees all reports, or filter by userId if provided
          if (userId) query.userId = userId
          if (status) query.status = status
          console.log('   Admin Query:', JSON.stringify(query))
        } else {
          // Regular users see only their reports
          query.userId = session.user.id
          if (status) query.status = status
          console.log('   User Query:', JSON.stringify(query))
        }

        const reports = await Report.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()

        console.log('   Reports Found:', reports.length)
        if (reports.length > 0) {
          console.log('   First Report userId:', reports[0].userId)
        }

        const totalReports = await Report.countDocuments(query)
        const totalPages = Math.ceil(totalReports / limit)

        return NextResponse.json({
          reports,
          pagination: {
            currentPage: page,
            totalPages,
            totalReports,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        })
        
      } catch (dbError) {
        console.log('Database error, using mock data:', dbError)
      }
    }

    // Use mock data as fallback
    let filters: any = {}
    
    if (session.user.role !== 'admin') {
      filters.userId = session.user.id
    } else if (userId) {
      filters.userId = userId
    }
    
    if (status) {
      filters.status = status
    }

    const allReports = getReports(filters)
    
    // Manual pagination for mock data
    const skip = (page - 1) * limit
    const reports = allReports.slice(skip, skip + limit)
    const totalReports = allReports.length
    const totalPages = Math.ceil(totalReports / limit)

    return NextResponse.json({
      reports,
      pagination: {
        currentPage: page,
        totalPages,
        totalReports,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    })

  } catch (error: any) {
    console.error('Get reports error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}