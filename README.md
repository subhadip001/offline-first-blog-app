# Offline-First Blog Application

A modern blog application built with Next.js that prioritizes offline functionality and seamless user experience.

### Deployed URL: [https://offline-first-blog-app.vercel.app/](https://offline-first-blog-app.vercel.app/)

## Technology Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: TinyBase for offline storage
- **Data Fetching**: TanStack Query (React Query)
- **Authentication**: JWT with jose
- **Database**: MongoDB

## Key Approaches and Implementation

### 1. Offline-First Architecture

- Using TinyBase for client-side data persistence
- Implementing service workers for offline caching
- Optimistic UI updates for better user experience
- Queue-based synchronization for offline actions

### 2. Data Synchronization Strategy

- Background sync when connection is restored
- Conflict resolution with server-side timestamps
- Delta updates to minimize data transfer
- Periodic data reconciliation

### 3. Authentication & Security

- JWT-based authentication
- Token persistence in local storage
- Secure password handling with bcrypt
- Protected API routes with middleware

### 4. Performance Optimization

- Static page generation where possible
- Efficient data pagination

### 5. User Experience

- Instant feedback for user actions
- Offline indicator and sync status
- Progressive enhancement
- Responsive design for all devices

## Challenges Faced

- Implementation of JWT from `jsonwebtoken` in Next.js as `crypto` is not available in `edge` runtime. Hence, `jose` package was used.
- Fetching process of params in Next.js API routes is changed in 15. Faced bit issues there, but overcame it.
- Implementation of Offline Storage in `tinybase` was my first time. Faced issues like updating local store in offline mode without reloading, cause i was using react-query for that also. But overcame it.
- As of now, I have implemented the simple approach to sync changes. Maintaining a queue of changes to be synced and processing them in the background. Due to time constraints, I have not implemented conflict resolution and data reconciliation using CRDT.

## Getting Started

First, run the development server:

```bash

pnpm install

pnpm dev

```

Open [http://localhost:3000](http://localhost:3000) with your browser.

Admin credentials:

- Username: `testuser`
- Password: `testpass`

## Project Structure

- `/app`: Next.js app router pages and API routes
- `/components`: Reusable UI components
- `/lib`: Utility functions and data queries
- `/hooks`: Custom React hooks
- `/providers`: Context providers and wrappers

## Features

- User authentication and authorization
- Create, read, and delete blog posts
- Offline content creation and deletion
- Automatic synchronization
- Responsive design
