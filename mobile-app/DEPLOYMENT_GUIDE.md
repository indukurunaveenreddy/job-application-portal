# 🚀 NexHire Mobile App — Play Store & App Store Deployment Guide

NexHire is a production-grade React Native & Expo mobile application featuring **daily automated fresh job updates** (1,000+ jobs from LinkedIn and Naukri across Bangalore & Hyderabad) and instant push notifications.

---

## 📋 Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Automated Daily Jobs Architecture](#2-automated-daily-jobs-architecture)
3. [Building for Google Play Store (Android .aab)](#3-building-for-google-play-store-android-aab)
4. [Building for Apple App Store (iOS .ipa)](#4-building-for-apple-app-store-ios-ipa)
5. [Testing on Real Devices (Direct APK)](#5-testing-on-real-devices-direct-apk)
6. [Automated Store Submission Commands](#6-automated-store-submission-commands)
7. [App Store & Play Store Checklist](#7-app-store--play-store-checklist)

---

## 1. Prerequisites

### Accounts Needed:
- **Expo Account**: Free account at [expo.dev](https://expo.dev)
- **Google Play Console Account**: $25 one-time registration at [play.google.com/console](https://play.google.com/console)
- **Apple Developer Program**: $99/year registration at [developer.apple.com](https://developer.apple.com)

### CLI Tools:
From within the `mobile-app` directory:
```bash
# Login to your Expo account
npx eas login
```

---

## 2. Automated Daily Jobs Architecture

NexHire automatically updates fresh jobs on two levels:

1. **Backend Automated Scheduler (`backend/services/jobCrawler.service.js`)**:
   - Runs automatically every 24 hours.
   - Crawls & verifies up to 1,000 fresh postings from Bangalore & Hyderabad directly from official hiring portals on LinkedIn and Naukri.
   - Can also be manually triggered anytime via `POST /api/jobs/sync-daily`.

2. **Mobile App OS Background Sync (`mobile-app/src/services/backgroundSync.js`)**:
   - Registered using `expo-background-fetch` and `expo-task-manager`.
   - Wakes up in the background once every 24 hours on Android & iOS (`UIBackgroundModes: ["fetch", "remote-notification"]`).
   - Syncs the latest job pool and delivers an OS notification:
     > *"🔥 Daily Fresh Jobs Alert: 1,000+ new jobs updated today across Bangalore & Hyderabad from LinkedIn and Naukri!"*

---

## 3. Building for Google Play Store (Android .aab)

Google Play requires the **Android App Bundle (`.aab`)** format.

### Step 1: Configure Your Project ID
Run:
```bash
npx eas project:init
```
This links your Expo project ID to `app.json`.

### Step 2: Build the Production AAB Bundle
```bash
npm run build:android
# or:
npx eas build --platform android --profile production
```
- EAS will ask if you want it to generate and manage your Android Keystore (Select **Yes**).
- The cloud build will compile the Hermes JavaScript engine, native Java/Kotlin code, and generate `com.nexhire.jobportal.aab`.
- You will receive a direct download link when complete.

### Step 3: Upload to Google Play Console
1. Open [Google Play Console](https://play.google.com/console).
2. Create App: **NexHire - Job Portal**.
3. Select **Production** or **Internal Testing** track -> **Create new release**.
4. Upload the downloaded `.aab` file.
5. Fill out store listing details (Title, Short description, Screenshots, Privacy Policy).
6. Click **Submit for review**.

---

## 4. Building for Apple App Store (iOS .ipa)

Apple requires an iOS Archive (`.ipa`) signed with an Apple Distribution Certificate and Provisioning Profile.

### Step 1: Build the Production iOS Archive
```bash
npm run build:ios
# or:
npx eas build --platform ios --profile production
```
- EAS will prompt you to log in with your Apple Developer Apple ID.
- EAS automatically handles Apple Distribution Certificate and Provisioning Profile creation!
- The cloud builder builds the production `.ipa` binary ready for App Store Connect & TestFlight.

### Step 2: Upload to App Store Connect / TestFlight
You can submit directly via CLI without opening Xcode:
```bash
npm run submit:ios
# or:
npx eas submit --platform ios --profile production
```
Or use Apple Transporter app to drag-and-drop the downloaded `.ipa`.

---

## 5. Testing on Real Devices (Direct APK)

If you want to install and test the app immediately on any Android phone before store publishing:
```bash
npm run build:android:apk
# or:
npx eas build --platform android --profile preview
```
This generates a direct installable `.apk` that can be downloaded straight to an Android phone via QR code or link.

---

## 6. Automated Store Submission Commands Summary

| Task | Command |
| :--- | :--- |
| **Start Dev Server** | `npm start` |
| **Test Android Locally** | `npm run android` |
| **Test iOS Locally** | `npm run ios` |
| **Validate Bundles** | `npx expo export --platform android` / `npx expo export --platform ios` |
| **Build Play Store AAB** | `npm run build:android` |
| **Build Test Android APK** | `npm run build:android:apk` |
| **Build App Store IPA** | `npm run build:ios` |
| **Build Both Platforms** | `npm run build:all` |
| **Auto-Submit to Play Store** | `npm run submit:android` |
| **Auto-Submit to App Store** | `npm run submit:ios` |

---

## 7. App Store & Play Store Checklist

- [x] Bundle Identifier / Package Name set (`com.nexhire.jobportal`)
- [x] App Icons generated (`assets/icon.png` 1024x1024, adaptive Android foreground/background)
- [x] Splash screen configured with dark mode palette (`#0a0e1a`)
- [x] Network security config (`NSAppTransportSecurity` and Android `INTERNET`)
- [x] Background fetch & notifications permissions set (`UIBackgroundModes`, `RECEIVE_BOOT_COMPLETED`)
- [x] Clean Hermes bytecode compilation verified (0 errors)
- [x] Automated 24h job ingestion with direct company links active
