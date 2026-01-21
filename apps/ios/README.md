# ADHD Focus iOS App

Native SwiftUI app for ADHD Focus (beatyour8.com)

## Requirements

- Xcode 15+
- iOS 17.0+
- [XcodeGen](https://github.com/yonaskolb/XcodeGen) (for generating .xcodeproj)

## Setup

### 1. Install XcodeGen (if not installed)

```bash
brew install xcodegen
```

### 2. Generate Xcode Project

```bash
cd apps/ios
xcodegen generate
```

This creates `ADHDFocus.xcodeproj`

### 3. Open in Xcode

```bash
open ADHDFocus.xcodeproj
```

### 4. Configure Signing (Personal Team - FREE)

1. In Xcode, select the project in the navigator
2. Go to "Signing & Capabilities" tab
3. Team: Select your **Personal Team** (your Apple ID)
4. Bundle Identifier: Change to something unique, e.g., `com.yourname.adhdfocus`

### 5. Install on iPhone (without Developer Account)

1. Connect iPhone via USB
2. Trust the computer on iPhone if prompted
3. Select your iPhone as the build target
4. Press `Cmd + R` to build and run
5. On iPhone: Settings → General → VPN & Device Management
6. Trust your developer certificate

**Note:** App expires after 7 days and needs to be reinstalled.

## Project Structure

```
ADHDFocus/
├── ADHDFocusApp.swift     # App entry point
├── ContentView.swift       # Main view with auth logic
├── Models/
│   ├── Task.swift         # Task model
│   ├── Project.swift      # Project model
│   └── User.swift         # User model
├── Views/
│   ├── Auth/
│   │   ├── LoginView.swift
│   │   └── SignupView.swift
│   ├── Today/
│   │   └── TodayView.swift
│   ├── Inbox/
│   │   └── InboxView.swift
│   └── Components/
│       ├── TaskRow.swift
│       └── AddTaskSheet.swift
├── Services/
│   ├── APIClient.swift    # API client for beatyour8.com
│   ├── AuthManager.swift  # Auth state management
│   └── TaskStore.swift    # Task state management
└── Assets.xcassets/       # App icons, colors
```

## Features

- [x] Login / Signup
- [x] Today view with task list
- [x] Inbox with quick add
- [x] Complete/uncomplete tasks
- [x] Swipe actions (delete, move to today/inbox)
- [x] Pull to refresh
- [ ] Scheduled view
- [ ] Projects
- [ ] Focus timer
- [ ] Settings

## API

Connects to `https://beatyour8.com/api`

Auth token stored in iOS Keychain for security.
