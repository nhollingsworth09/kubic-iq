# Kubic IQ - 🛠️ Project Overview

We’re building an SAT prep web app MVP with React (frontend) and Node.js/Express (backend), using existing HTML/CSS from `ca-page-sources` and design assets from `branding` folder. Key backend logic includes user account management, admin panel, and a TrueSkill/Elo-based adaptive mastery system.
# 🎯 Product Overview

**Kubic IQ** is an adaptive SAT preparation platform designed to help students maximize their test scores through personalized, data-driven practice.

### What It Does

Students log in and take quizzes or full-length practice exams made up of real SAT-style questions. After every answer, the system recalculates the student's skill level using the **TrueSkill rating algorithm**, using each question's fixed difficulty as a calibration reference. Over time, the platform builds an accurate model of each student's strengths and weaknesses, then automatically surfaces questions at the right difficulty level — not too easy, not too hard — to produce the fastest possible skill growth.

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

The adaptive difficulty system is built on the **TrueSkill** Bayesian ranking algorithm (via [`ts-trueskill`](https://www.npmjs.com/package/ts-trueskill)). Each student and question is modelled as a Gaussian belief over skill/difficulty:

$$\text{Skill} \sim \mathcal{N}(\mu, \sigma^2)$$

| Symbol | Meaning |
|--------|---------|
| μ (mu) | Estimated skill/difficulty mean — higher = more skilled / harder |
| σ (sigma) | Uncertainty — decreases as evidence accumulates; never reaches zero |

---

## Rating Update Mathematics

After each answer, the backend runs a 1-vs-1 TrueSkill match between the student and the question. The update is derived from the truncated Gaussian correction of the expected outcome.

### Performance variance term

$$c = \sqrt{2\beta^2 + \sigma_{\text{student}}^2 + \sigma_{\text{question}}^2}$$

Where `β = 1` (performance variance) controls how much randomness is assumed in any single match outcome.

### Win/loss outcome variable

$$t = \frac{\mu_{\text{student}} - \mu_{\text{question}}}{c}$$

A positive `t` means the student is expected to win; negative means the question is harder than the student.

### Truncated Gaussian correction factors

$$v(t) = \frac{\phi(t)}{\Phi(t)}, \qquad w(t) = v(t)\bigl(v(t) + t\bigr)$$

Where `φ` is the standard normal PDF and `Φ` is the CDF. These factors scale the update:
- `v(t)` is the **magnitude** of the correction (how surprising the outcome was)
- `w(t)` is the **confidence gain** (how much this outcome reduces uncertainty)

When `t ≈ 0` (student and question are equally matched), `v` and `w` are maximised — the result is most informative. When the gap is large, `v` and `w` shrink — unsurprising outcomes yield little information. This is why the adaptive question selector (which targets questions near the student's current μ) accelerates calibration versus random question selection.

### μ update (correct answer — student wins)

$$\mu'_{\text{student}} = \mu_{\text{student}} + \frac{\sigma_{\text{student}}^2}{c} \cdot v(t)$$

### μ update (wrong answer — student loses)

$$\mu'_{\text{student}} = \mu_{\text{student}} - \frac{\sigma_{\text{student}}^2}{c} \cdot v(-t)$$

### σ update (both outcomes)

$$\sigma'^2_{\text{student}} = \sigma^2_{\text{student}} \left(1 - \frac{\sigma^2_{\text{student}}}{c^2} \cdot w(t)\right) + \tau^2$$

The `+ τ²` term (dynamics factor, `τ = 0.033`) re-injects a small amount of uncertainty each round, modelling the fact that skill is not static. This prevents σ from converging to zero and ensures the system remains responsive to genuine skill changes over time.

**Question μ/σ is never mutated at runtime** — the question's rating serves as a fixed calibration reference only. Mutating it would cause difficulty to drift based on individual students rather than converging on the question's true objective difficulty.

---

## Mastery Score Formula

The displayed Mastery Score is a **conservative skill floor** — a 95% confidence lower bound on the student's true ability:

$$\text{MasteryScore} = \text{clamp}(\mu - K\sigma,\ 0,\ 10), \qquad K = 2$$

The choice of `K = 2` reflects a 95% confidence interval (two-sigma rule). This means the displayed score is a value the student's true skill is statistically likely to exceed. Scores of 9–10 are achievable by highly calibrated students but require both high μ and low σ.

**Why not K = 3?** Three-sigma (99.7%) confidence requires a student answering difficulty-7.5 questions consistently just to display a score of 5.0. With K = 2, a well-calibrated student performing at difficulty 7.5 displays approximately 5.8–6.3 after sufficient calibration — consistent with the product expectation that a score of 6–7 represents exam readiness and 7+ correlates with a high pass probability.

The score is **hidden until 25 questions answered** (`MIN_ANSWERS = 25`). With the adaptive question selector, 25 questions with close difficulty matching (question μ within ±1 of student μ) is sufficient for σ to compress to approximately 0.70, yielding a stable and meaningful first-reveal score.

---

## Initialization Values

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| `MU0` | **7.0** | An optimistic prior: a student investing in SAT prep is likely above the mid-scale. This primes the adaptive selector to serve moderate-to-hard questions immediately, accelerating calibration. Since the score is hidden for the first 25 questions, any downward μ correction during calibration is never shown to the student. |
| `SIGMA0` | **1.67** | High initial uncertainty reflecting no prior evidence. Produces a displayed uncertainty range of roughly ±3.3 around μ at first reveal, which tightens to ±1.4 by ~25 questions. The wide prior is intentional: it allows μ to move quickly early on, which is desirable for fast calibration. |
| `BETA` | 1.0 | Performance variance per match — controls how much a single answer can shift ratings. |
| `TAU` | 0.033 | Dynamics noise — prevents σ from collapsing to zero and keeps the model responsive to genuine skill changes over extended use. |
| `K` | 2 | Conservativeness multiplier for Mastery Score display. See formula above. |

### σ convergence trajectory (adaptive questioning)

With close-difficulty question matching, σ compresses faster than random selection because `w(t)` is maximised when `t ≈ 0`. Approximate values for an on-track student:

| Questions answered | σ (approx) | MasteryScore at μ = 7.0 |
|---|---|---|
| 0–24 | — | Hidden |
| 25 (first reveal) | ~0.70 | ~5.6 |
| 50 | ~0.52 | ~5.96 |
| 100 | ~0.40 | ~6.2 |
| 200+ | ~0.30 | ~6.4 |

A student whose true skill is above μ = 7.0 will see their score rise above these baselines as μ increases through calibration.

---

## What changes and what doesn't

| Value | Changes? | Where stored |
|-------|----------|-------------|
| Student μ / σ | ✅ Updated per answer (`answer.js`) | `Users` table |
| Student masteryScore | ✅ Updated at test submission only (`testSnapshots.js`) | `Users` table |
| Question μ / σ | ❌ Fixed — never mutated at runtime | `Questions` table |

**masteryScore is computed and persisted only at test submission**, not per-answer. The per-answer handler (`answer.js`) updates μ/σ for adaptive question selection during the test, but the displayed score only changes when a full test snapshot is submitted. This ensures the score reflects complete, finalized performance rather than in-progress state.

### Question selection & retirement

Questions are selected where `question.mu` is within ±1 of the student's current μ. A question is retired from a student's rotation when:

$$\mu_{\text{student}} - \sigma_{\text{student}} - 1.0 > \mu_{\text{question}}$$

Only clearly mastered questions are suppressed. Questions near or above the student's level continue to recirculate until σ tightens enough to confirm mastery.

**Relevant source files:**

| File | Purpose |
|------|---------|
| [server/answer.js](server/answer.js) | Per-answer μ/σ update + adaptive question selection |
| [server/routes/testSnapshots.js](server/routes/testSnapshots.js) | masteryScore computation and persistence at submission |
| [server/auth.js](server/auth.js) | User model — stores `trueskill_mu`, `trueskill_sigma`, `masteryScore` |
| [server/models/question.js](server/models/question.js) | Question model — stores fixed per-question `mu` and `sigma` |
| [server/userProgress.js](server/userProgress.js) | Returns current mastery score to the frontend |

**Configuration constants** (in [server/answer.js](server/answer.js)):

```js
const MU0          = 7.0;   // Optimistic prior — SAT prep students skew above mid-scale
const SIGMA0       = 1.67;  // Wide initial uncertainty — enables fast early calibration
const BETA         = 1;     // Performance variance per match
const TAU          = 0.033; // Skill dynamics (prevents σ → 0, keeps model adaptive)
const K            = 2;     // Mastery score formula: masteryScore = μ - K*σ (95% CI)
const MIN_ANSWERS  = 25;    // Minimum answers before mastery score is displayed
const MASTERY_MARGIN = 1.0; // Question retired when (μ_student - σ_student - MASTERY_MARGIN) > μ_question
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
