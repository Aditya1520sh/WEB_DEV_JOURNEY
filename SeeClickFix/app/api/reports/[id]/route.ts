import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import Report from '@/models/Report'
import User from '@/models/User'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const report = await Report.findById(params.id).lean()
    
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Check if user can view this report (admin or owner)
    const isAdmin = session.user.role === 'admin'
    const isOwner = String(report.userId) === String(session.user.id)

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({ report })

  } catch (error) {
    console.error('Get report error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    console.log('🔍 PUT Report Debug:')
    console.log('   Report ID:', params.id)
    console.log('   Session Role:', session.user.role)
    console.log('   Update Data:', data)

    await dbConnect()

    const report = await Report.findById(params.id)
    
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    console.log('   Found Report userId:', report.userId)

    const isAdmin = session.user.role === 'admin'

    // Only Admin can update reports, regular users CANNOT update
    if (!isAdmin) {
      return NextResponse.json({ 
        error: 'Only admin can update reports' 
      }, { status: 403 })
    }

    // Admin can update all fields
    const allowedFields = [
      'status',
      'priority',
      'estimatedCost',
      'estimatedTime',
      'assignedDept',
      'adminNotes'
    ]
    
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        report[field] = data[field]
      }
    })

    report.updatedAt = new Date()
    await report.save()

    console.log('   ✅ Report updated successfully')

    return NextResponse.json({ 
      message: 'Report updated successfully',
      report 
    })

  } catch (error) {
    console.error('Update report error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔍 DELETE Report Debug:')
    console.log('   Report ID:', params.id)
    console.log('   Session Role:', session.user.role)

    await dbConnect()

    const report = await Report.findById(params.id)
    
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    console.log('   Found Report Status:', report.status)

    const isAdmin = session.user.role === 'admin'

    // Only Admin can delete reports, regular users CANNOT delete
    if (!isAdmin) {
      return NextResponse.json({ 
        error: 'Only admin can delete reports' 
      }, { status: 403 })
    }

    // Admin can only delete resolved reports
    if (report.status !== 'resolved') {
      return NextResponse.json({ 
        error: 'Only resolved reports can be deleted' 
      }, { status: 403 })
    }

    await Report.findByIdAndDelete(params.id)

    console.log('   ✅ Report deleted successfully')

    return NextResponse.json({ 
      message: 'Report deleted successfully' 
    })

  } catch (error) {
    console.error('Delete report error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}