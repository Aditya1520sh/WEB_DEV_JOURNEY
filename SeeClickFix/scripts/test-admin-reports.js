const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const MONGODB_URI = 'mongodb+srv://Aditya1250ssh:zmVa6cp674sOrXI9@cluster0.zxpoq9m.mongodb.net/seeclickfix'

// User Schema
const UserSchema = new mongoose.Schema({}, { strict: false })
const User = mongoose.model('User', UserSchema)

// Report Schema
const ReportSchema = new mongoose.Schema({}, { strict: false })
const Report = mongoose.model('Report', ReportSchema)

async function testAdminAndReports() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')

    // Test admin user
    console.log('🔍 Testing Admin User...')
    const admin = await User.findOne({ username: 'admin' })
    
    if (!admin) {
      console.log('❌ Admin user not found!\n')
      process.exit(1)
    }

    console.log('✅ Admin user found!')
    console.log('   Username:', admin.username)
    console.log('   Email:', admin.email)
    console.log('   Role:', admin.role)
    console.log('   ID:', admin._id.toString())

    // Test password
    console.log('\n🔐 Testing Admin Password...')
    const isPasswordCorrect = await bcrypt.compare('admin123', admin.password)
    console.log('   Password "admin123":', isPasswordCorrect ? '✅ CORRECT' : '❌ WRONG')

    // Test reports
    console.log('\n📊 Testing Reports...')
    const allReports = await Report.find({})
    console.log('   Total reports in database:', allReports.length)

    if (allReports.length > 0) {
      console.log('\n📋 Reports Details:')
      allReports.forEach((report, index) => {
        console.log(`\n   Report ${index + 1}:`)
        console.log('   - ID:', report.reportId)
        console.log('   - Type:', report.problemType)
        console.log('   - Status:', report.status)
        console.log('   - Priority:', report.priority)
        console.log('   - Description:', report.description.substring(0, 50) + '...')
        console.log('   - Address:', report.address)
        console.log('   - User ID:', report.userId)
        console.log('   - Coordinates:', report.coordinates)
      })

      // Test admin's reports
      console.log('\n🔍 Admin\'s Reports:')
      const adminReports = await Report.find({ userId: admin._id })
      console.log('   Reports created by admin:', adminReports.length)
    }

    console.log('\n✅ All tests completed!')
    await mongoose.connection.close()
    process.exit(0)

  } catch (error) {
    console.error('❌ Error:', error)
    await mongoose.connection.close()
    process.exit(1)
  }
}

testAdminAndReports()
