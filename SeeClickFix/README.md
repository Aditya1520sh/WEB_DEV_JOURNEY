# 🏙️ SeeClickFix - Smart Civic Issue Reporting Platform# SeeClickFix - Civic Issue Reporting Platform



> **Report. Track. Fix.** Empowering citizens to make their communities better, one report at a time.A modern, full-stack web application for reporting and managing civic issues in your community. Built with Next.js 14, TypeScript, and MongoDB.



A modern, full-stack web application for reporting and managing civic issues in your community. Built with cutting-edge technologies including Next.js 14, TypeScript, MongoDB, and AI-powered assistance.## 🚀 Features



![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)- **User Authentication**: Secure signup/login with Google OAuth and email/password

![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)- **Issue Reporting**: Report civic problems with descriptions, locations, and categories

![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat&logo=mongodb)- **Admin Dashboard**: Comprehensive admin panel for managing reports and users

![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0-38B2AC?style=flat&logo=tailwind-css)- **AI Assistant**: Intelligent chatbot to help users with reporting and information

- **Responsive Design**: Beautiful glassmorphism UI that works on all devices

---- **Real-time Updates**: Live status updates on reports

- **Location Services**: GPS-based location detection and mapping

## ✨ Key Features- **Role-based Access**: Different views and permissions for users and administrators



### 🎯 For Citizens## 🛠️ Tech Stack

- **📍 Smart Location Detection**: Automatic GPS-based location with OpenStreetMap integration

- **📸 Image Upload**: Report issues with photos via Cloudinary integration- **Frontend**: Next.js 14 (App Router), React 18, TypeScript

- **🤖 AI Assistant**: Get instant help with OpenAI-powered civic chatbot- **Styling**: Tailwind CSS, Framer Motion, Radix UI

- **📊 Real-time Tracking**: Monitor your reports with live status updates- **Authentication**: NextAuth.js with Google OAuth

- **🗺️ Interactive Maps**: View issue locations on embedded OpenStreetMap- **Database**: MongoDB with Mongoose ODM

- **🌐 About City**: Dynamic city information fetched from Wikipedia & Wikidata APIs- **AI Integration**: OpenAI API

- **🎨 Beautiful UI**: Glassmorphism design with dark/light theme support- **Image Upload**: Cloudinary (configured)

- **Deployment**: Vercel-ready

### 👨‍💼 For Administrators

- **📈 Analytics Dashboard**: Comprehensive stats with charts and insights## 📋 Prerequisites

- **✅ Report Management**: Update status, assign departments, add resolution notes

- **👥 User Management**: View all users and their report history- Node.js 18+ and npm/yarn

- **🔔 Priority Handling**: Filter by status, category, and priority- MongoDB database (local or MongoDB Atlas)

- **📋 Bulk Actions**: Efficiently manage multiple reports- Google OAuth credentials

- **🏢 Department Assignment**: Route issues to appropriate civic departments- OpenAI API key

- Cloudinary account (for image uploads)

---

## 🔧 Installation & Setup

## 🛠️ Tech Stack

### 1. Clone the Repository

| Category | Technologies |

|----------|-------------|```bash

| **Frontend** | Next.js 14 (App Router), React 18, TypeScript |git clone https://github.com/yourusername/seeclickfix.git

| **Styling** | Tailwind CSS, Framer Motion, Radix UI, Lucide Icons |cd seeclickfix

| **Authentication** | NextAuth.js v4 with Google OAuth & Credentials |```

| **Database** | MongoDB Atlas with Mongoose ODM |

| **AI/ML** | OpenAI GPT-4 API for intelligent assistance |### 2. Install Dependencies

| **Media** | Cloudinary for image uploads and optimization |

| **Maps** | OpenStreetMap Nominatim for geocoding |```bash

| **APIs** | Wikipedia REST API, Wikidata API for city information |npm install

| **Deployment** | Vercel (Production-ready) |# or

yarn install

---```



## 🚀 Quick Start### 3. Environment Variables



### PrerequisitesCreate a `.env.local` file in the root directory:

- **Node.js** 18.0 or higher

