# 🎓 TechPrep — Master Project & Interview Reference Document

---

## 📌 Table of Contents
1. [60-Second Elevator Pitch (How to introduce the project)](#1-60-second-elevator-pitch)
2. [High-Level Architecture & End-to-End Workflow](#2-high-level-architecture--end-to-end-workflow)
3. [Technology Stack & Comparative Defense (Why this and not that?)](#3-technology-stack--comparative-defense)
4. [Live Coding & Whiteboard Cheat Sheet (Exact code snippets to write)](#4-live-coding--whiteboard-cheat-sheet)
   - [Snippet 1: MySQL Database Connection Pool](#snippet-1-mysql-database-connection-pool-backendconfigdbjs)
   - [Snippet 2: JWT Authentication & Role Authorization Middleware](#snippet-2-jwt-authentication--role-authorization-middleware-backendmiddlewareauthjs)
   - [Snippet 3: User Registration with Bcrypt Password Hashing](#snippet-3-user-registration-with-bcrypt-password-hashing-backendcontrollersauthcontrollerjs)
   - [Snippet 4: Atomic Quiz Submission with Database Transaction](#snippet-4-atomic-quiz-submission-with-database-transaction-backendcontrollersquizcontrollerjs)
   - [Snippet 5: Axios Client with Automatic JWT Interceptor](#snippet-5-axios-client-with-automatic-jwt-interceptor-frontendservicesapijs)
   - [Snippet 6: React Authentication Context & Session Persistence](#snippet-6-react-authentication-context--session-persistence-frontendcontextauthcontextjsx)
   - [Snippet 7: React Countdown Timer Component with Auto-Submit](#snippet-7-react-countdown-timer-component-with-auto-submit-frontendcomponentstimerjsx)
   - [Snippet 8: Core Relational Database DDL Schema](#snippet-8-core-relational-database-ddl-schema-backendschemasql)
5. [Complete File-by-File & Folder Breakdown](#5-complete-file-by-file--folder-breakdown)
6. [Top 15 Technical Interview Questions & Model Answers](#6-top-15-technical-interview-questions--model-answers)

---

## 1. 60-Second Elevator Pitch

> *"TechPrep is a full-stack technical interview preparation platform built with React, Node.js/Express, and MySQL. It helps candidates master core computer science topics like SQL, Java, DBMS, Operating Systems, Computer Networks, Machine Learning, and Coding through dual-mode preparation: an untimed Practice Mode with instant explanations, and a Timed Quiz Mode that simulates real technical hiring assessments.*
> 
> *Architecturally, the application features stateless JWT authentication with role-based access control (Student vs Admin), server-side evaluation executed within atomic database transactions to guarantee data integrity, and interactive analytics powered by Recharts to identify a candidate's strongest and weakest domains in real time."*

---

## 2. High-Level Architecture & End-to-End Workflow

```
       ┌────────────────────────────────────────────────────────┐
       │                REACT FRONTEND (SPA)                    │
       │  Vite + Tailwind CSS + Recharts + React Router DOM     │
       └───────────────────────────┬────────────────────────────┘
                                   │ HTTP REST Requests
                                   │ (Authorization: Bearer <JWT>)
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │             NODE.JS + EXPRESS BACKEND                  │
       │  Auth Middleware (JWT) • Controllers • Scoring Engine  │
       └───────────────────────────┬────────────────────────────┘
                                   │ mysql2/promise
                                   │ Connection Pool (ACID Transactions)
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │                 MySQL 8.0 DATABASE                     │
       │  users • subjects • questions • quiz_attempts • answers│
       └────────────────────────────────────────────────────────┘
```

### Complete User Workflows:

#### A. Student Lifecycle:
1. **Auth:** Student registers or logs in $\to$ Backend verifies password hash (`bcrypt.compare`) and issues signed JWT $\to$ Frontend stores token in `localStorage`.
2. **Configuration:** Student selects subject (e.g. SQL), mode (**Practice** vs **Timed Quiz**), difficulty (**Easy/Medium/Hard**), and question count ($5, 10, 15$).
3. **Session Execution:**
   - **Quiz Mode:** Backend fetches randomized questions (withholding correct answers to prevent client inspection). 60s/question countdown timer runs.
   - **Practice Mode:** Student can reveal instant answer keys and concept explanations per question.
4. **Submission & Atomic Evaluation:** Student answers are sent to `POST /api/quiz/submit`. Backend runs an atomic SQL transaction:
   - Calculates score, percentage accuracy, and time taken.
   - Inserts row into `quiz_attempts`.
   - Bulk-inserts rows into `user_answers`.
   - Commits transaction and returns detailed results.
5. **Review & Analytics:** Student sees score card, pass/fail indicators, detailed question review, and updated Recharts accuracy charts on their Progress Dashboard.

#### B. Admin Lifecycle:
1. **Auth & Authorization:** Admin logs in $\to$ `requireAdmin` middleware checks `req.user.role === 'admin'`.
2. **Question Management:** Admin accesses `/admin` to view, search, filter, create, edit, or delete questions with 4 options, difficulty, correct answer key, and in-depth explanations.
3. **Metrics Overview:** Admin monitors total registered candidates, platform question bank size, and total completed quizzes.

---

## 3. Technology Stack & Comparative Defense

When interviewers ask: **"Why did you choose this technology over alternatives?"**, use these battle-tested justifications:

### 1. Frontend: React vs Angular vs Vue
- **Why React?**
  - **Component-Driven Architecture:** UI components (`Timer`, `ProgressBar`, `StatCard`, `Navbar`) are modular, testable, and reusable.
  - **Virtual DOM Efficiency:** Handles frequent state updates (1-second timer tick, active question changes, instant option selection) without costly full-page DOM re-renders.
  - **Ecosystem & Community:** Rich ecosystem for charting (`recharts`), routing (`react-router-dom`), and icons (`lucide-react`).
- **Why not Angular?** Angular is a heavyweight, opinionated framework with high boilerplate (TypeScript decorators, dependency injection, RxJS streams) that is unnecessarily complex for this scope.
- **Why not Vue?** While lightweight, React’s unidirectional data flow and widespread industry adoption make it the optimal choice for modern production web apps.

---

### 2. Build Tool: Vite vs Create React App (Webpack)
- **Why Vite?**
  - **Native ES Modules (ESM):** Vite serves source code over native ESM in development, avoiding slow bundling on startup.
  - **Lightning HMR:** Instant Hot Module Replacement regardless of application size.
  - **Modern Standard:** CRA (Create React App) is officially deprecated by the React team.

---

### 3. Styling: Tailwind CSS vs Bootstrap vs Styled-Components
- **Why Tailwind CSS?**
  - **Zero Runtime Overhead:** Compiles to static CSS at build time via PostCSS; unused classes are purged, resulting in a bundle under 15KB.
  - **Design Uniformity:** Provides consistent design tokens (colors, spacing, typography) without context-switching between JSX and CSS files.
  - **No CSS Specificity Conflicts:** Utility classes prevent cascading style bugs common in traditional stylesheets.
- **Why not Bootstrap?** Bootstrap relies on heavy pre-packaged components with rigid design patterns that require tedious CSS overrides.

---

### 4. Backend: Node.js + Express vs Python (Django/FastAPI) vs Java (Spring Boot)
- **Why Node.js + Express?**
  - **Non-blocking Asynchronous Event Loop:** Node.js executes I/O operations (database queries, network requests) asynchronously without blocking the single execution thread, making it highly performant for concurrent REST APIs.
  - **Full-Stack JavaScript (JSON-Native):** Data flows seamlessly as native JSON from React $\to$ Express $\to$ MySQL, eliminating data serialization/mapping overhead.
  - **Lightweight & Fast Startup:** Express has minimal overhead compared to enterprise frameworks.
- **Why not Django?** Django is monolithic with heavy built-in ORM and session overhead, whereas this project benefits from a decoupled stateless REST API.
- **Why not Spring Boot?** Spring Boot has a steep JVM memory footprint and slow cold start times for lightweight microservices.

---

### 5. Database: MySQL (Relational) vs MongoDB (NoSQL)
- **Why MySQL (InnoDB)?**
  - **Relational Integrity & Foreign Keys:** Our domain has strict relational models (`users` $1:N$ `quiz_attempts` $1:N$ `user_answers` $N:1$ `questions` $N:1$ `subjects`).
  - **`ON DELETE CASCADE`:** If a question or subject is deleted, related historical records are cleaned up cleanly by the database engine.
  - **ACID Compliance & Transactions:** Quiz submission requires multi-table atomic consistency (`quiz_attempts` + `user_answers`).
  - **Complex Analytical Queries:** MySQL handles aggregations (`AVG(accuracy)`, `SUM(score)`, `GROUP BY subject_id`) efficiently using indexes.
- **Why not MongoDB?** MongoDB is document-based. Relational joins (`$lookup`) are expensive, and enforcing data integrity across normalized entities requires brittle application-level code.

---

### 6. Authentication: JWT (Stateless) vs Server-Side Sessions
- **Why JWT?**
  - **Stateless & Horizontally Scalable:** The server does not store session IDs in memory or Redis. Any backend instance can verify the cryptographic signature using `JWT_SECRET`.
  - **Self-Contained Payload:** User `id`, `email`, and `role` are embedded directly in the decoded token, avoiding redundant database lookups on every request.
- **Why not Server Sessions?** Server sessions require centralized state storage (like Redis), increasing infrastructure complexity and introducing a single point of failure.

---

## 4. Live Coding & Whiteboard Cheat Sheet

If an interviewer asks you to **"Write the code on a whiteboard or live editor"**, write these exact implementations:

---

### Snippet 1: MySQL Database Connection Pool (`backend/src/config/db.js`)
```javascript
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Create connection pool for reusable DB connections
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'interview_prep_db',
  waitForConnections: true,
  connectionLimit: 10,     // Up to 10 concurrent active connections
  queueLimit: 0,           // Unlimited queue
  enableKeepAlive: true,
});

module.exports = pool;
```

---

### Snippet 2: JWT Authentication & Role Authorization Middleware (`backend/src/middleware/auth.js`)
```javascript
const jwt = require('jsonwebtoken');

// 1. Authentication Middleware: Verifies who the user is
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'No token provided.' });
  }

  // Extract token from "Bearer <token>"
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    req.user = decoded; // Injects { id, name, email, role } into request object
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

// 2. Authorization Middleware: Verifies what the user can do
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden. Admin access required.' });
  }
  next();
}

module.exports = { verifyToken, requireAdmin };
```

---

### Snippet 3: User Registration with Bcrypt Password Hashing (`backend/src/controllers/authController.js`)
```javascript
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

async function register(req, res) {
  try {
    const { name, email, password, role = 'student' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    // Salt and hash password (10 rounds)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name.trim(), normalizedEmail, hashedPassword, role === 'admin' ? 'admin' : 'student']
    );

    const newUser = { id: result.insertId, name, email: normalizedEmail, role };
    const token = jwt.sign(newUser, process.env.JWT_SECRET || 'secret_key', { expiresIn: '7d' });

    return res.status(201).json({
      success: true,
      message: 'Account created.',
      data: { user: newUser, token }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
```

---

### Snippet 4: Atomic Quiz Submission with Database Transaction (`backend/src/controllers/quizController.js`)
```javascript
const pool = require('../config/db');

async function submitQuiz(req, res) {
  const connection = await pool.getConnection(); // Grab dedicated connection for transaction
  try {
    const userId = req.user.id;
    const { subject_id, mode = 'quiz', difficulty = 'All', time_taken = 0, answers = [] } = req.body;

    // 1. Fetch correct answers from DB ground truth
    const questionIds = answers.map((a) => a.question_id);
    const [dbQuestions] = await connection.query(
      'SELECT id, correct_answer FROM questions WHERE id IN (?)',
      [questionIds]
    );

    const answerMap = new Map();
    dbQuestions.forEach((q) => answerMap.set(q.id, q.correct_answer));

    // 2. Calculate score and build answer review records
    let score = 0;
    const userAnswersData = [];

    for (const ans of answers) {
      const correctOption = answerMap.get(ans.question_id);
      const isCorrect = (ans.selected_answer || '').toUpperCase() === (correctOption || '').toUpperCase();
      if (isCorrect) score++;

      userAnswersData.push([
        null, // placeholder for attempt_id
        ans.question_id,
        ans.selected_answer || 'SKIP',
        isCorrect ? 1 : 0
      ]);
    }

    const totalQuestions = answers.length;
    const accuracy = totalQuestions > 0 ? ((score / totalQuestions) * 100).toFixed(2) : 0;

    // 3. Begin Transaction
    await connection.beginTransaction();

    // Insert Quiz Attempt
    const [attemptResult] = await connection.query(
      `INSERT INTO quiz_attempts (user_id, subject_id, mode, difficulty, score, total_questions, accuracy, time_taken)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, subject_id, mode, difficulty, score, totalQuestions, accuracy, time_taken]
    );

    const attemptId = attemptResult.insertId;

    // Set attempt_id on answer records and Bulk Insert
    const finalAnswerRows = userAnswersData.map((row) => [attemptId, row[1], row[2], row[3]]);
    await connection.query(
      `INSERT INTO user_answers (attempt_id, question_id, selected_answer, is_correct) VALUES ?`,
      [finalAnswerRows]
    );

    // Commit Transaction
    await connection.commit();
    connection.release();

    return res.status(201).json({
      success: true,
      data: { attempt_id: attemptId, score, total_questions: totalQuestions, accuracy: parseFloat(accuracy) }
    });
  } catch (error) {
    await connection.rollback(); // Roll back on failure
    connection.release();
    return res.status(500).json({ success: false, message: 'Quiz submission failed.' });
  }
}
```

---

### Snippet 5: Axios Client with Automatic JWT Interceptor (`frontend/src/services/api.js`)
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

// Request Interceptor: Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Auto-redirect on 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

### Snippet 6: React Authentication Context & Session Persistence (`frontend/src/context/AuthContext.jsx`)
```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')) || null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user: authUser, token: authToken } = res.data.data;

      setUser(authUser);
      setToken(authToken);
      localStorage.setItem('user', JSON.stringify(authUser));
      localStorage.setItem('token', authToken);

      return { success: true, user: authUser };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

---

### Snippet 7: React Countdown Timer Component with Auto-Submit (`frontend/src/components/Timer.jsx`)
```javascript
import React, { useState, useEffect } from 'react';

export default function Timer({ initialSeconds, onExpire, isPaused = false }) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  useEffect(() => {
    if (isPaused || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onExpire) onExpire(); // Automatically triggers submission
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isPaused, onExpire]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const isCritical = timeLeft <= 20;

  return (
    <div className={`px-3 py-1.5 rounded-lg font-mono font-bold text-sm border ${
      isCritical ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse' : 'bg-slate-800 text-emerald-400 border-emerald-500/30'
    }`}>
      ⏱️ {formatted}
    </div>
  );
}
```

---

### Snippet 8: Core Relational Database DDL Schema (`backend/schema.sql`)
```sql
CREATE DATABASE IF NOT EXISTS interview_prep_db;
USE interview_prep_db;

-- 1. Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Subjects Table
CREATE TABLE subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50) DEFAULT 'BookOpen',
    description TEXT
) ENGINE=InnoDB;

-- 3. Questions Table
CREATE TABLE questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT NOT NULL,
    question TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_answer ENUM('A', 'B', 'C', 'D') NOT NULL,
    difficulty ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Medium',
    explanation TEXT,
    CONSTRAINT fk_questions_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Quiz Attempts Table
CREATE TABLE quiz_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject_id INT NOT NULL,
    mode ENUM('practice', 'quiz') DEFAULT 'quiz',
    difficulty VARCHAR(50) DEFAULT 'All',
    score INT NOT NULL,
    total_questions INT NOT NULL,
    accuracy DECIMAL(5,2) NOT NULL,
    time_taken INT DEFAULT 0,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attempts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_attempts_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. User Answers Table (Detailed Review)
CREATE TABLE user_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    attempt_id INT NOT NULL,
    question_id INT NOT NULL,
    selected_answer VARCHAR(10) NOT NULL,
    is_correct BOOLEAN NOT NULL,
    CONSTRAINT fk_user_answers_attempt FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_answers_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB;
```

---

## 5. Complete File-by-File & Folder Breakdown

### Backend (`backend/src/`):
1. **`server.js`**: Application entry point. Configures CORS, parses incoming JSON, registers routes (`/api/auth`, `/api/subjects`, `/api/questions`, `/api/quiz`, `/api/progress`, `/api/admin`), and provides a global 500 error handler.
2. **`config/db.js`**: MySQL2 connection pool provider with keep-alive and connectivity test logging.
3. **`middleware/auth.js`**: `verifyToken` for JWT verification and `requireAdmin` for role guards.
4. **`controllers/authController.js`**: Implements user registration with bcrypt password hashing (10 salt rounds), login with credential comparison, and current user profile retrieval (`/api/auth/me`).
5. **`controllers/subjectController.js`**: Performs `LEFT JOIN` queries between `subjects` and `questions` to retrieve all subjects with real-time question counts.
6. **`controllers/questionController.js`**: Queries randomized question subsets (`ORDER BY RAND() LIMIT ?`) by subject and difficulty.
7. **`controllers/quizController.js`**: Orchestrates quiz startup, atomic evaluation with transaction rollbacks, score calculation, attempt history, and question-by-question review data.
8. **`controllers/progressController.js`**: Computes aggregated student metrics (`AVG`, `SUM`, `COUNT`) and calculates Strongest and Weakest topics.
9. **`controllers/adminController.js`**: Implements question CRUD, subject filtering, search queries, and platform-wide statistics.
10. **`routes/*.js`**: Express routers mapping HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`) to corresponding controller methods.

---

### Frontend (`frontend/src/`):
1. **`main.jsx` & `App.jsx`**: Root application setup configuring `BrowserRouter`, `AuthProvider`, and guarded routes (`ProtectedRoute` & `AdminRoute`).
2. **`services/api.js`**: Axios instance configuring base URL, automatic JWT Bearer token attachment on requests, and global 401 token expiry handling.
3. **`context/AuthContext.jsx`**: Global authentication context managing login, registration, logout, and localStorage session persistence.
4. **`components/Navbar.jsx`**: Header navigation displaying brand logo, route links, user avatar, student/admin role badges, and logout button.
5. **`components/Timer.jsx`**: Real-time interval countdown timer with critical low-time warning animations and auto-submit callback.
6. **`components/ProgressBar.jsx`**: Dynamic indicator showing current question index and answered question count.
7. **`components/StatCard.jsx`**: Card component displaying KPI metrics with background glow gradients.
8. **`components/ProtectedRoute.jsx` & `AdminRoute.jsx`**: Route guards that redirect unauthenticated users to `/login` and non-admins away from `/admin`.
9. **`pages/Login.jsx` & `Register.jsx`**: Authentication pages featuring 1-Click Demo Login helpers for fast evaluation.
10. **`pages/Dashboard.jsx`**: Student hub displaying quick performance stats, subject cards with instant Practice/Quiz shortcuts, and recent activity logs.
11. **`pages/SubjectSelection.jsx`**: Quiz setup wizard allowing selection of Subject, Mode, Difficulty, and Question Count.
12. **`pages/QuizPage.jsx`**: Active quiz environment with question jump palette, option selection, instant explanations in practice mode, and submit confirmation modal.
13. **`pages/ResultPage.jsx`**: Post-quiz review scorecard displaying score, accuracy %, filterable question list (`All`, `Correct`, `Incorrect`), and detailed explanations.
14. **`pages/ProgressDashboard.jsx`**: Visual analytics powered by Recharts (Subject accuracy bar chart, attempt trajectory area chart, subject mastery bars, full history table).
15. **`pages/AdminDashboard.jsx`**: Administrative question repository with search/filtering, Add/Edit modal forms, and deletion confirmation dialog.

---

## 6. Top 15 Technical Interview Questions & Model Answers

### Q1: "Why do we evaluate quizzes on the backend instead of the frontend?"
> **Answer:** "Security and academic integrity. If we sent correct answer keys to the frontend during a timed quiz, a candidate could inspect the browser's Network tab or React state to see the answers. By evaluating on the backend via `POST /api/quiz/submit`, the ground truth remains securely inside the database until submission."

### Q2: "How do you handle database transactions and why are they necessary in quiz submissions?"
> **Answer:** "Submitting a quiz involves two relational write operations: inserting a row into `quiz_attempts` and bulk-inserting individual responses into `user_answers`. We wrap both in a MySQL transaction using `connection.beginTransaction()`, `commit()`, and `rollback()`. If the server crashes or an insert fails, the entire transaction is rolled back, preventing corrupted orphan records."

### Q3: "What is the difference between Authentication and Authorization in your application?"
> **Answer:** 
> - **Authentication** verifies *identity* ('Who are you?'). In our app, `/api/auth/login` checks the password hash with `bcrypt` and issues a signed JWT.
> - **Authorization** verifies *permissions* ('What are you allowed to do?'). The `requireAdmin` middleware checks `req.user.role === 'admin'` to allow question creation/deletion while restricting regular students to quiz taking."

### Q4: "Why use stateless JWT over stateful sessions?"
> **Answer:** "JWTs are self-contained and cryptographically signed. The backend doesn't need to store session records in RAM or Redis. This allows horizontal scaling across multiple load-balanced backend servers without session synchronization issues."

### Q5: "How does React's Context API solve the Prop Drilling problem in your app?"
> **Answer:** "Authentication state (`user`, `token`, `login`, `logout`) is required across many distant components (`Navbar`, `ProtectedRoute`, `QuizPage`, `Dashboard`). Without Context, we would have to pass auth props through every intermediate component. `AuthContext` provides a centralized store accessible anywhere via the `useAuth()` custom hook."

### Q6: "Why did you choose MySQL over MongoDB for this application?"
> **Answer:** "Our data is inherently relational: a User makes multiple Quiz Attempts, which contain multiple User Answers referencing Questions categorized by Subjects. MySQL enforces referential integrity through foreign keys with `ON DELETE CASCADE`. In MongoDB, maintaining consistency across normalized collections requires complex application-level logic and slow `$lookup` joins."

### Q7: "How do Axios interceptors simplify frontend networking?"
> **Answer:** "Interceptors act as middleware for HTTP requests and responses. The Request Interceptor automatically reads the JWT from `localStorage` and appends `Authorization: Bearer <token>` to all outgoing calls. The Response Interceptor catches `401 Unauthorized` responses (e.g. expired tokens), clears storage, and redirects to `/login` without writing repetitive error handlers in every component."

### Q8: "How does the countdown timer handle auto-submission when time runs out?"
> **Answer:** "In `Timer.jsx`, a `setInterval` hook decrements `timeLeft` every second. When `timeLeft <= 1`, the interval is cleared and the `onExpire()` callback is executed, which directly invokes the quiz submission handler (`handleSubmitQuiz`) on `QuizPage.jsx`."

### Q9: "Why is password hashing with Bcrypt better than standard SHA-256?"
> **Answer:** "SHA-256 is designed to be fast, which makes it vulnerable to modern GPU-based brute force and rainbow table attacks. Bcrypt uses a configurable work factor (salt rounds) to deliberately slow down computation and includes unique cryptographic salts per password to prevent rainbow table pre-computation."

### Q10: "How do you calculate Strongest and Weakest subjects in the analytics engine?"
> **Answer:** "In `progressController.js`, we execute a SQL query grouping attempts by `subject_id` and calculating `AVG(qa.accuracy)`. We sort the results in descending order; the first element with at least one attempt is the strongest subject, and the last element is the weakest subject."

### Q11: "What is the purpose of `ON DELETE CASCADE` in your database schema?"
> **Answer:** "`ON DELETE CASCADE` ensures referential integrity. If an administrator deletes a Subject, MySQL automatically removes all associated questions, quiz attempts, and user answers, preventing orphaned records and broken foreign key references."

### Q12: "How do you prevent SQL Injection in your backend queries?"
> **Answer:** "We use parameterized queries (prepared statements) provided by `mysql2/promise` with the `?` placeholder syntax (e.g., `pool.query('SELECT * FROM users WHERE email = ?', [email])`). The database engine treats the input strictly as literal data rather than executable SQL code."

### Q13: "Why did you choose Vite over Create React App?"
> **Answer:** "CRA uses Webpack, which bundles the entire application before starting the dev server, leading to slow cold starts. Vite leverages native browser ES Modules (ESM) to serve source files on demand and uses esbuild for pre-bundling, delivering instant server start and near-instant Hot Module Replacement (HMR)."

### Q14: "How does Recharts integrate with React's Virtual DOM compared to D3.js?"
> **Answer:** "D3.js directly manipulates the browser DOM, which conflicts with React's Virtual DOM reconciliation. Recharts is built specifically as a declarative React component library that outputs native SVG elements managed directly through React state and props."

### Q15: "How does your system handle pagination and search in the admin questions repository?"
> **Answer:** "In `adminController.js`, the `getAdminQuestions` query dynamically constructs SQL `WHERE` clauses based on optional query parameters (`subject_id`, `difficulty`, `search`). Search matches both question text and subject names using SQL `LIKE %search%`."
