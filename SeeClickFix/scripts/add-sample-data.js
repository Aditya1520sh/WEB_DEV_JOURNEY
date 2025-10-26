// Script to add sample data to MongoDB
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect('mongodb+srv://Aditya1250ssh:zmVa6cp674sOrXI9@cluster0.zxpoq9m.mongodb.net/seeclickfix?retryWrites=true&w=majority')
    console.log('✅ Connected to MongoDB')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    process.exit(1)
  }
}

// User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String },
  city: { type: String, required: true },
  address: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  provider: { type: String, default: 'credentials' }
}, { timestamps: true })

UserSchema.index({ email: 1 }, { unique: true })
UserSchema.index({ username: 1 }, { unique: true })

// Report Schema
const ReportSchema = new mongoose.Schema({
  reportId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problemType: { type: String, required: true },
  description: { type: String, required: true },
  address: { type: String, required: true },
  coordinates: {
    lat: Number,
    lng: Number
  },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  status: { type: String, enum: ['pending', 'in-progress', 'resolved'], default: 'pending' },
  estimatedCost: Number,
  estimatedTime: String,
  assignedDept: String,
  adminNotes: String
}, { timestamps: true })

const User = mongoose.model('User', UserSchema)
const Report = mongoose.model('Report', ReportSchema)

async function addSampleData() {
  try {
    // Delete existing admin if any
    await User.deleteMany({ role: 'admin' })
    
    // Hash password properly
    const hashedPassword = await bcrypt.hash('admin123', 12)
    console.log('🔐 Password hashed successfully')
    
    // Create ONLY Admin User with simple credentials
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@seeclickfix.local',
      username: 'admin',
      password: hashedPassword,
      city: 'System',
      address: 'System Admin',
      role: 'admin'
    })
    console.log('✅ Admin user created')
    console.log('   Username: admin')
    console.log('   Password: admin123')

    console.log('\n🎉 Admin setup complete!')
    console.log('\n📋 Login Credentials:')
    console.log('👤 Admin Username: admin')
    console.log('🔐 Admin Password: admin123')

    process.exit(0)
  } catch (error) {
    if (error.code === 11000) {
      console.log('⚠️  Admin already exists!')
      console.log('\n📋 Use these credentials:')
      console.log('👤 Username: admin')
      console.log('� Password: admin123')
      process.exit(0)
    }
    console.error('❌ Error adding admin:', error)
    process.exit(1)
  }
}

async function main() {
  await connectDB()
  await addSampleData()
}

main()