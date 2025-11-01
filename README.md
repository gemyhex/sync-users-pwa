# User Sync Frontend App

A modern **Vue 3 + Vite** frontend application designed for secure authentication, real-time synchronization, and modular dashboard rendering.  

---

## Features

- **Authentication System**
  - Secure login using JWT tokens
  - Route guards and role-based redirection
  - Persistent auth state via Pinia + LocalStorage

- **Dynamic Home Dashboard**
  - Auto-fetches and syncs user data
  - Optimized rendering flow (no double-loading)
  - Modular page components for fast navigation

- **User Sync Service**
  - Handles data synchronization between frontend and backend
  - Queued auto-sync mechanism with offline handling

- **Clean Architecture**
  - Services separated from UI logic
  - Reusable composables for state and actions
  - Consistent naming and folder structure

- **Modern UI**
  - Built with TailwindCSS
  - Responsive layout and dynamic transitions

---

## Tech Stack

| Category | Tools |
|-----------|--------|
| Framework | [Vue 3](https://vuejs.org/) with Composition API |
| Build Tool | [Vite](https://vitejs.dev/) |
| State Management | [Pinia](https://pinia.vuejs.org/) |
| Routing | [Vue Router](https://router.vuejs.org/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| HTTP Client | [Axios](https://axios-http.com/) |
| Linting | ESLint + Prettier |
| Type System | TypeScript (if applicable) |

---

## Project Structure

```bash
├── public/
│   ├── manifest.webmanifest # Web App Manifest file for PWA
│   ├── sw.js                # Service Worker script
│   └── vite.svg
├── src/
│   ├── api/
│   │   └── apiClient.ts     # Configures and exports the API client (e.g., Axios instance)
│   ├── assets/              # Static assets (icons, images, fonts)
│   ├── components/          # Reusable UI components
│   │   ├── base/
│   │   │   └── BaseButton.vue   # Simple, presentational UI primitives
│   │   └── layout/
│   │       ├── Header.vue       # Application header/navigation
│   │       ├── SyncModal.vue    # Modal component for synchronization status/actions
│   │       └── UserList.vue     # Component dedicated to displaying a list of users
│   ├── composables/         # Reusable logic using Vue Composition API
│   │   └── useNetworkStatus.ts  # Logic for monitoring online/offline status
│   ├── modules/
│   │   └── auth/            # Feature-specific module (e.g., Authentication)
│   │       └── composables/
│   │           └── useAuth.ts # Authentication-related logic composable
│   ├── pages/               # Route-level components (the "views" of the app)
│   │   ├── Home.vue
│   │   └── Login.vue
│   ├── router/
│   │   └── index.ts         # Vue Router setup, routes, and navigation guards
│   ├── services/            # Business logic and I/O (IndexedDB, sync, auth)
│   │   ├── adapters.ts      # Data transformation/mapping logic
│   │   ├── indexedDB.ts     # Logic for interacting with the IndexedDB
│   │   ├── userSync.ts      # Core service for handling user data synchronization
│   │   └── authService.ts   # Logic for making auth-related service calls
│   ├── stores/              # Pinia state management modules
│   │   ├── auth.store.ts    # Store for authentication state
│   │   ├── users.store.ts   # Store for managing user data state
│   │   └── index.ts         # Pinia setup or export index
│   ├── types/
│   │   └── index.ts         # TypeScript global type definitions/interfaces
│   ├── utils/
│   │   ├── crypto.ts        # General-purpose cryptographic helper functions
│   │   └── user.adapter.ts  # Specific utility for transforming user data (may overlap with services/adapters)
│   ├── App.vue
│   ├── main.css             # Main/global stylesheet
│   └── main.ts              # Application entry point (initializes Vue, Pinia, Router)
├── .env                     # Environment variables
├── .gitignore
├── index.html
├── package-lock.json
├── package.json
├── postcss.config.cjs
├── README.md
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── tsconfig.tsbuildinfo
└── vite.config.ts
```

--- 

## Setup & Installation
1️⃣ Clone the repository
```bash
git clone https://github.com/gemyhex/sync-users-pwa.git
cd sync-users-pwa
```
2️⃣ Install dependencies
```bash
npm install
# or
yarn install
```
3️⃣ Create environment variables
Create a .env file in the root directory:
```bash
VITE_API_BASE_URL=https://calls.trolley.systems/api
VITE_SYNC_PAGE_SIZE=100
VITE_SYNC_MAX_PAGES=10
VITE_SYNC_MAX_RECORDS=1000
```
4️⃣ Run the development server
```bash
npm run dev
```
Server runs by default on http://localhost:5173

---

## Sync Flow
```bash
A[Login Success] --> B[Auth Store Updates]
B --> C[UserSyncService.setupAutoSync()]
C --> D[Fetch User Data]
D --> E[Render Home Dashboard]
```
