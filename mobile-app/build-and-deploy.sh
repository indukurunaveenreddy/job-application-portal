#!/bin/bash
# NexHire Mobile App - Build & Store Deployment Automation Script

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "=========================================================="
echo "   🚀 NexHire Mobile App - Play Store & App Store CLI"
echo "=========================================================="
echo "1) Build Android Play Store (.aab production bundle)"
echo "2) Build Android Standalone (.apk for testing on phones)"
echo "3) Build iOS App Store (.ipa release bundle)"
echo "4) Build Both Android & iOS in parallel"
echo "5) Submit Android to Google Play Store"
echo "6) Submit iOS to Apple App Store"
echo "7) Validate JavaScript/Hermes Bundles locally"
echo "8) Trigger Immediate Daily 1,000 Jobs Crawler Refresh"
echo "=========================================================="

read -p "Select an option [1-8]: " choice

case $choice in
  1)
    echo "📦 Building Android Production Bundle (.aab) for Play Store..."
    npx eas-cli build --platform android --profile production
    ;;
  2)
    echo "📱 Building Android APK for direct phone testing..."
    npx eas-cli build --platform android --profile preview
    ;;
  3)
    echo "🍏 Building iOS Release Bundle (.ipa) for App Store..."
    npx eas-cli build --platform ios --profile production
    ;;
  4)
    echo "🚀 Building All Platforms (Android + iOS)..."
    npx eas-cli build --platform all --profile production
    ;;
  5)
    echo "📤 Submitting to Google Play Store..."
    npx eas-cli submit --platform android --profile production
    ;;
  6)
    echo "📤 Submitting to Apple App Store Connect..."
    npx eas-cli submit --platform ios --profile production
    ;;
  7)
    echo "🔍 Validating Hermes Bundles locally..."
    npx expo export --platform android
    npx expo export --platform ios
    echo "✅ Both Android and iOS bundles compiled successfully with 0 errors!"
    ;;
  8)
    echo "🔄 Ingesting fresh 1,000 jobs from LinkedIn & Naukri..."
    curl -X POST http://localhost:5001/api/jobs/sync-daily \
      -H "Content-Type: application/json" \
      -d '{"count": 1000}'
    echo ""
    echo "✅ Ingestion complete!"
    ;;
  *)
    echo "Invalid option. Exiting."
    exit 1
    ;;
esac
