# Citrus Expense Tracker - Client

A modern, responsive personal finance management application built with React and TypeScript.

![React](https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss)

## 🚀 Features

- **Multi-Account Management** - Manage multiple financial accounts (Family, Salary, Current, Savings)
- **Transaction Tracking** - Record income and expenses with categories
- **Fund Transfers** - Transfer money between accounts seamlessly
- **Analytics Dashboard** - Visual insights with interactive charts (Recharts)
- **AI-Powered Insights** - Gemini AI integration for financial analysis
- **Responsive Design** - Optimized for both desktop and mobile devices
- **Guest Mode** - Use the app without registration (data stored locally)
- **Data Sync** - Seamless synchronization with backend when logged in

## 📁 Project Structure

```
client/
├── components/
│   ├── features/
│   │   ├── accounts/      # Account-related components
│   │   ├── analytics/     # Charts and analytics views
│   │   ├── auth/          # Authentication components
│   │   ├── dashboard/     # Dashboard widgets
│   │   ├── modals/        # Modal dialogs
│   │   ├── settings/      # Settings components
│   │   └── transactions/  # Transaction views
│   └── layout/            # Layout components (Sidebar, etc.)
├── context/               # React Context providers
├── hooks/                 # Custom React hooks
├── services/              # API and external services
├── utils/                 # Utility functions
├── App.tsx                # Main application component
├── index.tsx              # Application entry point
├── index.css              # Global styles
└── types.ts               # TypeScript type definitions
```

## 🛠️ Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Citrus-Expense-Tracker/client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Backend API URL
   VITE_API_BASE_URL=http://localhost:5000/api
   
   # Gemini AI API Key (optional, for AI features)
   VITE_GEMINI_API_KEY=your_gemini_api_key
   
   # Firebase Configuration (optional, for Firebase deployment)
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173`

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |

## 🔧 Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI Framework |
| **TypeScript** | Type-safe JavaScript |
| **Vite** | Build tool and dev server |
| **TailwindCSS** | Utility-first CSS framework |
| **Recharts** | Data visualization |
| **Axios** | HTTP client |
| **Lucide React** | Icon library |
| **@google/genai** | Gemini AI integration |
| **react-window** | Virtual scrolling for performance |

## 🌐 Deployment

### Firebase Hosting

```bash
npm run build
firebase deploy
```

### Vercel

```bash
npm run build
vercel --prod
```

## 🔗 API Integration

The client communicates with the NexusPay backend API. Configure the `VITE_API_BASE_URL` environment variable to point to your backend server.

**API Endpoints Used:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `GET /api/finance` - Fetch all financial data
- `POST /api/finance/sync` - Sync local data to server
- `POST /api/finance/accounts` - Create account
- `POST /api/finance/transactions` - Create transaction
- `POST /api/finance/transfer` - Transfer between accounts

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (< 768px)

