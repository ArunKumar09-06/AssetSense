# DevCollab - Product & Project Management System (Frontend)

DevCollab is a clean, modern, professional frontend built for the Product and Project Management System backend.

## Tech Stack
- **Framework:** React 18 (Vite)
- **Routing:** React Router v6
- **HTTP Client:** Axios (with credentials and HTTP-only cookie support)
- **Icons:** Lucide React
- **Design System:** Tailored SaaS CSS design tokens (typography, surfaces, cards, tables, badges, modals)

## Architecture Overview

```text
frontend/
├── public/
├── src/
│   ├── api/
│   │   ├── client.js          # Centralized Axios client with withCredentials
│   │   ├── authApi.js         # Authentication and user endpoints
│   │   ├── projectApi.js      # Project CRUD and team attachments
│   │   ├── teamApi.js         # Team and team-member endpoints
│   │   ├── taskApi.js         # Task CRUD, assignments, and status updates
│   │   ├── orgApi.js          # Organization management and member roster
│   │   └── index.js           # Unified barrel export
│   │
│   ├── components/
│   │   ├── Avatar.jsx         # User avatar with initial fallbacks
│   │   ├── ConfirmDialog.jsx  # Reusable confirmation dialogs
│   │   ├── EmptyState.jsx     # Zero-data and empty search states
│   │   ├── Footer.jsx         # Landing page footer
│   │   ├── Layout.jsx         # Protected workspace shell with sidebar
│   │   ├── LoadingSpinner.jsx # Loading indicator
│   │   ├── Modal.jsx          # Accessible modal dialog
│   │   ├── Navbar.jsx         # Landing page responsive navigation
│   │   └── Sidebar.jsx        # Workspace navigation with active states
│   │
│   ├── context/
│   │   ├── AuthContext.jsx    # Session state, user role, org status
│   │   └── ToastContext.jsx   # Non-blocking feedback notifications
│   │
│   ├── pages/
│   │   ├── LandingPage.jsx    # Landing page (Hero, Features, About, Contact)
│   │   ├── LoginPage.jsx      # Login page with input validation
│   │   ├── SignupPage.jsx     # Registration page
│   │   ├── DashboardPage.jsx  # Overview metrics, recent projects, tasks
│   │   ├── ProjectsPage.jsx   # Projects list, search, status filters, create/edit
│   │   ├── ProjectDetailsPage.jsx # Kanban task board, team attachments, add task
│   │   ├── TeamsPage.jsx      # Team directory and team management
│   │   ├── TeamDetailPage.jsx # Team roster, add/remove member controls
│   │   ├── MyTasksPage.jsx    # User task queue with status updating
│   │   ├── OrganizationPage.jsx # Workspace setup, org details, member list
│   │   ├── ProfilePage.jsx    # Account details, avatar upload (multipart)
│   │   └── NotFoundPage.jsx   # 404 handler
│   │
│   ├── App.jsx                # Route declarations and route guards
│   ├── index.css              # Clean SaaS design system
│   └── main.jsx               # Application entry
│
├── .env                       # Backend target configuration
├── .env.example
├── package.json
└── vite.config.js
```

## How to Run

### 1. Start the Backend
```bash
cd backend
npm run dev
# Server listens on http://localhost:5000
```

### 2. Start the Frontend
```bash
cd frontend
npm run dev
# Application accessible at http://localhost:5173
```
