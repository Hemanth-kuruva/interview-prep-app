# 🚀 TechPrep - Technical Interview Preparation Platform

A full-stack web application designed for students and developers to prepare for technical interviews by practicing questions, taking timed quizzes, reviewing detailed explanations, and visualizing progress across subjects like Java, SQL, DBMS, Operating Systems, Computer Networks, Machine Learning, and Coding.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Lucide Icons, React Router DOM, Axios
- **Backend**: Node.js, Express, MySQL2, JSON Web Tokens (JWT), Bcrypt.js, CORS, Dotenv
- **Database**: MySQL (Relational schema with cascade rules and seed data)

---

## 📁 Project Structure

```
interview-prep-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MySQL connection pool
│   │   ├── controllers/
│   │   │   ├── adminController.js    # Admin question & analytics CRUD
│   │   │   ├── authController.js     # User registration, login, profile
│   │   │   ├── progressController.js # Analytics & subject metrics
│   │   │   ├── questionController.js # Question fetching & filtering
│   │   │   ├── quizController.js     # Quiz generation, evaluation & results
│   │   │   └── subjectController.js  # Subjects list & details
│   │   ├── middleware/
│   │   │   └── auth.js               # JWT verification & role authorization
│   │   ├── routes/
│   │   │   ├── adminRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── progressRoutes.js
│   │   │   ├── questionRoutes.js
│   │   │   ├── quizRoutes.js
│   │   │   └── subjectRoutes.js
│   │   └── server.js                 # Express application entrypoint
│   ├── .env.example
│   ├── .env
│   ├── package.json
│   └── schema.sql                    # Full MySQL database schema + seed data
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── AdminRoute.jsx        # Admin-only route guard
    │   │   ├── Navbar.jsx            # Header navigation with role badges
    │   │   ├── ProgressBar.jsx       # Step/Quiz progress indicator
    │   │   ├── ProtectedRoute.jsx    # Auth route guard
    │   │   ├── StatCard.jsx          # Metric cards
    │   │   └── Timer.jsx             # Quiz countdown timer
    │   ├── context/
    │   │   └── AuthContext.jsx       # Global authentication state
    │   ├── pages/
    │   │   ├── AdminDashboard.jsx    # Question management & platform stats
    │   │   ├── Dashboard.jsx         # Student home & subject cards
    │   │   ├── Login.jsx             # Login with 1-click demo accounts
    │   │   ├── ProgressDashboard.jsx # Recharts analytics & history
    │   │   ├── QuizPage.jsx          # Interactive quiz & practice runner
    │   │   ├── Register.jsx          # Student registration
    │   │   ├── ResultPage.jsx        # Score breakdown & question review
    │   │   └── SubjectSelection.jsx  # Mode, difficulty & topic selection
    │   ├── services/
    │   │   └── api.js                # Axios instance with JWT interceptor
    │   ├── App.jsx                   # Application router
    │   ├── index.css                 # Tailwind CSS styling
    │   └── main.jsx                  # React DOM root
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

---

## ⚡ Quick Start Guide

### 1. Database Setup (MySQL)
1. Ensure your MySQL server is running.
2. Create and seed the database by running `schema.sql`:
   ```bash
   mysql -u root -p < backend/schema.sql
   ```
   *This creates the `interview_prep_db` database, all necessary tables, and pre-populates 35+ technical interview questions along with default demo accounts.*

### 2. Backend Setup
1. Open a terminal in the `backend` folder:
   ```bash
   cd backend
   npm install
   ```
2. Configure `.env` (pre-filled by default for local MySQL):
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=interview_prep_db
   JWT_SECRET=techprep_jwt_super_secret_key_2026
   JWT_EXPIRES_IN=7d
   ```
3. Start the backend server:
   ```bash
   npm run dev
   ```
   *Backend runs on `http://localhost:5000`*

### 3. Frontend Setup
1. Open a terminal in the `frontend` folder:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *Frontend runs on `http://localhost:5173`*

---

## 🔑 Demo Credentials

| Role | Email | Password | Access |
|---|---|---|---|
| **Admin** | `admin@interviewprep.com` | `admin123` | Full Question CRUD & Platform Stats |
| **Student** | `student@interviewprep.com` | `student123` | Practice Mode, Timed Quizzes, Analytics |

*(You can also use the **1-Click Demo Login** buttons on the Login page!)*
