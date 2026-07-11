# Smart Expense Tracker

A modern, clean, and responsive full-stack SaaS-style personal finance dashboard built using the MERN stack. Track your income streams, manage daily expenses, set category budget caps, view visual charts, generate reports, and export transaction history.

---

## Tech Stack

### Frontend
- **React.js (Vite)**
- **Tailwind CSS**
- **React Router Dom v6**
- **Recharts** (Visual line, area, and pie charts)
- **React Hook Form** (Form validation)
- **React Hot Toast** (Toast notifications)
- **Axios** (HTTP client with JWT authorization interceptors)
- **Day.js** (Date utilities)
- **Lucide React** (Modern iconography)

### Backend
- **Node.js** & **Express.js** (REST API)
- **MongoDB** & **Mongoose** (Database & Schemas)
- **JWT (JSON Web Tokens)** (Secure authorization)
- **bcryptjs** (Secure password hashing)
- **express-validator** (Request payload sanitizer and validator)

---

## Features

- **Authentication & Security:** Secure JWT session state, remember-me support, password hashing, and profile-based password updates.
- **SaaS Analytics Dashboard:** Top card stats (Total Balance, Inflows, Expenses, Savings) alongside monthly timeline charts, income vs expense bar charts, and category pie distributions.
- **Budgeting Module:** Create category boundaries for any month/year. Interactive progress bars with amber cautions (85%+) and red flashing warnings (100%+) when limits are breached.
- **CRUD Streams:** Independently add, edit, or delete incomes and expenses using custom confirmation modals.
- **Search, Sort & Filters:** Dynamic page listing with text search, type filters, category selectors, sorting direction, and pagination.
- **Data Export:** Single-click client-side CSV spreadsheet downloader.
- **Dark Mode:** LocalStorage remembered light/dark state styling.
- **Database Seeder:** Populate test data with one command to showcase all charts instantly.

---

## Folder Structure

```text
smart-expense-tracker/
├── backend/
│   ├── config/             # Database connection configuration
│   ├── controllers/        # Express route handler controllers
│   ├── middleware/         # Auth verification guards
│   ├── models/             # Mongoose Schemas (User, Income, Expense, Budget)
│   ├── routes/             # REST API Routes
│   ├── utils/              # Seeding script and helper utilities
│   ├── .env.example        # Environment variables configuration example
│   ├── server.js           # Express main server entry point
│   └── package.json        # Backend dependencies
└── frontend/
    ├── src/
    │   ├── assets/         # App assets & icons
    │   ├── components/     # Reusable layout elements (Navbar, Sidebar, Skeletons)
    │   ├── context/        # React Auth & Theme Context Provider
    │   ├── pages/          # Main views (Dashboard, Income, Expenses, budgets)
    │   ├── services/       # Axios API client setup
    │   ├── App.jsx         # App router and notification anchors
    │   ├── index.css       # Tailwind base styles and animations
    │   └── main.jsx        # React entry mount point
    ├── index.html          # HTML entry point with meta SEO
    ├── tailwind.config.js  # Tailwind theme configurations
    ├── .env.example        # Frontend variables template
    └── package.json        # Frontend dependencies
```

---

## Environment Variables

### Backend (`backend/.env`)
Create a `.env` file in the `backend/` folder:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/smart-expense-tracker
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
```

### Frontend (`frontend/.env`)
Create a `.env` file in the `frontend/` folder:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Installation & Running Locally

### 1. Prerequisites
Ensure you have **Node.js** and **MongoDB** installed and running on your local machine.

### 2. Set Up Backend
```bash
cd backend
npm install
npm run seed     # Seeds a demo account: demo@example.com / Password123
npm run dev      # Starts the backend dev server on http://localhost:5000
```

### 3. Set Up Frontend
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev      # Starts the React Vite server on http://localhost:5173
```

---

## API Documentation

### Authentication
- `POST /api/auth/register` - Create user account
- `POST /api/auth/login` - Authenticate credentials and return JWT token
- `GET /api/auth/profile` - Get authenticated profile details (Private)
- `PUT /api/auth/password` - Change password (Private)

### Income (Private)
- `GET /api/incomes` - Fetch all user incomes
- `POST /api/incomes` - Add income record
- `PUT /api/incomes/:id` - Edit income record
- `DELETE /api/incomes/:id` - Remove income record

### Expenses (Private)
- `GET /api/expenses` - Retrieve paginated, sorted, and filtered expenses
- `POST /api/expenses` - Add expense record
- `PUT /api/expenses/:id` - Edit expense record
- `DELETE /api/expenses/:id` - Remove expense record

### Budgets (Private)
- `GET /api/budgets` - Fetch all category budgets with spent indicators
- `POST /api/budgets` - Add or update (upsert) monthly budget limit
- `DELETE /api/budgets/:id` - Remove category budget limit

### Analytics (Private)
- `GET /api/dashboard` - Get consolidated totals, timeline plots, and recent 5 transaction history
- `GET /api/reports` - Get timeline spend records and daily averages filtered by date range

---

## Deployment Guide

### Backend (Render Deployment)
1. Push your codebase to a GitHub repository.
2. Sign in to [Render](https://render.com) and create a new **Web Service**.
3. Link your repository.
4. Set the **Build Command** to `cd backend && npm install`.
5. Set the **Start Command** to `cd backend && npm start`.
6. Add your Environment Variables (`MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRE`).

### Frontend (Vercel Deployment)
1. Go to [Vercel](https://vercel.com) and import your repository.
2. Select the `frontend` folder as the Root Directory.
3. Keep the **Framework Preset** as **Vite**.
4. Add the Environment Variable `VITE_API_URL` pointing to your deployed backend (e.g., `https://smart-expense-backend.onrender.com/api`).
5. Click **Deploy**.

---

## Future Improvements
- **Receipt Parsing:** Auto-extract amount and merchant from uploaded invoices using AI.
- **Recurring Transactions:** Automatically schedule monthly recurring subscriptions and salaries.
- **Multicurrency Conversion:** Track transactions in multiple currencies with live exchange rates.
- **Budget Goal Forecasts:** Leverage Machine Learning to predict future expenses and alert before over-budget.
