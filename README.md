# Smart Bookmark App

A full-stack real-time bookmark manager built with Next.js (App Router) and Supabase.

## 🔥 Features

- 🔐 Google OAuth Authentication (Supabase Auth)
- ➕ Add Bookmarks (Title + URL)
- ❌ Delete Bookmarks
- 🔒 Bookmarks are private per user (Row Level Security)
- ⚡ Real-time updates across multiple tabs
- 🎨 Styled with Tailwind CSS
- 🚀 Ready for deployment on Vercel

---

## 🛠 Tech Stack

- Next.js (App Router)
- Supabase (Auth, Database, Realtime)
- Tailwind CSS
- TypeScript

---

## ⚙️ How It Works

- User logs in via Google OAuth.
- Supabase generates a session.
- Each bookmark is stored with `user_id`.
- Row Level Security ensures users can only access their own bookmarks.
- Supabase Realtime listens for insert/update/delete events and updates UI instantly.


🚧 Problems Faced & Solutions
1) Session was not not updating properly in multiple tabs mean when a user log in/out the another tab does not update correctly.
solution:Use of supabase.auth.OnAuthStateChange() to sync session in all tab.

3) Insert/Delete/Update not working in Real Time
solution:Enable Real Time Toggle in Table Setting.

5) when a user A is logged in tab 1 it automatically logged in tab 2 also and show the same data but as user A logged out from tab 1 then it logged out in tab 2 also which is fine but when user B is logged in it logged in both the tab but data in tab 2 is not accurate it showing data of user A? 
solution: while log out we have to update the state and store [] array so that it refetched bookmarks as auth state change.

📦 Setup Instructions:
git clone https://github.com/yourusername/smart-bookmark-app.git
1. cd smart-bookmark-app
2. npm install
3. npm run dev

Add .env:
1. NEXT_PUBLIC_SUPABASE_URL=your_url
2. NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
