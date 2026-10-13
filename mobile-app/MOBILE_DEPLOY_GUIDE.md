# 📱 Mobile App Deployment Guide: Google Play Store & Apple App Store

This guide details how to build, test, and publish **only the mobile app** (`mobile-app`) to the **Google Play Store** and **Apple App Store**.

---

## 🎯 Quick Start (One Command)

From inside the `mobile-app` directory:
```bash
cd "mobile-app"
./mobile-deploy.sh
```

---

## 📦 Store Packaging Commands

| Target | Command | Output Format | Purpose |
| :--- | :--- | :--- | :--- |
| **Google Play Store** | `npm run build:android` | `.aab` (Android App Bundle) | Official upload format for Google Play Console |
| **Direct Phone Testing** | `npm run build:android:apk` | `.apk` (Direct installer) | Test immediately on real Android phones |
| **Apple App Store** | `npm run build:ios` | `.ipa` (iOS Archive) | Official release archive for TestFlight & App Store |
| **Both Stores** | `npm run build:all` | `.aab` + `.ipa` | Parallel cloud build for both platforms |
| **Submit to Google Play** | `npm run submit:android` | Direct upload | Pushes binary to Google Play Console |
| **Submit to App Store** | `npm run submit:ios` | Direct upload | Pushes binary to App Store Connect / TestFlight |

---

## 🛠️ Step-by-Step Store Publishing Instructions

### 1. Google Play Store Deployment (Android)

1. **Sign in to EAS**:
   ```bash
   npx eas login
   ```
2. **Build the Production Bundle**:
   ```bash
   npm run build:android
   ```
   - When asked: *"Generate a new Android Keystore?"*, select **Yes**.
   - EAS cloud compiles the release and provides a direct download link for `com.nexhire.jobportal.aab`.
3. **Upload to Google Play Console**:
   - Go to [play.google.com/console](https://play.google.com/console).
   - Select your app -> **Production** (or **Internal testing**).
   - Click **Create new release** and drag-and-drop the `.aab` bundle.
   - Enter release notes and click **Review release** -> **Start rollout**.

---

### 2. Apple App Store Deployment (iOS)

1. **Build the Production iOS Archive**:
   ```bash
   npm run build:ios
   ```
   - EAS will ask you to authenticate with your Apple Developer account.
   - It automatically generates the Apple Distribution Certificate and Provisioning Profile.
   - Generates the signed `.ipa` binary ready for App Store Connect.
2. **Upload to App Store Connect / TestFlight**:
   ```bash
   npm run submit:ios
   ```
   - Or upload using Apple's official **Transporter** app by dragging the `.ipa` into it.
3. **Release in App Store Connect**:
   - Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com).
   - Select **NexHire - Job Portal** -> Select the uploaded build from TestFlight.
   - Add screenshots, description, and privacy policy.
   - Click **Submit for Review**.

---

## 🔒 Standalone Offline-First Architecture

The mobile app includes an embedded fallback cache (`src/services/jobService.js`) so:
- **Immediate Store Approval**: Reviewers from Google and Apple can test the app immediately without requiring a local development backend.
- **Offline Reliability**: Even without internet connection, all 1,000+ jobs across Bangalore, Hyderabad, Pune, Mumbai, LinkedIn, Naukri, Unstop, and Startups load instantly.
- **Background Daily Sync**: When internet is available, silent background tasks update the job feed automatically every 24 hours and trigger local push notifications.

---

## ✅ App Metadata Summary

- **App Name**: `NexHire - Job Portal`
- **Package / Bundle ID**: `com.nexhire.jobportal`
- **Version**: `2.0.0` (Build 1)
- **App Icons**: 1024x1024 adaptive icons (`assets/icon.png`, `assets/android-icon-foreground.png`, `assets/android-icon-background.png`)
- **Theme**: Dark mode palette (`#0a0e1a`) with glassmorphism
- **Permissions**: Internet, Network State, Boot Completed, Exact Alarms, iOS Background Fetch
