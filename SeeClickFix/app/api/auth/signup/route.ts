import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import { findUserByEmail, findUserByUsername, createUser } from '@/lib/mockData'

export async function POST(request: NextRequest) {
  try {
    const { name, email, username, password, city, address } = await request.json()

    // Validation
    if (!name || !email || !username || !password || !city || !address) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Try to connect to database
    const hasDatabase = process.env.MONGODB_URI
    
    if (hasDatabase) {
      try {
        await dbConnect()
        
        // Check if user already exists in database
        const existingUser = await User.findOne({
          $or: [{ email }, { username }]
        })

        if (existingUser) {
          return NextResponse.json(
            { error: existingUser.email === email ? 'Email already exists' : 'Username already exists' },
            { status: 400 }
          )
        }

        // Hash password and create user in database
        const hashedPassword = await bcrypt.hash(password, 12)
        const user = await User.create({
          name,
          email,
          username,
          password: hashedPassword,
          city,
          address
        })

        return NextResponse.json({
          message: 'User created successfully',
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            role: user.role
          }
        }, { status: 201 })
        
      } catch (dbError) {
        console.error('Database error, falling back to mock data:', dbError)
      }
    }

    // Use mock data if no database connection
    const existingUserByEmail = findUserByEmail(email)
    const existingUserByUsername = findUserByUsername(username)

    if (existingUserByEmail) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    if (existingUserByUsername) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      )
    }

    // Create user in mock data
    const hashedPassword = await bcrypt.hash(password, 12)
    
    const newUser = createUser({
      name,
      email: email.toLowerCase(),
      username,
      password: hashedPassword,
      city,
      address,
      role: 'user'
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: userWithoutPassword
      },
      { status: 201 }
    )

  } catch (error: any) {
    console.error('Signup error:', error)
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0]
      return NextResponse.json(
        { error: `${field} already exists` },
        { status: 400 }
      )
    }

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