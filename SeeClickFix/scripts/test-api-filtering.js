const mongoose = require('mongoose')

const MONGODB_URI = 'mongodb+srv://Aditya1250ssh:zmVa6cp674sOrXI9@cluster0.zxpoq9m.mongodb.net/seeclickfix'

async function testAPIFiltering() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }))
    const Report = mongoose.model('Report', new mongoose.Schema({}, { strict: false }))

    // Get all users
    const users = await User.find({})
    console.log(`👥 Testing API Filtering Logic\n`)
    console.log('=' .repeat(60))

    for (const user of users) {
      console.log(`\n📋 User: ${user.name} (${user.username})`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   User ID: ${user._id}`)
      
      // Simulate API query logic
      let query = {}
      
      if (user.role === 'admin') {
        console.log(`   🔍 Query: {} (Admin sees ALL reports)`)
      } else {
        query.userId = user._id
        console.log(`   🔍 Query: { userId: "${user._id}" }`)
      }
      
      const reports = await Report.find(query)
      console.log(`   ✅ Reports returned: ${reports.length}`)
      
      if (reports.length > 0) {
        reports.forEach((report, idx) => {
          console.log(`      ${idx + 1}. ${report.reportId} - ${report.problemType}`)
        })
      } else {
        console.log(`      (No reports)`)
      }
    }

    // Test with Google OAuth user ID (string)
    console.log(`\n\n🔍 Testing String userId (Google OAuth)`)
    console.log('=' .repeat(60))
    const googleUserId = "107796661600642987152"
    console.log(`   Query: { userId: "${googleUserId}" }`)
    const googleReports = await Report.find({ userId: googleUserId })
    console.log(`   ✅ Reports returned: ${googleReports.length}`)

    console.log(`\n\n📊 Summary`)
    console.log('=' .repeat(60))
    const totalReports = await Report.countDocuments({})
    console.log(`   Total reports in DB: ${totalReports}`)
    
    const adminUser = await User.findOne({ role: 'admin' })
    if (adminUser) {
      const adminReports = await Report.find({ userId: adminUser._id })
      console.log(`   Admin reports: ${adminReports.length}`)
    }
    
    const regularUsers = await User.find({ role: 'user' })
    let userReportCount = 0
    for (const u of regularUsers) {
      const count = await Report.countDocuments({ userId: u._id })
      userReportCount += count
    }
    console.log(`   Regular user reports: ${userReportCount}`)
    
    const orphanReports = await Report.countDocuments({ userId: null })
    console.log(`   Orphan reports (no userId): ${orphanReports}`)

    await mongoose.connection.close()
    process.exit(0)

  } catch (error) {
    console.error('❌ Error:', error)
    await mongoose.connection.close()
    process.exit(1)
  }
}

testAPIFiltering()
