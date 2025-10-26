import mongoose, { Document, Schema } from 'mongoose'

export interface IReport extends Document {
  reportId: string
  userId: mongoose.Types.ObjectId | string
  problemType: string
  description: string
  address: string
  coordinates?: {
    lat?: number
    lng?: number
    latitude?: number
    longitude?: number
  }
  imageURL?: string
  anonymous: boolean
  status: 'pending' | 'in-progress' | 'resolved'
  estimatedCost?: number
  estimatedTime?: string
  assignedDept?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
}

const ReportSchema = new Schema<IReport>({
  reportId: {
    type: String,
    unique: true,
    required: true,
    default: function() {
      return 'REP' + Date.now().toString() + Math.random().toString(36).substr(2, 5).toUpperCase()
    }
  },
  userId: {
    type: Schema.Types.Mixed,  // Accept both ObjectId and String
    ref: 'User',
    required: false
  },
  problemType: {
    type: String,
    required: [true, 'Problem type is required'],
    enum: [
      'pothole',
      'water-leak',
      'garbage-collection',
      'street-light',
      'traffic-signal',
      'road-damage',
      'drainage',
      'noise-pollution',
      'air-pollution',
      'illegal-construction',
      'public-transport',
      'park-maintenance',
      'other'
    ]
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number },
    latitude: { type: Number },
    longitude: { type: Number }
  },
  imageURL: {
    type: String,
    default: null
  },
  anonymous: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved'],
    default: 'pending'
  },
  estimatedCost: {
    type: Number,
    min: 0
  },
  estimatedTime: {
    type: String
  },
  assignedDept: {
    type: String,
    enum: [
      'Public Works',
      'Water Department',
      'Waste Management',
      'Traffic Department',
      'Parks & Recreation',
      'Environmental Services',
      'Building & Safety',
      'Transportation',
      'Emergency Services'
    ]
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  resolvedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
})

// Create indexes for better performance
ReportSchema.index({ userId: 1 })
ReportSchema.index({ status: 1 })
ReportSchema.index({ problemType: 1 })
ReportSchema.index({ createdAt: -1 })
ReportSchema.index({ reportId: 1 })

// Compound indexes
ReportSchema.index({ userId: 1, status: 1 })
ReportSchema.index({ status: 1, createdAt: -1 })

// Geospatial index for location-based queries
ReportSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 })
ReportSchema.index({ 'coordinates.lat': 1, 'coordinates.lng': 1 })

export default mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema)