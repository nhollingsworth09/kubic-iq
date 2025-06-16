# Kubic IQ - 🛠️ Project Overview

We’re building an SAT prep web app MVP with React (frontend) and Node.js/Express (backend), using existing HTML/CSS from `ca-page-sources` and design assets from `branding` folder. Key backend logic includes user account management, admin panel, and a TrueSkill/Elo-based adaptive mastery system.

# 📁 Project Structure

- `/ca-page-sources/` – Contains HTML & CSS from Coaching Actuaries (use for components/layout)
- `/branding/` – Colors, fonts, logos for theming
- `src/` – React frontend code
- `server/` – Node.js Express backend
- `db/` – Schema definitions, migrations, seed files

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
