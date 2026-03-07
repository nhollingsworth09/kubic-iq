# Kubic IQ - 🛠️ Project Overview

We’re building an SAT prep web app MVP with React (frontend) and Node.js/Express (backend), using existing HTML/CSS from `ca-page-sources` and design assets from `branding` folder. Key backend logic includes user account management, admin panel, and a TrueSkill/Elo-based adaptive mastery system.
# 🎯 Product Overview

**Kubic IQ** is an adaptive SAT preparation platform designed to help students maximize their test scores through personalized, data-driven practice.

### What It Does

Students log in and take quizzes or full-length practice exams made up of real SAT-style questions. After every answer, the system recalculates both the student's skill level and the question's difficulty using the **TrueSkill rating algorithm**. Over time, the platform builds an accurate model of each student's strengths and weaknesses, then automatically surfaces questions at the right difficulty level — not too easy, not too hard — to produce the fastest possible skill growth.

### Key Student-Facing Features

- **Adaptive quizzes** — short practice sessions that home in on weak areas
- **Full-length practice exams** — timed, full SAT-format tests with a complete review mode afterwards
- **Mastery Score** — a 0–10 score derived from TrueSkill ratings that gives students a single, at-a-glance measure of their SAT readiness
- **Test history & review** — every completed test is snapshotted so students can revisit questions, see time spent per question, and track mastery score progression over time

### Key Admin Features

- Add, edit, and remove questions via the admin dashboard
- View and override TrueSkill μ/σ values for any question
- Monitor student mastery scores and response counts

---

# 🧠 TrueSkill Adaptive Engine

