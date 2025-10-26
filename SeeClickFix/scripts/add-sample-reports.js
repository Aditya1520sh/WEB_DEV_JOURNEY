const mongoose = require('mongoose')

const MONGODB_URI = 'mongodb+srv://Aditya1250ssh:zmVa6cp674sOrXI9@cluster0.zxpoq9m.mongodb.net/seeclickfix'

// Report Schema
const ReportSchema = new mongoose.Schema({
  reportId: String,
  userId: mongoose.Schema.Types.ObjectId,
  problemType: String,
  description: String,
  address: String,
  coordinates: Object,
  status: String,
  priority: String
}, { timestamps: true })

const Report = mongoose.model('Report', ReportSchema)

async function addSampleReports() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')

    // Get admin user
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }))
    const admin = await User.findOne({ username: 'admin' })
    
    if (!admin) {
      console.log('❌ Admin user not found!')
      process.exit(1)
    }

    console.log('✅ Found admin user:', admin._id)

    // Delete existing reports
    await Report.deleteMany({})
    console.log('🗑️  Cleared existing reports\n')

    // Add sample reports
    const sampleReports = [
      {
        reportId: 'REP' + Date.now() + 'A',
        userId: admin._id,
        problemType: 'pothole',
        description: 'Large pothole on main road causing damage to vehicles',
        address: 'MG Road, Mumbai, Maharashtra',
        coordinates: { lat: 19.0760, lng: 72.8777 },
        priority: 'high',
        status: 'pending'
      },
      {
        reportId: 'REP' + Date.now() + 'B',
        userId: admin._id,
        problemType: 'street-light',
        description: 'Street light not working since last week',
        address: 'Linking Road, Bandra West, Mumbai',
        coordinates: { lat: 19.0596, lng: 72.8295 },
        priority: 'medium',
        status: 'in-progress'
      },
      {
        reportId: 'REP' + Date.now() + 'C',
        userId: admin._id,
        problemType: 'garbage-collection',
        description: 'Garbage not collected for 3 days, bins overflowing',
        address: 'Carter Road, Bandra, Mumbai',
        coordinates: { lat: 19.0525, lng: 72.8181 },
        priority: 'urgent',
        status: 'pending'
      }
    ]

    for (const reportData of sampleReports) {
      const report = await Report.create(reportData)
      console.log(`✅ Created report: ${report.reportId} - ${report.problemType}`)
    }

    console.log('\n🎉 Sample reports added successfully!')
    console.log(`📊 Total reports: ${sampleReports.length}`)

    await mongoose.connection.close()
    process.exit(0)

  } catch (error) {
    console.error('❌ Error:', error)
    await mongoose.connection.close()
    process.exit(1)
  }
}

addSampleReports()
