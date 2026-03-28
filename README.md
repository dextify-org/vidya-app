<h1 align="center">VIDYA — Mobile App</h1>

<p align="center">
  <strong>Android &amp; iOS client for the VIDYA self-hosted media platform</strong>
</p>

<p align="center">
  <a href="https://github.com/dextify-org/vidya-app/blob/main/LICENSE.txt">
    <img alt="License: GPL v3" src="https://img.shields.io/badge/License-GPLv3-blue.svg" />
  </a>
  <a href="https://github.com/dextify-org/vidya-app/releases">
    <img alt="GitHub release" src="https://img.shields.io/github/v/release/dextify-org/vidya-app?include_prereleases" />
  </a>
  <img alt="Platform" src="https://img.shields.io/badge/platform-Android%20%7C%20iOS-green" />
  <img alt="Capacitor" src="https://img.shields.io/badge/Capacitor-7-119EFF?logo=capacitor" />
  <a href="https://github.com/dextify-org/vidya-app/issues">
    <img alt="GitHub issues" src="https://img.shields.io/github/issues/dextify-org/vidya-app" />
  </a>
</p>

---

## About

This repository contains the **VIDYA mobile client** — an Android and iOS app built with [Capacitor 7](https://capacitorjs.com/) and React 18. It connects to a self-hosted [VIDYA server](https://github.com/dextify-org/vidya) running on your local network or any reachable host.

> **This app requires a running VIDYA server.**
> See the [VIDYA server repository](https://github.com/dextify-org/vidya) to set one up.

---

## Install

<p>
  <a href="https://play.google.com/store/apps/details?id=media.vidya.app"><img alt="Get it on Google Play" src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" height="60" style="vertical-align:middle" /></a><a href="https://apps.apple.com/app/vidya/id0000000000"><img alt="Download on the App Store" src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" height="60" style="margin-left:8px;vertical-align:middle" /></a>
</p>

> Store listings are coming soon. Until then, use the options below.

### Android

Download the latest APK from the [Releases](https://github.com/dextify-org/vidya-app/releases) page and install it on your device.

> You may need to enable **Install from unknown sources** in your device settings.

### iOS

iOS builds must be compiled from source using Xcode. See [Building for iOS](#building-for-ios) below.

---

## Connecting to Your Server

On first launch the app will prompt for a server address. Enter the IP or hostname of the machine running VIDYA, including the port:

```
http://192.168.1.10:31415
```

The address is saved in the app and can be changed later from the settings screen.

---

## Building from Source

### Prerequisites

| Tool           | Version                      |
| -------------- | ---------------------------- |
| Node.js        | 20+                          |
| npm            | 10+                          |
| Android Studio | Latest stable                |
| JDK            | 17+                          |
| Xcode          | 15+ (macOS only, iOS builds) |
| CocoaPods      | Latest (iOS builds)          |

### Setup

```bash
git clone https://github.com/dextify-org/vidya-app.git
cd vidya-app
npm install
```

---

### Building for Android

**1. Build the React web app**

```bash
npm run build
```

**2. Sync with Capacitor**

```bash
npx cap sync android
```

**3a. Open in Android Studio (recommended)**

```bash
npx cap open android
```

Then: **Build → Generate Signed Bundle / APK**

**3b. Build a debug APK from the terminal**

```bash
cd android
./gradlew assembleDebug
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`

**3c. Build a release APK from the terminal**

```bash
cd android
./gradlew assembleRelease
```

> A keystore is required for release builds. Configure it in `android/app/build.gradle` under `signingConfigs`.

---

### Building for iOS

> macOS with Xcode 15+ is required.

**1. Build the React web app**

```bash
npm run build
```

**2. Sync with Capacitor**

```bash
npx cap sync ios
```

**3. Open in Xcode**

```bash
npx cap open ios
```

In Xcode:

- Select your development team under **Signing & Capabilities**
- Verify the Bundle Identifier is `media.vidya.app`
- Choose **Product → Archive** to create a distributable build

---

### Live Reload (Development)

To run the app against a local dev server with hot reload:

```bash
npm start   # starts React dev server on :3000
```

Then update `capacitor.config.ts` to point to your machine's IP:

```ts
server: {
  url: "http://192.168.1.x:3000",
  cleartext: true,
}
```

Then sync and run:

```bash
npx cap sync
npx cap run android   # or ios
```

> Revert `capacitor.config.ts` before creating a production build.

---

## Tech Stack

| Library                    | Version | Purpose                   |
| -------------------------- | ------- | ------------------------- |
| React                      | 18      | UI framework              |
| React Router               | 6       | Client-side routing       |
| Capacitor                  | 7       | Native Android/iOS bridge |
| Framer Motion              | 11      | Animations                |
| React Chart.js 2           | 5       | Dashboard charts          |
| Axios                      | 1       | HTTP client               |
| capacitor-plugin-safe-area | 4       | Safe area insets          |

---

## Project Structure

```
vidya-app/
├── src/
│   ├── api/              ← Axios instance configuration
│   ├── assets/           ← Fonts, images, icons
│   ├── components/       ← Shared UI components
│   ├── context/          ← React context (Auth, etc.)
│   ├── App.js            ← Root component and routing
│   └── index.js          ← Entry point
├── public/               ← HTML shell
├── android/              ← Android native project (Capacitor)
├── ios/                  ← iOS native project (Capacitor)
└── capacitor.config.ts   ← Capacitor configuration
```

---

## Contributing

1. Fork this repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request against `main`

**Bug reports:** [GitHub Issues](https://github.com/dextify-org/vidya-app/issues)

---

## Related Repositories

| Repo                                                              | Description                                        |
| ----------------------------------------------------------------- | -------------------------------------------------- |
| [dextify-org/vidya](https://github.com/dextify-org/vidya)         | VIDYA server + web client (Docker, Windows, Linux) |
| [dextify-org/vidya-app](https://github.com/dextify-org/vidya-app) | This repository — Android & iOS mobile client      |

---

## License

VIDYA App is free software licensed under the **GNU General Public License v3.0**.

You may redistribute and/or modify it under the terms of the GPL as published by the Free Software Foundation. This program is distributed **without any warranty**. See the [LICENSE](./LICENSE.txt) file or <https://www.gnu.org/licenses/> for details.

Copyright © 2026 [DEXTIFY](https://github.com/dextify-org)
