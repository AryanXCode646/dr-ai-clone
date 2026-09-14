# 🩺 Dr.AI — Healthcare Application Prototype & Telehealth Simulation

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178c6.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-gray.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green.svg)](https://mongoosejs.com/)
[![Test Suite](https://img.shields.io/badge/Tests-Passed-10b981.svg)](https://github.com/AryanXCode646/dr-ai-clone)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Dr.AI** is a **security-conscious healthcare application prototype** and **LLM-powered healthcare workflow prototype** engineered to demonstrate **AI safety guardrails**, **role-based authorization boundaries**, **conflict-free appointment scheduling**, **simulated telehealth workflows**, and **simulated prescription workflows**.
> 
> *Notice: This project is an engineering exploration and prototype. It does not provide medical diagnoses or clinical validation.*

---

## 📊 Feature Status Matrix (Truth in Engineering)

To maintain technical honesty, every feature is explicitly classified below:

| Feature / Domain | Status | Description & Traceable Evidence |
| :--- | :--- | :--- |
| **Authentication & Password Security** | **`IMPLEMENTED`** | Bcrypt hashing (10 salt rounds), password hidden from queries (`select: false`), reset tokens stored as SHA-256 with 1-hour TTL, password reset invalidates active tokens. Tested in `dr-ai-backend/tests/auth.test.ts`. |
| **Role-Based Access Control (RBAC)** | **`IMPLEMENTED`** | Strict server-side JWT verification with algorithm whitelisting (`HS256`). Separate boundaries for `patient`, `doctor`, and `admin`. Patients cannot self-assign doctor roles. Tested in `dr-ai-backend/tests/rbac.test.ts`. |
| **Appointment Engine & Concurrency** | **`IMPLEMENTED`** | MongoDB-backed appointments with compound unique indexes `(doctorId, date, time)` preventing double-booking (409 Conflict). Validated state machine (`scheduled` → `in_progress` → `completed` / `cancelled`). Tested in `dr-ai-backend/tests/appointments.test.ts`. |
| **Clinical AI Safety Layer** | **`IMPLEMENTED`** | Deterministic pre-flight regex check intercepts acute emergencies (chest pain, stroke, dyspnea, suicide) before LLM inference. OpenAI structured JSON differential diagnosis with deterministic fallback when API keys are unconfigured. **Zero fabricated confidence percentages**. Tested in `dr-ai-backend/tests/ai_safety.test.ts`. |
| **Input Sanitization & Injection Guards** | **`IMPLEMENTED`** | Centralized NoSQL injection mitigation, safe parameter validation, path traversal guards, and PII masking (SSN, payment card). Route-specific rate limiters. Tested in `dr-ai-backend/tests/security.test.ts` and `src/security_suite.test.ts`. |
| **Telehealth Video Consult** | **`SIMULATED / HYBRID`** | Real browser webcam/microphone capture via `navigator.mediaDevices.getUserMedia` with self-view rendering. Remote participant is explicitly labeled as a demonstration preview. |
| **Prescription Records** | **`SIMULATED`** | Server-side Mongoose Prescription model with cryptographic Rx IDs, doctor-only issuance, and ownership checks. UI and PDF exports are stamped: `DEMO PRESCRIPTION — NOT DIGITALLY SIGNED`. |
| **Emergency Facility Locator** | **`SIMULATED AVAILABILITY`** | Real browser GPS geolocation (`navigator.geolocation.getCurrentPosition`) with regional fallback. ER wait times are clearly labeled as `[DEMO DATA — SIMULATED AVAILABILITY]`. |
| **Multi-Party WebRTC Signaling** | **`PLANNED`** | LiveKit / SFU peer signaling mesh planned for multi-participant clinical teleconferences. |
| **DEA / EPCS E-Prescribing Gateway**| **`PLANNED`** | Surescripts certified identity proofing and DEA-compliant digital signing keys planned for legal pharmacy routing. |

---

## 🏗️ System Architecture

```
                                  ┌─────────────────────────────┐
                                  │   Browser / React Frontend  │
                                  │  (Axios Client + JWT Auth)  │
                                  └──────────────┬──────────────┘
                                                 │ HTTPS / JSON
                                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ Express Security Pipeline (dr-ai-backend)                                                   │
│                                                                                             │
│  [Helmet Security Headers] ──► [CORS Whitelist] ──► [Observability / Req ID]               │
│                                                          │                                  │
│  [Rate Limiter] ◄──────── [NoSQL & Path Sanitizer] ◄─────┘                                  │
│        │                                                                                    │
│        ▼                                                                                    │
│  [JWT Authenticate & Authorize Middleware (Patient / Doctor / Admin)]                       │
└────────────────────────────────────────┬────────────────────────────────────────────────────┘
                                         │
                 ┌───────────────────────┼───────────────────────┐
                 ▼                       ▼                       ▼
      ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐
      │ Auth & Profiles    │  │ Appointments API   │  │ Clinical AI Triage │
      │ - Bcrypt hash      │  │ - Concurrency lock │  │ - Emergency Filter │
      │ - Token expiration │  │ - State machine    │  │ - Structured Diff  │
      │ - Password reset   │  │ - Ownership check  │  │ - OpenAI fallback  │
      └─────────┬──────────┘  └─────────┬──────────┘  └─────────┬──────────┘
                │                       │                       │
                └───────────────────────┼───────────────────────┘
                                        ▼
                         ┌─────────────────────────────┐
                         │   MongoDB Persistence       │
                         │   - Users & Doctors         │
                         │   - Compound Index Slots    │
                         │   - Prescriptions & Chats   │
                         └─────────────────────────────┘
```

---

## 🛡️ Security & Clinical Guardrail Model

### 1. Deterministic Emergency Safeguards
Healthcare AI must never attempt speculative diagnosis during acute emergencies. Our `ClinicalConversationService` checks queries against red-flag clinical signatures:
- **Cardiovascular**: Crushing chest pain, left-arm radiating pressure, cold sweats.
- **Neurological**: Sudden facial droop, asymmetric arm weakness, acute slurred speech (FAST criteria).
- **Respiratory**: Severe dyspnea, acute respiratory distress, inability to speak in full sentences.
- **Psychiatric / Poisoning**: Suicidal ideation, drug overdose ingestion.

When triggered, LLM generation is bypassed entirely and the patient receives emergency escalation directives (911 dispatch guidance).

### 2. Defensible AI Provenance
- Clinical outputs provide **qualitative urgency rankings** (High, Moderate, Low) rather than pseudo-scientific percentages (e.g., "94.2% match").
- Every differential response includes explicit educational source provenance (`clinical_guidelines_v1` or `openai_gpt4o`).
- Clarifying questions and red-flag warning signs are structured according to clinical decision support standards.

### 3. Server-Side Identity & Data Boundaries
- Tokens are signed with `HS256` using validated server secrets (minimum 32 characters; rejected if set to default placeholders).
- Passwords require minimum 8 characters with at least one number and letter.
- Doctor accounts cannot be self-registered via the public sign-up endpoint.
- User profile updates reject privilege escalation attempts (e.g. mass assignment of `role: admin`).

---

## 📁 Repository Structure

```
dr-ai-clone/
├── src/                                  # React 18 SPA Frontend
│   ├── components/
│   │   ├── Navbar.tsx                    # Role-aware nav with authenticated demo indicator
│   │   ├── Footer.tsx                    # Transparent prototype notices and legal terms
│   │   ├── BookingModal.tsx              # Conflict-aware appointment scheduling dialog
│   │   ├── PrescriptionModal.tsx         # Honest unsigned demo consultation PDF exporter
│   │   ├── EmergencyModal.tsx            # Emergency 911 dispatch hotline modal
│   │   ├── BodyMap.tsx                   # Interactive anatomical symptom locator
│   │   └── VitalsChart.tsx               # SVG clinical telemetry visualizer
│   ├── context/
│   │   ├── AuthContext.tsx               # Server-backed auth state with scoped demo evaluator
│   │   ├── AppointmentContext.tsx        # API-driven appointment state & doctor catalog
│   │   └── ThemeContext.tsx              # Dark/Light mode theme state
│   ├── pages/
│   │   ├── Home.tsx                      # Truthful hero, architecture metrics, and FAQs
│   │   ├── Chat.tsx                      # Clinical AI assistant with fallback provenance
│   │   ├── VideoConsult.tsx              # Simulated telehealth room with local media preview
│   │   ├── Hospitals.tsx                 # Geolocation GPS locator with demo availability
│   │   ├── Login.tsx / Signup.tsx        # Real backend auth forms + demo quick-logins
│   │   ├── ForgotPassword.tsx            # Cryptographic token password recovery
│   │   └── Profile.tsx                   # Patient health records & vitals dashboard
│   ├── services/
│   │   ├── api.ts                        # Axios client with Bearer auth & 401 interceptor
│   │   ├── authService.ts                # Auth API endpoints
│   │   ├── appointmentService.ts         # Booking and doctor catalog endpoints
│   │   ├── chatService.ts                # Clinical message and intake endpoints
│   │   └── prescriptionService.ts        # Prescriptions API endpoints
│   └── utils/
│       └── sanitize.ts                   # Client input sanitization and PII masking
│
└── dr-ai-backend/                        # Production-Oriented Express API
    ├── src/
    │   ├── config/env.ts                 # Strict environment configuration & secrets check
    │   ├── errors/AppError.ts            # Typed operational error hierarchy
    │   ├── middleware/
    │   │   ├── auth.ts                   # HS256 JWT verify & RBAC gate
    │   │   ├── errorHandler.ts           # Centralized safe error responder
    │   │   ├── observability.ts          # Structured logging with correlation IDs
    │   │   ├── rateLimiter.ts            # Route-specific brute-force protections
    │   │   └── sanitize.ts               # NoSQL injection and path traversal guards
    │   ├── models/
    │   │   ├── User.ts                   # Bcrypt hashed credentials & roles
    │   │   ├── Doctor.ts                 # Provider credentials & slot schema
    │   │   ├── Appointment.ts            # Concurrency-safe appointments with state machine
    │   │   ├── Prescription.ts           # Audited medication orders with crypto IDs
    │   │   └── Chat.ts                   # Clinical dialogue turns & triage audits
    │   ├── routes/
    │   │   ├── auth.ts                   # Register, Login, Me, Profile, Password Reset
    │   │   ├── doctors.ts                # Provider queries with seed fallback
    │   │   ├── appointments.ts           # Double-booking protected scheduler
    │   │   ├── chat.ts                   # Guardrailed clinical AI intake & triage
    │   │   └── prescriptions.ts          # Doctor-authorized prescription creation
    │   ├── services/
    │   │   ├── ClinicalConversationService.ts # Deterministic emergency intercept & AI logic
    │   │   └── EmailService.ts           # Password recovery delivery abstraction
    │   ├── seed/seed.ts                  # Database seeder for demo accounts & doctors
    │   ├── app.ts                        # Express application configuration
    │   └── server.ts                     # Database connection & HTTP server entry
    └── tests/
        ├── auth.test.ts                  # Authentication integration tests
        ├── rbac.test.ts                  # Role-based access control tests
        ├── appointments.test.ts          # Double-booking & concurrency tests
        ├── ai_safety.test.ts             # Deterministic emergency intercept tests
        └── security.test.ts              # Sanitization & rate limiting tests
```

---

## 🚀 Quick Start & Verification

### 1. Prerequisites
- **Node.js**: v18+ (tested up to Node v26)
- **MongoDB**: Optional for development (runs with automatic offline fallback, or connects to MongoDB on `localhost:27017`)

---

### ⚙️ Environment Configuration

Copy example environment files before launching:

```bash
# Frontend environment (.env)
cp .env.example .env

# Backend environment (dr-ai-backend/.env)
cp dr-ai-backend/.env.example dr-ai-backend/.env
```

Key environment variables:
- **Frontend** (`.env`):
  - `REACT_APP_API_URL`: Backend API base URL (default: `http://localhost:5000/api`)
  - `REACT_APP_DEMO_MODE`: Enables quick-login evaluator accounts (default: `true`)
- **Backend** (`dr-ai-backend/.env`):
  - `PORT`: HTTP server port (default: `5000`)
  - `NODE_ENV`: `development` | `production` | `test`
  - `MONGODB_URI`: MongoDB connection URI (default: `mongodb://localhost:27017/dr-ai`)
  - `JWT_SECRET`: Signing secret (required in production, min 32 characters)
  - `OPENAI_API_KEY`: Optional OpenAI key; falls back to deterministic triage if omitted
  - `CORS_ORIGIN`: Allowed frontend origin (default: `http://localhost:3000`)
  - `DEMO_MODE`: Enables demo seed data (default: `true`)

---

### ⚡ Exact Startup Commands

Install dependencies and start services concurrently:

```bash
# Install root and backend dependencies
npm install --legacy-peer-deps
npm --prefix dr-ai-backend install --legacy-peer-deps

# Start both Backend (port 5000) and Frontend (port 3000)
npm run dev
# (or: npm start)
```

Verified access points:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend**: [http://localhost:5000](http://localhost:5000)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

### 🧪 Automated Tests & AI Safety Evaluation

```bash
# Run frontend test suite (30 unit & security tests)
npm test

# Run backend integration & concurrency test suite (69 tests)
npm run test:backend

# Run deterministic AI safety & triage evaluation harness
npm run evaluate:ai

# Build production artifacts
npm run build
npm run build:backend
```

---

### 4. Evaluator Demo Credentials
For frictionless evaluation without registering a new email:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Demo Patient** | `patient@example.com` | `PatientPass123` | AI symptom triage, appointment booking, personal vitals |
| **Demo Doctor** | `doctor@example.com` | `DoctorPass123` | Clinical consult reviews, prescription issuance |
| **Demo Admin** | `admin@example.com` | `AdminPass123` | System oversight, user list access |

---

## ⚠️ Current Limitations

To maintain strict engineering honesty, the following genuine architectural boundaries apply:

1. **Not a Diagnostic Medical Device**: Dr.AI is an engineering prototype for demonstrating decision support workflows. It has not undergone clinical validation, FDA 510(k) clearance, or CE mark certification.
2. **Deterministic Pre-Flight Emergency Filter**: While regex-based emergency screening catches recognized high-acuity keywords, unlisted idiosyncratic phrases may bypass pre-flight checks and fall back to LLM inference or default guidelines.
3. **Simulated Telehealth Media Mesh**: Video consultations render the user's local camera/mic stream alongside simulated provider demonstration streams. Multi-participant SFU signaling (e.g. LiveKit) is planned for future implementation.
4. **Demonstration Prescription Records**: Prescriptions generated in this application are stamped `DEMO PRESCRIPTION — NOT DIGITALLY SIGNED` and cannot be dispensed at pharmacies. Integration with Surescripts / DEA EPCS gateways is planned.
5. **Simulated Hospital Telemetry**: ER wait times, bed availability, and trauma capabilities are simulated demonstration records. The system does not interface with municipal 911 dispatch networks.
6. **Persistence Fallback**: When MongoDB is not running locally, backend endpoints operate in an ephemeral in-memory fallback mode. Full persistence requires an active MongoDB database.

---

## ⚖️ Clinical Disclaimer & Ethics Notice

**Dr.AI is a software architecture prototype designed for clinical decision support research, engineering demonstrations, and medical triage interface exploration.**

- **Not an FDA-Cleared Device**: Dr.AI is not a diagnostic device and must not be used as a replacement for professional clinical judgment, physical examination, or diagnostic laboratory testing.
- **Emergency Situations**: In the event of acute chest pain, neurological deficit, severe shortness of breath, heavy hemorrhage, or suicidal thoughts, contact emergency services (**911** in the US, **112** in the EU, **999** in the UK) immediately.
- **Prescription Simulation**: Prescriptions generated within this application are simulation records for user-interface demonstration and cannot be dispensed at commercial pharmacies.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).