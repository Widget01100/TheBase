#!/bin/bash
# build.sh - Production build script

echo "🏗️  Building The Base for production..."
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run type check
echo "🔍 Running type check..."
npm run type-check

# Run linting
echo "🔍 Running linting..."
npm run lint

# Build the app
echo "🏗️  Building app..."
npm run build

# Create .env file for production
echo "🔧 Creating environment file..."
cat > .env.production << EOL
VITE_API_URL=https://api.thebase.co.ke
VITE_MPESA_ENVIRONMENT=production
VITE_ENABLE_AI_COACH=true
VITE_ENABLE_GAMIFICATION=true
EOL

echo ""
echo "✅ Build complete! Files are in the 'dist' folder."
echo "🚀 Ready for deployment!"