- **MongoDB** (Local or Atlas cluster)```env

- **API Keys**: Google OAuth, OpenAI, Cloudinary# NextAuth Configuration

NEXTAUTH_URL=http://localhost:3000

### 1️⃣ Clone RepositoryNEXTAUTH_SECRET=your-super-secret-jwt-key-here



```bash# MongoDB

git clone https://github.com/yourusername/seeclickfix.gitMONGODB_URI=mongodb://localhost:27017/seeclickfix

cd seeclickfix# or for MongoDB Atlas:

```# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/seeclickfix



### 2️⃣ Install Dependencies# Google OAuth (Get from Google Cloud Console)

GOOGLE_CLIENT_ID=your-google-client-id

```bashGOOGLE_CLIENT_SECRET=your-google-client-secret

npm install

# or# OpenAI API

yarn installOPENAI_API_KEY=your-openai-api-key

# or

pnpm install# Cloudinary (for image uploads)

```CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name

CLOUDINARY_API_KEY=your-cloudinary-api-key

### 3️⃣ Environment SetupCLOUDINARY_API_SECRET=your-cloudinary-api-secret

```

Create a `.env.local` file in the root directory:

### 4. Run Development Server

```env

# NextAuth Configuration```bash

NEXTAUTH_URL=http://localhost:3000npm run dev

NEXTAUTH_SECRET=your-super-secret-jwt-key-minimum-32-characters# or

yarn dev

# MongoDB Atlas```

MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/seeclickfix?retryWrites=true&w=majority