The adaptive difficulty system is built on the **TrueSkill** Bayesian ranking algorithm (via [`ts-trueskill`](https://www.npmjs.com/package/ts-trueskill)). Each student and each question carries two values:

| Symbol | Meaning |
|--------|---------|
| μ (mu) | Estimated skill/difficulty — higher = more skilled / harder |
| σ (sigma) | Uncertainty — decreases as more data is collected |

**After every answer**, the backend treats the interaction as a 1-vs-1 match:
- Correct answer → student "beats" the question → student μ rises, question μ falls
- Wrong answer → question "beats" the student → student μ falls, question μ rises

**Mastery Score** is derived as `μ - 3σ`, clamped to 0–10. This conservative estimate only converges to a stable number once the student has answered ≥ 25 questions.

**Relevant source files:**

| File | Purpose |
|------|---------|
| [server/answer.js](server/answer.js) | Core rating update logic — `rate_1vs1` called on every POST `/api/answer` |
| [server/auth.js](server/auth.js) | User model — stores `trueskill_mu`, `trueskill_sigma`, `masteryScore` |
| [server/models/question.js](server/models/question.js) | Question model — stores per-question `mu` and `sigma` |
| [server/userProgress.js](server/userProgress.js) | Returns current mastery score to the frontend |

**Configuration constants** (in [server/answer.js](server/answer.js)):

```js
const MU0    = 5;     // Starting mean for all users and questions
const SIGMA0 = 1.67;  // Starting uncertainty
const BETA   = 1;     // Performance variance
const TAU    = 0.033; // Skill dynamics (allows ratings to drift over time)
const K      = 3;     // Mastery score conservativeness: masteryScore = μ - K*σ
const MIN_ANSWERS = 25; // Minimum answers before mastery score is shown
```

---

# 🗄️ Question Database

Questions are stored in a **SQLite** database (via Sequelize ORM) at `server/db/`. Each question record contains:

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `text` | TEXT | Question body |
| `options` | JSON array | Answer choices (multiple-choice); empty `[]` for student-produced |
| `correctAnswer` | STRING | 0-based index string for multiple-choice (e.g. `"2"`), or exact answer string for student-produced (e.g. `"13"`) |
| `questionType` | STRING | `"multiple-choice"` or `"student-produced"` |
| `mu` | FLOAT | TrueSkill difficulty mean (0–10, default 5.0) |
| `sigma` | FLOAT | TrueSkill difficulty uncertainty (0–3.33, default 1.67) |
| `tags` | JSON array | Topic tags used for adaptive filtering (e.g. `["Algebra", "Linear equations in two variables"]`) |

## Question Types

### Multiple-Choice (`"multiple-choice"`)
Presents four answer options stored in the `options` array. `correctAnswer` is the **0-based index** of the correct option as a string (e.g. `"0"` = first option, `"2"` = third option).

Graded by comparing the student's selected option index against `Number(correctAnswer)`.

### Student-Produced Response (`"student-produced"`)
No answer options — `options` is an empty array `[]`. The student types a numeric answer freely. `correctAnswer` is the **exact expected string** (e.g. `"120"`, `"3"`).

Graded by case-insensitive string comparison of the student's trimmed input against `correctAnswer`.

**Relevant source files for question types:**

| File | Purpose |
|------|---------|
| [server/models/question.js](server/models/question.js) | Sequelize model — defines `questionType`, `options`, `correctAnswer` fields |
| [src/contexts/TestContext.tsx](src/contexts/TestContext.tsx) | Frontend grading logic in `evalAnswers()` — handles both types |
| [server/routes/questions.js](server/routes/questions.js) | `GET /api/questions/random` — serves questions to the frontend |

## Initial Question Bank (44 Questions)

The seed database ships with **44 SAT-style questions** spanning the four major SAT math domains:

| Domain | Example Topics |
|--------|---------------|
| **Algebra** | Linear equations, systems of equations, inequalities |
| **Advanced Math** | Quadratic equations, polynomial expressions, function notation |
| **Problem Solving & Data Analysis** | Statistics, averages, percentages, probability |
| **Geometry & Trigonometry** | Similar triangles, area & perimeter, coordinate geometry |

The 44 questions include a mix of multiple-choice and student-produced response types, each pre-assigned a `mu`/`sigma` difficulty rating based on estimated SAT difficulty level.

**Relevant source files:**

| File | Purpose |
|------|---------|
| [server/scripts/sampleQuestions.js](server/scripts/sampleQuestions.js) | The full 44-question seed dataset |
| [server/scripts/initializeDatabase.js](server/scripts/initializeDatabase.js) | Seeds the database with `sampleQuestions.js` on first run |
| [server/scripts/generateAdditionalQuestions.js](server/scripts/generateAdditionalQuestions.js) | Script to generate additional questions beyond the seed set |
| [server/questions.js](server/questions.js) | Admin CRUD API (`GET/POST/PUT/DELETE /api/admin/questions`) |

To reset and re-seed the question database:

```bash
cd server
node scripts/initializeDatabase.js
```

> **Warning:** this uses `sequelize.sync({ force: true })` and will **drop all existing data**.

---
# 📁 Project Structure

- `/ca-page-sources/` – Contains HTML & CSS from Coaching Actuaries (use for components/layout)
- `/branding/` – Colors, fonts, logos for theming
- `src/` – React frontend code
- `server/` – Node.js Express backend
- `db/` – Schema definitions, migrations, seed files

# 🚀 Local Development Setup

## Prerequisites

- [Node.js](https://nodejs.org/) v16 or later
- npm (comes with Node.js)

## Installation

Install dependencies for both the frontend and the backend:

```bash
# Install frontend dependencies (from project root)
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

## Running the App Locally

The frontend dev server proxies API requests to the backend (configured via `"proxy": "http://localhost:3001"` in `package.json`), so both must be running simultaneously.

**Terminal 1 – Start the backend (port 3001):**
```bash
cd server
npm run dev       # uses nodemon for auto-reload on file changes
# or
npm start         # plain node, no auto-reload
```

**Terminal 2 – Start the frontend (port 3000):**
```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app will hot-reload on source changes.

> **Windows shortcut:** Run `start-dev.bat` from the project root to install dependencies and launch both servers automatically.

## Running Tests

### Frontend Tests (Jest + React Testing Library)

```bash
# Run all tests once with coverage report
npm test

# Run tests in interactive watch mode
npm run test:watch
```

Coverage output is written to the `coverage/` directory.

### Backend Tests

The backend does not yet have a dedicated test runner configured. API endpoints can be tested manually via tools like [Postman](https://www.postman.com/) or curl once the server is running.

### Interactive Test Menu (Windows)

```bash
test-system.bat
```

This menu-driven script lets you test individual subsystems:
1. Server connection
2. Database & questions API
3. Sample question seeding
4. Test user creation
5. Frontend only
6. Full system

## Seeded Development Accounts

When the backend starts with an empty database, `initializeDatabase.js` runs automatically and seeds the following default accounts:

### Admin Account (auto-seeded on first run)
| Field | Value |
|-------|-------|
| Email | `admin@kubic.com` |
| Password | `admin` |
| Role | Admin |

> **Note:** Running `node server/scripts/fixDatabaseAndCreateAdmin.js` will upsert the admin account with password `admin123` instead.

### Test User Account
A test user is auto-created on server startup if it doesn't already exist:

| Field | Value |
|-------|-------|
| Email | `test@example.com` |
| Password | `password123` |
| Role | Student |

> These credentials are for **local development only**. Never use them in production.

## Building for Production

```bash
npm run build
```

The optimized static bundle is output to the `build/` directory and can be served by any static file host or the Express server.

---

# 1. Authentication & Account Management

- **User signup/login/logout** with JWT or session cookies
- **User model**: id, email, password hash, display name, TrueSkill μ, σ
- **Admin model**: same auth but admin flag
- **Endpoints**:
  - `POST /api/auth/signup` – create new users
  - `POST /api/auth/login` – return token
  - `GET /api/auth/me` – returns current user profile
- In React: create login & register forms, integrate auth context/provider, protect private routes

# 2. Admin Dashboard

- Admin login with same auth flow
- React admin panel: add/remove questions, view question μ/σ, override values
- API:
  - `GET/POST/PUT/DELETE /api/admin/questions`

# 3. TrueSkill Algorithm Implementation

- Use a Node.js TrueSkill library (e.g., `node-trueskill`)
- Define question model: id, content, μ, σ, metadata
- When a student answers:
  1. Fetch user μ_u, σ_u and question μ_q, σ_q
  2. Use `rate_1vs1(student, question)` or inverse if incorrect
  3. Save updated μ, σ for both student and question
- Compute `masteryScore = μ_u - 3 * σ_u`, store in user record

# 4. Practice Flow & Recommendations

- Student page:
  - Display current mastery score
  - Render question content (adapted via React UI)
  - On submit, POST answer; backend returns updated μ, σ, masteryScore, next question id
  - Frontend loads next question automatically
- Recommendation logic: always pick question where `μ_q` is within ±1 of μ_u

# 5. Technical Details & Implementation Guidance

- Use Copilot comments like:
  - `// TODO: implement JWT auth using express-jwt`
  - `// TODO: rate question using trueskill.rate_1vs1(...)`
- Leverage `ca-page-sources` HTML for React component structure (`className`)
- Use CSS/variables from `branding` in styled components or CSS modules
- Add backend validation, error handling, and unit tests (example tests: question answer flow, mastery updates)

# ✅ Acceptance Criteria

- [ ] User and Admin authentication flows work
- [ ] Questions CRUD works for admin
- [ ] TrueSkill rating correctly updates ratings on student answers
- [ ] MasteryScore computed and shown on dashboard
- [ ] Adaptive question sequencing based on μ values
- [ ] React UI replicates existing HTML/CSS look and feel

# 🧠 Tips for Copilot usage

- Start prompts with high‑level context blocks showing file structure
- Then narrow down to specific function/component implementation
- Provide example usage signature for each API and React component
- Use `#file` references to active open files for Copilot to pull context

# This repository contains branding assets and website components for Kubic IQ.

## Repository Structure

### Branding Assets
- **Brand Guidelines** - Official brand guidelines documentation
- **Business Cards** - Source files for business card designs
- **Logo Assets** - Various formats of the Kubic logo including:
  - 3D Renders
  - Vector files (AI, EPS)
  - Favicon
  - High-resolution images (300 DPI)
  - PNG files with transparency
  - SVG files

### Social Media Kit
Contains ready-to-use assets for various social media platforms:
- Facebook
- Instagram
- LinkedIn
- Pinterest
- Twitter
- YouTube

### Website Components
The `ca-page-sources` directory contains HTML templates and associated assets for various web pages including:
- Adapt and Master interface
- ASTAM Dashboard
- Various UI components and styling files

## Usage
Please refer to the brand guidelines document in the `branding` directory when using these assets to ensure consistent brand representation.
