# Deep Breath - Android Native App Setup Guide

## ✅ Phase 1-2: COMPLETED
Capacitor has been installed and configured with mobile UX optimizations.

## 📱 Phase 3: Assets & Permissions

### Icon & Splash Screen Setup

1. **App Icon:**
   - Create a 1024x1024px PNG icon
   - Place it in: `android/app/src/main/res/`
   - Or use: `npx capacitor-assets generate --android`
   - Recommended: Use Android Asset Studio for perfect icons

2. **Splash Screen:**
   - Create a 2732x2732px PNG splash image
   - Place in: `android/app/src/main/res/drawable/splash.png`
   - The configuration in `capacitor.config.ts` will handle the rest

### Permissions Setup

Your `AndroidManifest.xml` needs these permissions for ImageUpload:

```xml
<!-- Camera Permission -->
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera" android:required="false" />

<!-- Storage Permissions -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />

<!-- Internet (already included but verify) -->
<uses-permission android:name="android.permission.INTERNET" />
```

**Location:** `android/app/src/main/AndroidManifest.xml`

---

## 🚀 Phase 4: Production Build Instructions

### Step 1: Initial Setup (First Time Only)

```bash
# Install dependencies
npm install

# Build the React app
npm run build

# Add Android platform (first time only)
npx cap add android

# Sync web assets to Android
npx cap sync android
```

### Step 2: Regular Development Build

Every time you make changes:

```bash
# Build React app
npm run build

# Sync changes to Android
npx cap sync android

# Open in Android Studio
npx cap open android
```

### Step 3: Run on Emulator/Device

```bash
# Quick run (auto-selects device)
npx cap run android

# Or open Android Studio and run from there
npx cap open android
```

### Step 4: Generate Signed APK/AAB for Google Play

1. **Open Android Studio:**
   ```bash
   npx cap open android
   ```

2. **Generate Signed Bundle:**
   - Go to: `Build` → `Generate Signed Bundle / APK`
   - Select: `Android App Bundle (AAB)` ✅
   - Click `Next`

3. **Create/Select Keystore:**
   - If first time: Click `Create new...`
   - Choose a secure location and password
   - Fill in the details (Country: IR for Iran)
   - **CRITICAL:** Save your keystore file and passwords securely!

4. **Build Configuration:**
   - Build Variant: `release`
   - Signature Versions: ✅ V1 and ✅ V2
   - Click `Finish`

5. **Locate Your AAB:**
   - After build completes, click `locate` in the popup
   - File will be at: `android/app/release/app-release.aab`

6. **Upload to Google Play Console:**
   - Go to: https://play.google.com/console
   - Create new app or select existing
   - Upload the `app-release.aab` file
   - Complete store listing with screenshots and descriptions

---

## 🎯 Quick Reference Commands

```bash
# Full rebuild and sync
npm run build && npx cap sync android

# Open Android Studio
npx cap open android

# Run on device/emulator
npx cap run android

# Update native dependencies
npx cap update android

# Clean build (if issues occur)
cd android && ./gradlew clean && cd ..
npm run build && npx cap sync android
```

---

## 🔧 Troubleshooting

### Build Fails:
```bash
cd android
./gradlew clean
cd ..
npm run build
npx cap sync android
```

### Android Studio Not Detecting Device:
- Enable USB Debugging on your phone (Developer Options)
- Install proper USB drivers for your device

### Permissions Not Working:
- Check `AndroidManifest.xml` has all required permissions
- Run `npx cap sync android` after manifest changes
- Rebuild the app in Android Studio

---

## 📦 Final Checklist Before Release

- [ ] App icon (1024x1024px) added
- [ ] Splash screen (2732x2732px) added
- [ ] All permissions added to AndroidManifest.xml
- [ ] Tested on real Android device
- [ ] Tested on Android emulator
- [ ] All features working (Camera, Storage, etc.)
- [ ] Signed AAB generated
- [ ] Google Play listing prepared
- [ ] Privacy Policy URL ready
- [ ] App tested in release mode (not just debug)

---

## 🎨 Luxury Experience Checklist

- ✅ Safe Area handling (notch/dynamic island)
- ✅ Hardware back button (smart navigation)
- ✅ Zoom disabled (no accidental zooming)
- ✅ Native feel (smooth transitions)
- ✅ RTL support maintained
- ✅ Splash screen configured
- ✅ Status bar styled

Your app is now ready to feel like a true native Android experience! 🚀
