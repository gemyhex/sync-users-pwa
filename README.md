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
src/
├── assets/              # Static assets (icons, images, fonts)
├── components/          # Reusable UI components
│   ├── Base/            # Base components (Input, Button, etc.)
│   ├── Layout/          # Layout-level components (Header, Sidebar)
├── composables/         # Reusable logic (useAuth, useSync, etc.)
├── pages/               # Page components (Login, Home, etc.)
├── router/
│   └── index.ts         # Vue Router setup & guards
├── store/
│   └── useAuthStore.ts  # Pinia auth store
├── services/
│   ├── userSyncService.ts  # Handles user data sync logic
│   └── api.ts              # Axios instance setup with interceptors
├── utils/
│   └── helpers.ts          # Common utilities
├── App.vue
├── main.ts
└── .env
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
