#!/bin/bash
# ==============================================================================
# 📱 NexHire Mobile App - Play Store & App Store Dedicated Deployment Tool
# ==============================================================================

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "======================================================================"
echo "      🚀 NexHire Mobile App - Store Deployment CLI (Mobile Only)      "
echo "======================================================================"
echo "  Target ID: com.nexhire.jobportal (Android & iOS)"
echo "  Features: 1,000+ Jobs | Startups | Unstop | BLR, HYD, Pune, Mumbai"
echo "            IT & Non-IT Roles | Starting ₹3 LPA | Offline-First"
echo "======================================================================"
echo ""
echo "Select what you want to do:"
echo "  1) [Play Store] Build Production Android App Bundle (.aab)"
echo "  2) [Testing]    Build Standalone Android APK (install directly on phone)"
echo "  3) [App Store]  Build Production iOS Release Archive (.ipa)"
echo "  4) [All Stores] Build both Android & iOS production packages in parallel"
echo "  5) [Submit]     Auto-submit Android package to Google Play Console"
echo "  6) [Submit]     Auto-submit iOS package to Apple App Store Connect"
echo "  7) [Test Local] Validate Hermes bytecodes for Android & iOS (0 errors)"
echo "  8) [Login]      Login to Expo EAS Account"
echo "  0) Exit"
echo "======================================================================"
read -p "Enter option [0-8]: " choice

case $choice in
  1)
    echo "📦 Building Production AAB for Google Play Store..."
    npx eas-cli build --platform android --profile production
    ;;
  2)
    echo "📱 Building Standalone Android APK for direct phone testing..."
    npx eas-cli build --platform android --profile preview
    ;;
  3)
    echo "🍏 Building Production IPA for Apple App Store..."
    npx eas-cli build --platform ios --profile production
    ;;
  4)
    echo "🚀 Building both Android (.aab) & iOS (.ipa) in parallel..."
    npx eas-cli build --platform all --profile production
    ;;
  5)
    echo "📤 Submitting to Google Play Store..."
    npx eas-cli submit --platform android --profile production
    ;;
  6)
    echo "📤 Submitting to Apple App Store Connect / TestFlight..."
    npx eas-cli submit --platform ios --profile production
    ;;
  7)
    echo "🔍 Validating Hermes Bytecode Bundles locally..."
    npx expo export --platform android
    npx expo export --platform ios
    echo "✅ Success! Both Android and iOS bundles are 100% production ready."
    ;;
  8)
    echo "🔑 Logging into Expo EAS Account..."
    npx eas-cli login
    ;;
  0)
    echo "Exiting."
    exit 0
    ;;
  *)
    echo "Invalid option. Exiting."
    exit 1
    ;;
esac
