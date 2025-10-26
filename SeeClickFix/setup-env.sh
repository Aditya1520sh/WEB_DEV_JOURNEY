# Create a local environment file
cp .env.example .env.local

# Add your environment variables to .env.local:
echo "Creating .env.local file..."

# Generate a secure secret for NextAuth
NEXTAUTH_SECRET=$(openssl rand -base64 32)

cat > .env.local << EOL
# NextAuth Configuration
NEXTAUTH_SECRET=$NEXTAUTH_SECRET
NEXTAUTH_URL=http://localhost:3000

# MongoDB Atlas (Replace with your connection string)
MONGODB_URI=your-mongodb-connection-string

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID=228554695843-h0banglicgnk8vclgp84fic3nqg72mmd.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# OpenAI API (Get from OpenAI) — placeholder only; do NOT commit real keys
OPENAI_API_KEY=YOUR_OPENAI_API_KEY

# Cloudinary (Get from Cloudinary Dashboard)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Weather API (Optional - for weather widget)
WEATHER_API_KEY=YOUR_WEATHER_API_KEY
EOL

echo "✅ .env.local created with secure NextAuth secret"
echo "⚠️  Please update the other environment variables with your actual values"
echo ""
echo "📋 Setup Checklist:"
echo "1. Set up MongoDB Atlas database"
echo "2. Configure Google OAuth credentials"
echo "3. Get OpenAI API key"
echo "4. Set up Cloudinary account"
echo "5. Update .env.local with real values"
echo ""
echo "🚀 Then run: npm run dev"