Open [http://localhost:3000](http://localhost:3000) in your browser.

# Google OAuth (Get from Google Cloud Console)

GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com## 🚀 Deployment

GOOGLE_CLIENT_SECRET=your-google-client-secret

### Deploy to Vercel

# OpenAI API (Get from platform.openai.com)

OPENAI_API_KEY=sk-proj-your-openai-api-key1. **Push to GitHub**:

   ```bash

# Cloudinary (Get from cloudinary.com)   git add .

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name   git commit -m "Initial commit"

CLOUDINARY_API_KEY=your-api-key   git push origin main

CLOUDINARY_API_SECRET=your-api-secret   ```

```

2. **Deploy on Vercel**:

### 4️⃣ Run Development Server   - Visit [vercel.com](https://vercel.com)

   - Import your GitHub repository

```bash   - Add environment variables in Vercel dashboard

npm run dev   - Deploy

```

3. **Environment Variables for Production**:

Open [http://localhost:3000](http://localhost:3000) 🎉   ```env

   NEXTAUTH_URL=https://your-domain.vercel.app

---   NEXTAUTH_SECRET=your-production-secret

   MONGODB_URI=your-production-mongodb-uri

## 📁 Project Structure   GOOGLE_CLIENT_ID=your-google-client-id

   GOOGLE_CLIENT_SECRET=your-google-client-secret

```   OPENAI_API_KEY=your-openai-api-key

seeclickfix/   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name

├── app/                          # Next.js 14 App Router   CLOUDINARY_API_KEY=your-cloudinary-api-key

│   ├── api/                      # API Routes   CLOUDINARY_API_SECRET=your-cloudinary-api-secret

│   │   ├── auth/[...nextauth]/  # NextAuth configuration   ```

│   │   ├── reports/             # Report CRUD operations

│   │   ├── user/                # User management## 📊 Project Structure

│   │   ├── chat/                # AI chatbot endpoint

│   │   └── upload/              # Image upload handler```

│   ├── auth/                     # Authentication pagesseeclickfix/

│   │   ├── signin/              # Sign in page├── app/                    # Next.js 14 App Router

│   │   └── signup/              # Sign up page│   ├── api/               # API routes

│   ├── admin/                    # Admin dashboard│   ├── auth/              # Authentication pages

│   ├── dashboard/                # User dashboard│   ├── admin/             # Admin dashboard

│   ├── reports/                  # Report pages│   ├── reports/           # Report management

│   │   ├── [id]/                # Individual report details│   └── globals.css        # Global styles

│   │   ├── new/                 # Create new report├── components/            # Reusable UI components

│   │   └── page.tsx             # All reports list│   ├── ui/               # Base UI components

│   ├── about-city/               # Dynamic city information│   └── layout/           # Layout components

│   ├── page.tsx                  # Homepage├── lib/                  # Utility functions

│   ├── layout.tsx                # Root layout├── models/               # Database models

│   └── globals.css               # Global styles├── public/               # Static assets

├── components/                   # Reusable Components└── types/                # TypeScript definitions

│   ├── ui/                      # Base UI components (Button, Card, etc.)```

│   ├── layout/                  # Layout components (Header, Footer)

│   ├── ai/                      # AI Assistant component## 📱 Usage Guide

│   ├── LocationPermission.tsx   # GPS location handler

│   └── ThemeToggle.tsx          # Dark mode toggle### For Citizens

├── lib/                         # Utility Functions

│   ├── db.ts                    # MongoDB connection1. **Sign Up/Login**: Create account or sign in with Google

│   ├── auth.ts                  # NextAuth configuration2. **Report Issue**: Click "Report Issue" and fill out the form

│   └── openai.ts                # OpenAI client setup3. **Track Progress**: View your reports and their status updates

├── models/                      # Database Models4. **Get Help**: Use the AI assistant for guidance

│   ├── User.ts                  # User schema

│   └── Report.ts                # Report schema### For Administrators

├── types/                       # TypeScript Definitions

│   └── next-auth.d.ts           # NextAuth type extensions1. **Admin Access**: Login with admin privileges (create admin user in database)

├── public/                      # Static Assets2. **Dashboard**: View all reports and statistics

├── .env.local                   # Environment variables (NEVER COMMIT!)3. **Manage Reports**: Update status, assign departments, add notes

├── .gitignore                   # Git ignore rules4. **User Management**: View user activity and reports

├── next.config.js               # Next.js configuration

├── tailwind.config.ts           # Tailwind CSS config## ✅ Complete Feature List

├── tsconfig.json                # TypeScript config

└── package.json                 # Project dependencies- ✅ User & Admin Authentication

```- ✅ Civic Issue Reporting with Categories

- ✅ Real-time Issue Tracking  

---- ✅ AI-powered Assistant

- ✅ Image Upload Support (Cloudinary)

## 📖 Usage Guide- ✅ Dark/Light Theme Toggle

- ✅ Responsive Glassmorphism Design

### 🙋 For Citizens- ✅ Location Services & GPS

- ✅ Admin Dashboard with Management

1. **Sign Up/Login**- ✅ Report Status Management

   - Create account with email/password- ✅ User Role-based Access Control

   - Or sign in with Google OAuth- ✅ Search and Filter Reports

   - First-time setup: Allow location permissions- ✅ Report Details and History



2. **Report Civic Issue**## 🆘 Troubleshooting

   - Click "Report Issue" button

   - Fill in details: Title, Description, Category- Ensure all environment variables are set correctly

   - Add location (auto-detected or manual)- Check MongoDB connection string format

   - Upload photo evidence (optional)- Verify API keys are valid and have proper permissions

   - Submit and receive tracking ID- Check browser console for detailed error messages

- Make sure Google OAuth redirect URIs are configured correctly

3. **Track Your Reports**

   - View all your reports in Dashboard## 🤝 Contributing

   - Check status: Pending, In Progress, Resolved, Rejected

   - Add comments or updates1. Fork the repository

   - View resolution timeline2. Create feature branch (`git checkout -b feature/amazing-feature`)

3. Commit changes (`git commit -m 'Add amazing feature'`)

4. **AI Assistant**4. Push to branch (`git push origin feature/amazing-feature`)

   - Click chat icon (bottom-right)5. Open Pull Request

   - Ask questions about civic issues

   - Get guidance on reporting procedures## 📄 License

   - Learn about city services

This project is licensed under the MIT License.

5. **About City**

   - View your city information---

   - Population, area, and statistics

   - Government officials contact**Built with ❤️ for better communities**
   - Wikipedia description with images

### 👨‍💼 For Administrators

1. **Admin Access**
   - Login with admin role (set in MongoDB)
   - Access Admin Dashboard from navigation

2. **Manage Reports**
   - View all reports with filters
   - Update status: Assign, In Progress, Resolve, Reject
   - Assign to departments
   - Add resolution notes
   - View reporter details

3. **Analytics**
   - Total reports count
   - Resolved vs Pending ratio
   - Category distribution
   - Average resolution time

4. **User Management**
   - View all registered users
   - Check user activity
   - View user report history

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/signin` - Sign in user
- `POST /api/auth/signup` - Register new user
- `GET /api/auth/session` - Get current session

### Reports
- `GET /api/reports` - Get all reports (paginated)
- `POST /api/reports` - Create new report
- `GET /api/reports/[id]` - Get report by ID
- `PUT /api/reports/[id]` - Update report
- `DELETE /api/reports/[id]` - Delete report (admin only)

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### AI Chat
- `POST /api/chat` - Send message to AI assistant

### Upload
- `POST /api/upload` - Upload image to Cloudinary

---

## 🚀 Deployment to Vercel

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### Step 2: Deploy on Vercel

1. Visit [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: (leave default)

### Step 3: Add Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```env
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-production-secret-minimum-32-chars
MONGODB_URI=mongodb+srv://...your-atlas-connection
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
OPENAI_API_KEY=sk-proj-your-key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
```

### Step 4: Update Google OAuth

Add production URL to authorized redirect URIs:
```
https://your-domain.vercel.app/api/auth/callback/google
```

### Step 5: Deploy!

Click "Deploy" and wait for build to complete 🚀

---

## 🔐 Security Features

- ✅ JWT-based authentication with secure HttpOnly cookies
- ✅ Password hashing with bcrypt
- ✅ CSRF protection via NextAuth
- ✅ Environment variable protection
- ✅ API route protection with middleware
- ✅ Role-based access control (User/Admin)
- ✅ Input validation and sanitization
- ✅ Secure image upload with Cloudinary signed URLs

---

## 🐛 Troubleshooting

<details>
<summary><b>MongoDB Connection Error</b></summary>

**Issue**: Cannot connect to MongoDB

**Solutions**:
- Check `MONGODB_URI` format is correct
- Verify IP whitelist in MongoDB Atlas (allow 0.0.0.0/0 for development)
- Ensure database user has proper permissions
- Check if cluster is running
</details>

<details>
<summary><b>Google OAuth Not Working</b></summary>

**Issue**: OAuth redirect fails

**Solutions**:
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Check authorized redirect URIs in Google Console:
  - `http://localhost:3000/api/auth/callback/google` (dev)
  - `https://your-domain.vercel.app/api/auth/callback/google` (prod)
- Ensure `NEXTAUTH_URL` matches your current domain
</details>

<details>
<summary><b>Image Upload Fails</b></summary>

**Issue**: Cannot upload images

**Solutions**:
- Verify Cloudinary credentials
- Check `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is set
- Ensure file size is under 5MB
- Check API key permissions in Cloudinary dashboard
</details>

<details>
<summary><b>AI Assistant Not Responding</b></summary>

**Issue**: Chatbot doesn't reply

**Solutions**:
- Verify `OPENAI_API_KEY` is valid
- Check OpenAI API quota and billing
- Check browser console for error messages
- Ensure API key has GPT-4 access
</details>

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create** feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'Add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Add comments for complex logic
- Test thoroughly before submitting PR
- Update documentation if needed

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)

---

## 🙏 Acknowledgments

- **Next.js** team for amazing framework
- **Vercel** for hosting platform
- **MongoDB** for database solution
- **OpenAI** for AI capabilities
- **Cloudinary** for image management
- **OpenStreetMap** for mapping services
- **Wikipedia** for city information APIs

---

## 📊 Stats

![GitHub stars](https://img.shields.io/github/stars/yourusername/seeclickfix?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/seeclickfix?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/seeclickfix)
![GitHub license](https://img.shields.io/github/license/yourusername/seeclickfix)

---

<div align="center">
  <p><b>Built with ❤️ for better communities</b></p>
  <p>Made in India 🇮🇳</p>
</div>
