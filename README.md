# 🎯 ADHD Focus

A task management app designed specifically for people with ADHD. Built to reduce cognitive load, support executive function, and make productivity achievable.

## ✨ Key Features

- **🎯 One Task Focus** - Show only the current task, hide distractions
- **⚡ Energy Matching** - Tag tasks by energy required (low/medium/high)
- **📊 Must/Should/Want** - Simple prioritization system
- **🚫 WIP Limit** - Max 3 tasks per day by default
- **🍅 Pomodoro Timer** - Built-in focus sessions
- **🔥 Streaks** - Dopamine rewards for completion
- **📥 Quick Capture** - Brain dump inbox, process later

## 🛠 Tech Stack

- **Frontend**: Expo (React Native) - iOS, Android, Web
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **State**: Zustand
- **Monorepo**: Turborepo
- **Language**: TypeScript

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Supabase account (free tier works)

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/adhd-focus.git
cd adhd-focus

# Install dependencies
npm install

# Set up environment variables
cp apps/mobile/.env.example apps/mobile/.env
# Edit .env with your Supabase credentials
```

### Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Run the migration file: `supabase/migrations/001_initial_schema.sql`
4. Copy your project URL and anon key to `.env`

### Running the App

```bash
# Start the mobile app
npm run mobile

# Or run with Expo directly
cd apps/mobile
npx expo start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Press `w` for web browser
- Scan QR code with Expo Go app on your phone

## 📁 Project Structure

```
adhd-focus/
├── apps/
│   └── mobile/          # Expo app (iOS, Android, Web)
├── packages/
│   └── shared/          # Shared types, constants, utils
├── supabase/
│   └── migrations/      # Database migrations
└── CLAUDE.md            # AI assistant context
```

## 🎨 Design Philosophy

1. **Minimal UI** - Every element must earn its place
2. **Reduce Decisions** - Smart defaults, auto-prioritization
3. **Instant Feedback** - Visual response to every action
4. **Forgiving UX** - Easy undo, no data loss
5. **Offline-first** - Works without internet

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines first.

## 📄 License

MIT License - feel free to use this for your own projects.

---

Built with 💜 for the ADHD community
