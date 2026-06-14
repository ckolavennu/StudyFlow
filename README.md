# StudyFlow

StudyFlow is a modern, multi-user assignment tracker built with **SvelteKit**, **TypeScript**, **Tailwind CSS**, **Firebase Authentication**, **Cloud Firestore**, and **Vercel**.

It helps students manage assignments with private accounts, live deadline countdowns, subtasks, checklist progress, filters, sorting, urgency-based task styling, and an in-app notification center.

## Live App

Add your deployed Vercel link here:

```txt
https://your-studyflow-link.vercel.app
```

## Features

- Email/password registration and login
- Protected dashboard visible only after authentication
- User-specific Firestore paths
- Realtime assignment list using Firestore listeners
- Assignment creation with title, description, and deadline
- Countdown modal with days, hours, minutes, and seconds remaining
- Journey progress bar based on creation time and deadline
- Subtasks checklist inside each assignment
- Assignment and subtask editing
- Complete/incomplete toggles
- Filters for All, Active, Completed, Overdue, and Due Soon
- Sorting by nearest deadline, newest first, oldest first, and completed last
- Urgency styling for overdue, due today, due soon, and completed tasks
- In-app notification center for overdue and upcoming deadlines
- User profile records for future superadmin analytics
- Custom glassmorphism confirmation dialog
- Dark gradient interface with frosted-glass cards

## Notification System

StudyFlow currently includes an in-app notification center. It automatically highlights:

```txt
Overdue assignments
Assignments due today
Assignments due within the next few days
```

The notification bell appears in the dashboard header. Clicking a notification opens the relevant assignment countdown modal.

Future notification upgrades can include:

```txt
Email reminders using Resend
Scheduled checks using Vercel Cron
Browser push notifications using Firebase Cloud Messaging or OneSignal
```

## Superadmin Preparation

StudyFlow creates a safe user profile document when a user registers, logs in, or restores an existing session.

Profile path:

```txt
/artifacts/{appId}/userProfiles/{userId}
```

Profile fields:

```txt
uid
name
email
createdAt
lastLoginAt
assignmentCount
completedCount
activeCount
overdueCount
```

These profile records will be used by the future superadmin dashboard.

## Tech Stack

```txt
SvelteKit
TypeScript
Tailwind CSS
Firebase Authentication
Cloud Firestore
Lucide Svelte icons
Vercel
```

## Firestore Data Structure

StudyFlow stores each user's assignment data separately:

```txt
/artifacts/{appId}/users/{userId}/assignments/{assignmentId}
```

Subtasks are stored under each assignment:

```txt
/artifacts/{appId}/users/{userId}/assignments/{assignmentId}/subtasks/{subtaskId}
```

User profile records are stored separately for future admin analytics:

```txt
/artifacts/{appId}/userProfiles/{userId}
```

## Firestore Security Rules

Use these rules in Firebase Console → Firestore → Rules:

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/{appId}/users/{userId}/assignments/{assignmentId} {
      allow read, create, update, delete: if request.auth != null && request.auth.uid == userId;

      match /subtasks/{subtaskId} {
        allow read, create, update, delete: if request.auth != null && request.auth.uid == userId;
      }
    }

    match /artifacts/{appId}/userProfiles/{profileUserId} {
      allow read: if request.auth != null && request.auth.uid == profileUserId;
      allow create, update: if request.auth != null && request.auth.uid == profileUserId;
      allow delete: if false;
    }
  }
}
```

## Environment Variables

Create a local `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_STUDYFLOW_APP_ID=studyflow
```

Do not commit your real `.env` file.

## Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open the local URL shown in the terminal, usually:

```txt
http://localhost:5173
```

## Build

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Deployment

This project is deployed on Vercel. Add the same `VITE_` environment variables inside:

```txt
Vercel Project Settings → Environment Variables
```

Every push to the main branch triggers a fresh deployment.

## Project Status

Current completed issues:

```txt
Issue 1: SvelteKit + Tailwind + Firebase foundation
Issue 2: Firebase Authentication UI
Issue 3: Firestore assignment CRUD
Issue 4: Countdown detail modal
Issue 5: Subtasks checklist
Issue 6: Assignment and subtask editing
Issue 7: Filters and sorting
Issue 8: Urgency styling
Issue 9: Custom confirmation dialog and improved empty states
Issue 10: Portfolio polish and README update
Issue 11: In-app notification center
Issue 12: User profile records for superadmin preparation
```

## Author

Built by Chandu Kolavennu as a portfolio project focused on modern frontend development, Firebase-backed authentication, realtime database usage, and practical student productivity design.
