# 📱 Route Posts — Social Media Platform

<div align="center">


  ### A sleek, modern, pixel-perfect social media web application built with **React 19**, **Vite**, and **Tailwind CSS v4**.

  [![Live Demo](https://img.shields.io/badge/Live_Demo-GitHub_Pages-2563eb?style=for-the-badge&logo=github)](https://elslmawy.github.io/Social-Media-App/#/auth)
  [![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
  [![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

  ---

  ### 🌐 **[View Live Demo](https://elslmawy.github.io/Social-Media-App/#/auth)**

</div>

---

## 🌟 Overview

**Route Posts** is a full-featured, responsive social media platform designed with modern UI/UX aesthetics (glassmorphism, micro-animations, curated Slate/Blue color palettes, and fluid layouts). It connects directly to the real Route Posts REST API, providing real-time social networking capabilities with instantaneous optimistic UI updates.

---

## ✨ Key Features

### 🔐 1. Authentication & Security
- **Dual Mode (Sign In & Sign Up)**: Smooth tab switching with tailored validation.
- **Real-Time Validation**: Field-level validation on blur and form submit for email formatting, password strength requirements, and confirmed password matching.
- **Automatic Sanitization**: Handles `@` prefix stripping from usernames automatically.
- **Persistent Sessions**: JWT management via LocalStorage with Axios request interceptors and token expiry handling in `AuthContext`.

### 📰 2. Interactive Feed & Filtering
- **3-Column Responsive Layout**: Left navigation sidebar, central post feed, and right-hand suggested friends widget.
- **Category Filters**:
  - 🌐 **Feed (All)**: Discover posts across the entire platform.
  - ✨ **My Posts**: Quick filter to view all posts created by the logged-in user.
  - 🌍 **Community**: View community-wide conversations.
  - 🔖 **Saved**: View all bookmarked posts in one place.
- **Infinite / Paginated Loading**: Smooth "Load more" button pagination with end-of-feed indicators.

### ✍️ 3. Post Creation & Customization
- **Rich Post Creation**: Write updates with inline cursor-aware **Emoji Picker** (`emoji-picker-react`).
- **Media Attachments**: Image file upload with immediate thumbnail preview and removal.
- **Privacy Controls**: Select visibility per post (`Public`, `Followers`, `Only me`).
- **Post Editing & Deletion**: Modal-based post update (content & photo replacement) and deletion with confirmation dialogs.

### ❤️ 4. Engagement & Interactions
- **Optimistic Likes**: Instant like/unlike count toggling with rollback on network failure.
- **Post Sharing**: One-click sharing to personal feed.
- **Bookmarking**: Bookmark/save posts with instant feedback and sync with user profile.

### 💬 5. Complete Comments System
- **Feed Card Preview**: Displays the top/first comment directly inside the post card with a "View more comments" link.
- **Dedicated Thread (`/post/:id`)**: Full comments discussion thread with reverse chronology.
- **Add Comments with Images**: Attach photos to comments.
- **Inline Editing & Deletion**: Post owners can edit or delete comments with modal confirmations.
- **Comment Likes**: Interactive like/unlike count on every comment.

### 👥 6. Suggested Friends & Discovery
- **Search Friends**: Real-time debounced search by name or `@username`.
- **Follow / Unfollow**: Optimistic follow toggling with active followers count display.
- **Paginated Discovery**: "View more" button to explore more suggested connections.

### 🔔 7. Real-Time Notifications
- **Navbar Badge**: Live unread notification counter badge updated via polling every 30 seconds.
- **Categorized Activity**: Distinct visual icons for likes, comments, shares, and follows.
- **Filters**: Switch between *All* notifications and *Unread* notifications.
- **Quick Actions**: Click to mark as read and navigate directly to the target post, or click **"Mark all as read"**.

### 👤 8. User Profile & Account Management
- **Profile Header**: Dynamic gradient cover photo, overlapping avatar, follower/following stats, and bookmark counts.
- **Photo Uploads**: Upload profile avatar and cover images directly with live refresh.
- **Tabbed Activity**: Toggle between **My Posts** and **Saved Posts**.
- **Settings**: Secure password change with current password verification and strength enforcement.

---

## 🛠️ Tech Stack & Architecture

| Technology | Purpose |
|---|---|
| **React 19** | Component-driven architecture, custom hooks, and context state management |
| **Vite 8** | Ultra-fast development server, HMR, and optimized production bundling |
| **Tailwind CSS v4** | Modern utility-first styling with `@tailwindcss/vite` |
| **React Router DOM v7** | Hash-based routing (`HashRouter`) for seamless GitHub Pages compatibility |
| **Axios** | HTTP client with request/response interceptors for JWT authorization |
| **Lucide React** | Lightweight, pixel-perfect modern iconography |
| **React Hot Toast** | Accessible, toast notifications for success and error alerts |
| **Emoji Picker React** | Interactive emoji selection popup |
| **Oxlint** | High-performance linter ensuring clean, warning-free code |

---

## 📂 Project Structure

```text
route-posts/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Automated GitHub Pages CI/CD workflow
├── public/
│   └── route-logo.png          # App brand logo & favicon
├── src/
│   ├── components/
│   │   ├── Avatar.jsx          # User avatar with fallback handling
│   │   ├── CommentItem.jsx     # Comment bubble, inline edit, delete, like
│   │   ├── CreatePost.jsx      # Post creation form with emoji & image picker
│   │   ├── Field.jsx           # Form field wrapper with validation errors
│   │   ├── Modal.jsx           # Reusable accessible dialog modal
│   │   ├── Navbar.jsx          # Header with branding, nav links, unread badge & menu
│   │   ├── PostCard.jsx        # Complete post card with actions & comment preview
│   │   ├── ProtectedRoute.jsx  # Route guard redirecting unauthenticated users
│   │   ├── Sidebar.jsx         # Left navigation filters (Feed, My Posts, Community, Saved)
│   │   └── SuggestedFriends.jsx# Friends widget with search and follow/unfollow
│   ├── context/
│   │   └── AuthContext.jsx     # Centralized authentication & notifications state
│   ├── pages/
│   │   ├── Auth.jsx            # Sign In & Sign Up forms with validation
│   │   ├── Feed.jsx            # Main social feed layout
│   │   ├── Notifications.jsx   # Real-time activity feed
│   │   ├── PostDetails.jsx     # Single post details and full comments thread
│   │   ├── Profile.jsx         # User profile with photo uploads & bookmarks
│   │   └── Settings.jsx        # Change password page
│   ├── utils/
│   │   └── validate.js         # Form field & schema validation helpers
│   ├── api.js                  # Axios instance and complete backend API client
│   ├── App.jsx                 # App shell, routing layout, and Toaster config
│   ├── index.css               # Tailwind CSS imports and custom scrollbar styles
│   └── main.jsx                # Application root entry point
├── .gitignore
├── .oxlintrc.json              # Linter configuration
├── index.html                  # HTML entry point
├── package.json
└── vite.config.js              # Vite configuration with relative base path
```

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation & Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Elslmawy/Social-Media-App.git
   cd Social-Media-App
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173/`.

4. **Lint and code quality check:**
   ```bash
   npm run lint
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

6. **Deploy to GitHub Pages:**
   ```bash
   npm run deploy
   ```

---

- Live Application: [https://elslmawy.github.io/Social-Media-App/#/auth](https://elslmawy.github.io/Social-Media-App/#/auth)

---
