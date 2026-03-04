<p align="center">
  <img src="public/icon.png" width="120" alt="Muajjin App Icon">
</p>

<h1 align="center">Muajjin</h1>

<p align="center">
Open source, privacy-focused, offline-first Salat & Saum times companion.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-blue" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-7-purple" alt="Vite">
  <img src="https://img.shields.io/badge/Capacitor-8-red" alt="Capacitor">
  <img src="https://img.shields.io/badge/Android-green" alt="Android">
</p>

---

## Overview

**Muajjin** is a lightweight, privacy-friendly Islamic Salat & Saum times app built with modern web technologies and packaged as a native Android application using Capacitor.

Times are calculated locally on the device—no tracking, no remote APIs required.

## Philosophy

This app is designed with a **minimal feature philosophy**. The focus is intentionally narrow:

- ✅ Salat times
- ✅ Saum times (Suhoor/Iftar)

Any additional features beyond these core functions will **not** be implemented. The goal is to keep the app simple, lightweight, and focused on its essential purpose.

---

## Features

- 🕌 Accurate Salat time calculation based on location
- 📍 Automatic GPS location with IP-based fallback
- ⏰ Current Salat highlighting and next Salat countdown
- 🌙 Suhoor and Iftar times for Saum
- 📅 Hijri date display
- 🎨 Automatic light and dark theme support
- 📱 Native Android app via Capacitor

---

## Getting Started

### Install Dependencies

```bash
bun install
```

### Development

```bash
bun run dev
```

### Production Build

```bash
bun run build
```

---

## Android Build

<details>
<summary><strong>Signing, APK Build, and Reproducible Verification</strong></summary>

### Keystore Setup

Only required if you want to produce a signed `release` APK yourself.

1. Place your keystore file in:

```
android/app/
```

2. Create or edit `android/local.properties`:

```properties
keystore.file=app/your-keystore.keystore
keystore.password=your_password
keystore.key.alias=your_alias
keystore.key.password=your_key_password
```

### Build APK

```bash
# Debug APK (larger, faster build)
bun run android:build

# Release APK (optimized, smaller)
bun run android:release

# GitHub Release APK (includes update checker)
bun run android:release:github
```

**APK Output Directory**

```
android/app/build/outputs/apk/
```

### Reproducible: Verify a GitHub Release APK (Recommended)

This verifies the published GitHub Release APK matches the source code for the release tag (no keystore needed).

```bash
git checkout vX.Y.Z

# Optional: build a reproducible APK locally
bun run reproducible:build -g vX.Y.Z -m github

bun run reproducible:verify -a ~/Downloads/muajjin-X.Y.Z.apk -g vX.Y.Z -m github
```

GitHub releases include `reproducible-checksums.txt` as a release asset:

```bash
sha256sum -c reproducible-checksums.txt
```

**Note**: Your _locally-built_ APK checksum may differ due to signing. Use `reproducible:verify` to compare APK contents.

</details>

---

## Contributing

Contributions are welcome! However, please note that this project follows a **minimal feature philosophy**.

Before proposing or implementing any new features, please **open a discussion** first to talk about it. Features that fall outside the core scope (Salat times and Saum times) will not be accepted.

Bug fixes, performance improvements, and localization/translation contributions are always appreciated.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
