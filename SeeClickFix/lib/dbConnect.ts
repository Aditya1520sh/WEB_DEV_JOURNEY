import mongoose from 'mongoose'

const connection: { isConnected?: number } = {}

async function dbConnect() {
  if (connection.isConnected) {
    return
  }

  // If no MONGODB_URI, skip database connection (use mock data)
  if (!process.env.MONGODB_URI) {
    console.log('⚠️  No MONGODB_URI found - using mock data mode')
    connection.isConnected = 1
    return
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
    })
    connection.isConnected = db.connections[0].readyState
    console.log('✅ MongoDB connected successfully')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    console.log('⚠️  Falling back to mock data mode')
    connection.isConnected = 1
    return
  }
}

export default dbConnect