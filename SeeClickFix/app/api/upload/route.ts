import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Check authentication (optional - remove if you want anonymous uploads)
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if Cloudinary credentials are configured
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: 'Cloudinary not configured' },
        { status: 503 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only images are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Image = buffer.toString('base64')
    const dataURI = `data:${file.type};base64,${base64Image}`

    // Generate timestamp and signature for Cloudinary signed upload
    const timestamp = Math.round(Date.now() / 1000)
    const crypto = require('crypto')
    
    // Create signature string
    const signatureString = `timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`
    const signature = crypto
      .createHash('sha1')
      .update(signatureString)
      .digest('hex')

    // Upload to Cloudinary using signed upload
    const uploadData = new URLSearchParams({
      file: dataURI,
      timestamp: timestamp.toString(),
      api_key: process.env.CLOUDINARY_API_KEY!,
      signature: signature,
    })

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`

    const response = await fetch(cloudinaryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: uploadData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Cloudinary upload error:', errorData)
      return NextResponse.json(
        { error: errorData.error?.message || 'Upload failed' },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      url: data.secure_url,
      publicId: data.public_id,
    })

  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
