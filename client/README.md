# 🚀 JobStack - Your Career Command Center

JobStack is a high-performance, premium job search and application management system built with **React, Vite, Node.js, and MongoDB**.

## 🎨 Premium Maroon Theme
JobStack features a sophisticated **Executive Maroon (#840032)** design system, optimized for clarity and focus.

## 🌟 Key Features
- 🔍 **Real-Time Job Discovery** — Powered by JSearch (RapidAPI). Aggregate live results from LinkedIn, Indeed, Glassdoor, and more.
- ✅ **The Protocol (Checklist)** — A dynamic, persistent 10-step guided checklist to ensure every application is high-quality.
- 📊 **Pipeline (Job Tracker)** — Manage your applications through different stages (Applied, Interview, Offer, etc.) with real-time status updates.
- 🔔 **Instant Feedback** — Global toast notifications using `Sonner` for all system actions.
- 🔐 **Secure Auth** — JWT-based authentication with protected routes.

---

## 🖥️ Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- RapidAPI Key ([JSearch](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch))

### 2. Installation

#### Backend
```bash
cd server
npm install
# Create .env file with:
# MONGO_URI=...
# JWT_SECRET=...
# RAPID_API_KEY=...
npm run dev
```

#### Frontend
```bash
cd client
npm install
npm run dev
```

### 3. Open your browser
Navigate to `http://localhost:5173`

---

## 🏗️ Technical Stack
- **Frontend**: React, Vite, TailwindCSS (Theme-Driven), Zustand, Sonner, Lucide-React.
- **Backend**: Node.js, Express, Mongoose.
- **Database**: MongoDB.
- **API**: JSearch (RapidAPI Integration).

---

## 🚀 Future Roadmap
- [ ] AI Resume Tailoring (Gemini/Claude Integration)
- [ ] AI Interview Prep Bot
- [ ] Visual Analytics Dashboard
- [ ] Email Follow-up Reminders

---

## 📄 License
MIT
