const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://Aditya1250ssh:zmVa6cp674sOrXI9@cluster0.zxpoq9m.mongodb.net/seeclickfix'

// User Schema (simplified)
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  username: String,
  password: String,
  city: String,
  address: String,
  role: String
})

const User = mongoose.models.User || mongoose.model('User', UserSchema)

async function checkAdmin() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')

    // Find admin user
    const admin = await User.findOne({ username: 'admin' })
    
    if (!admin) {
      console.log('❌ Admin user NOT found in database!')
      console.log('\nTrying to find ANY admin...')
      const anyAdmin = await User.findOne({ role: 'admin' })
      if (anyAdmin) {
        console.log('Found admin:', {
          username: anyAdmin.username,
          email: anyAdmin.email,
          role: anyAdmin.role
        })
      } else {
        console.log('No admin users found in database at all!')
      }
      process.exit(1)
    }

    console.log('✅ Admin user found!')
    console.log('Username:', admin.username)
    console.log('Email:', admin.email)
    console.log('Role:', admin.role)
    console.log('City:', admin.city)
    
    // Test password
    const testPassword = 'admin123'
    const isPasswordValid = await bcrypt.compare(testPassword, admin.password)
    
    console.log('\n🔐 Password Test:')
    console.log('Testing password: admin123')
    console.log('Result:', isPasswordValid ? '✅ CORRECT' : '❌ WRONG')
    
    if (!isPasswordValid) {
      console.log('\n⚠️ Password mismatch! Stored hash:')
      console.log(admin.password.substring(0, 30) + '...')
    }

    // Get all users count
    const totalUsers = await User.countDocuments()
    console.log('\n📊 Total users in database:', totalUsers)

    await mongoose.connection.close()
    process.exit(0)

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

checkAdmin()
