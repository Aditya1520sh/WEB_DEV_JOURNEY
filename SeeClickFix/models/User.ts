import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  username: string
  password?: string
  city: string
  address: string
  role: 'user' | 'admin'
  image?: string
  provider?: string
  providerId?: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  image: {
    type: String,
    default: null
  },
  provider: {
    type: String,
    enum: ['credentials', 'google'],
    default: 'credentials'
  },
  providerId: {
    type: String,
    default: null
  }
}, {
  timestamps: true
})

// Create indexes for better performance - only if they don't exist
UserSchema.index({ email: 1 }, { unique: true })
UserSchema.index({ username: 1 }, { unique: true })

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)