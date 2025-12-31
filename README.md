# Qawaam - Personal Islamic Productivity App

A comprehensive web app for Muslims integrating prayer tracking, Quran memorization, workout tracking, and habit management.

## Features

- 🕌 **Salah Tracking** - Prayer times, status marking, history
- 📖 **Quran Module** - Read all 114 surahs, memorization goals, revision plans, Musabaqah quizzes
- 💪 **Workout Tracker** - 2-month fat loss plan, exercise checkmarks, weight logging
- ✅ **Habit Tracking** - Daily habits with completion tracking
- 📊 **Dashboard** - XP system, streaks, progress rings
- 📱 **Persistent Data** - All progress saved to localStorage

## Quick Start (Local)

```bash
# Install dependencies
cd client
npm install

# Start development server
npm start
```

Open http://localhost:3000

---

## 🚀 Deploy to Vercel (FREE - Recommended)

### Step 1: Push to GitHub

```bash
# Initialize git (if not already)
cd /Users/abdullahinor/Desktop/Qawwam
git init
git add .
git commit -m "Initial commit"

# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/qawaam.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login with GitHub
2. Click **"New Project"**
3. Import your `qawaam` repository
4. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
5. Click **"Deploy"**

Your app will be live at `https://qawaam.vercel.app` (or similar)!

### Step 3: Access Anywhere

- Open the Vercel URL on your phone
- Add to Home Screen for app-like experience:
  - **iPhone**: Share → Add to Home Screen
  - **Android**: Menu → Add to Home Screen

---

## 🌐 Alternative: Deploy to Netlify (FREE)

1. Go to [netlify.com](https://netlify.com) and login with GitHub
2. Click **"New site from Git"**
3. Select your repository
4. Build settings:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/build`
5. Click **"Deploy site"**

---

## 📱 Progressive Web App (PWA)

To make it installable on your phone:

1. Open your deployed URL in Chrome/Safari
2. You'll see "Add to Home Screen" prompt
3. Tap to install - it will work like a native app!

---

## Data Persistence

All your data is saved in your browser's localStorage:
- Prayer history
- Quran memorization progress
- Quiz scores
- Workout logs
- Weight history
- XP and streaks

**Note**: Data is stored per-device. To sync across devices, you would need to add a backend database (future feature).

---

## Tech Stack

- **Frontend**: React.js
- **Styling**: CSS-in-JS
- **APIs**: AlQuran.cloud (Quran data), AlAdhan (Prayer times)
- **Storage**: localStorage
- **Deployment**: Vercel/Netlify

---

## Project Structure

```
qawaam/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # App state management
│   │   ├── pages/          # Main pages
│   │   └── styles/         # Global styles
│   └── package.json
├── server/                 # Optional backend (not needed for deployment)
└── README.md
```

---

## License

Personal use only.
