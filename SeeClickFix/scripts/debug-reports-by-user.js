const mongoose = require('mongoose')

const MONGODB_URI = 'mongodb+srv://Aditya1250ssh:zmVa6cp674sOrXI9@cluster0.zxpoq9m.mongodb.net/seeclickfix'

async function debugReports() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }))
    const Report = mongoose.model('Report', new mongoose.Schema({}, { strict: false }))

    // Get all users
    const users = await User.find({})
    console.log(`👥 Total Users: ${users.length}\n`)

    for (const user of users) {
      console.log(`\n📋 User: ${user.name} (${user.username})`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   User ID: ${user._id}`)
      
      // Count reports for this user
      const userReports = await Report.find({ userId: user._id })
      console.log(`   Reports: ${userReports.length}`)
      
      if (userReports.length > 0) {
        userReports.forEach((report, idx) => {
          console.log(`     ${idx + 1}. ${report.reportId} - ${report.problemType} (${report.status})`)
        })
      }
    }

    // Check for reports without userId
    const orphanReports = await Report.find({ userId: null })
    if (orphanReports.length > 0) {
      console.log(`\n\n🚨 Orphan Reports (no userId): ${orphanReports.length}`)
      orphanReports.forEach(report => {
        console.log(`   - ${report.reportId}: ${report.problemType}`)
      })
    }

    // Check for reports with string userId (Google OAuth)
    const allReports = await Report.find({})
    const stringUserIdReports = allReports.filter(r => r.userId && typeof r.userId === 'string')
    if (stringUserIdReports.length > 0) {
      console.log(`\n\n📝 Reports with String userId (Google OAuth): ${stringUserIdReports.length}`)
      stringUserIdReports.forEach(report => {
        console.log(`   - ${report.reportId}: userId = ${report.userId}`)
      })
    }

    await mongoose.connection.close()
    process.exit(0)

  } catch (error) {
    console.error('❌ Error:', error)
    await mongoose.connection.close()
    process.exit(1)
  }
}

debugReports()
