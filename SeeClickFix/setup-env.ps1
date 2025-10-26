# SeeClickFix Environment Setup Script for Windows
# Run this in PowerShell: .\setup-env.ps1

Write-Host "🔧 Setting up SeeClickFix environment..." -ForegroundColor Blue

# Copy example file if .env.local doesn't exist
if (-Not (Test-Path ".env.local")) {
    Copy-Item ".env.example" ".env.local"
    Write-Host "✅ Created .env.local from template" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env.local already exists, skipping copy" -ForegroundColor Yellow
}

# Generate a secure NextAuth secret
$NextAuthSecret = [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

# Create the environment file content
$EnvContent = @"
# NextAuth Configuration
NEXTAUTH_SECRET=$NextAuthSecret
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
"@

# Write to .env.local
Set-Content -Path ".env.local" -Value $EnvContent

Write-Host ""
Write-Host "✅ Environment file created with secure NextAuth secret" -ForegroundColor Green
Write-Host "⚠️  Please update the other environment variables with your actual values" -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 Setup Checklist:" -ForegroundColor Cyan
Write-Host "1. Set up MongoDB Atlas database" -ForegroundColor White
Write-Host "2. Configure Google OAuth credentials" -ForegroundColor White
Write-Host "3. Get OpenAI API key" -ForegroundColor White
Write-Host "4. Set up Cloudinary account" -ForegroundColor White
Write-Host "5. Update .env.local with real values" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Then run: npm run dev" -ForegroundColor Green

Write-Host ""
Write-Host "📖 Quick Setup Links:" -ForegroundColor Cyan
Write-Host "• MongoDB Atlas: https://www.mongodb.com/atlas" -ForegroundColor Blue
Write-Host "• Google Cloud Console: https://console.cloud.google.com/" -ForegroundColor Blue  
Write-Host "• OpenAI API: https://platform.openai.com/api-keys" -ForegroundColor Blue
Write-Host "• Cloudinary: https://cloudinary.com/console" -ForegroundColor Blue