import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import { authOptions } from '@/lib/auth'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { name, city } = await request.json()

    // Validation
    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    if (!city?.trim()) {
      return NextResponse.json(
        { error: 'City is required' },
        { status: 400 }
      )
    }

    // Try database first if available
    const hasDatabase = process.env.MONGODB_URI
    
    if (hasDatabase) {
      try {
        await dbConnect()
        
        // Find user by either _id (MongoDB ObjectId) or email (for Google OAuth users)
        // Google OAuth users have string IDs that don't work with findByIdAndUpdate
        const updatedUser = await User.findOneAndUpdate(
          { $or: [{ _id: session.user.id }, { email: session.user.email }] },
          {
            name: name.trim(),
            city: city.trim(),
          },
          { new: true, runValidators: true }
        ).catch(() => null)

        if (!updatedUser) {
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          )
        }

        return NextResponse.json({
          message: 'Profile updated successfully',
          user: {
            name: updatedUser.name,
            city: updatedUser.city,
          }
        })
        
      } catch (dbError) {
        console.log('Database error:', dbError)
        return NextResponse.json(
          { error: 'Failed to update profile' },
          { status: 500 }
        )
      }
    }

    // Mock data fallback (not implemented for profile updates)
    return NextResponse.json(
      { error: 'Database connection required for profile updates' },
      { status: 503 }
    )

  } catch (error: any) {
    console.error('Update profile error:', error)
    
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

    // Try database first if available
    const hasDatabase = process.env.MONGODB_URI
    
    if (hasDatabase) {
      try {
        await dbConnect()
        
        // Find user by either _id (MongoDB ObjectId) or email (for Google OAuth users)
        const user = await User.findOne(
          { $or: [{ _id: session.user.id }, { email: session.user.email }] }
        ).select('-password').catch(() => null)

        if (!user) {
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          )
        }

        return NextResponse.json({
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            city: user.city,
            role: user.role,
            createdAt: user.createdAt,
          }
        })
        
      } catch (dbError) {
        console.log('Database error:', dbError)
      }
    }

    // Fallback to session data
    return NextResponse.json({
      user: session.user
    })

  } catch (error: any) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
