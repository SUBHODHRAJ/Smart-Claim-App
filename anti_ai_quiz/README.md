# CogniQuiz AI — Source-Grounded Personalized AI Assessment Platform

> **CogniQuiz AI is not simply an AI question-generation tool. It is a personalized learning and assessment platform where AI creates grounded learning content, teachers review and maintain quality, and student performance continuously drives adaptive learning.**

---

## 🌟 Hackathon USP & Complete Learning Loop

```text
Study Material (PDF/Text)
      ↓
AI Content Generation (Structured Grounded MCQs)
      ↓
AI Quality Scoring (Relevance, Distractor, Ambiguity Detection)
      ↓
Teacher Review Studio (Edit, Approve, Calibrate Difficulty)
      ↓
Quiz / Flashcards / Assignments
      ↓
Student Timed Practice (Authoritative Server Timer)
      ↓
Automatic Evaluation & Source Verification ("View Source" Citations)
      ↓
Deterministic Performance Engine & Weak Topic Detection
      ↓
AI Learning Recommendation & 7-Day Personalized Study Plan
      ↓
Adaptive Quiz Engine (Difficulty Distribution & Weak Topic Targeting)
      ↓
Student Mastery & Knowledge Retention
```

---

## 🚀 Key Features

### 1. Source-Grounded Document Ingestion
- Upload PDF, DOCX, TXT, or paste lecture notes.
- In-memory PDF text extraction, text sanitization, and semantic chunking with page number references.
- Private document isolation: Student materials remain private to their owner unless explicitly shared.

### 2. AIService & Structured Question Generation
- Multi-provider support (Google Gemini, OpenAI GPT-4o-mini, Groq Llama 3) with intelligent source-grounded heuristic extractor fallback for offline/test environments.
- Strict Zod schema validation ensuring consistent JSON output.
- **AI Quality Score (0–100%)**: Automatically evaluates distractor plausibility, question clarity, and source grounding.

### 3. Teacher Question Review Studio
- Full matrix question review: inline editing of question text and distractors, 1-click Approve/Reject, and manual question authoring.
- Quiz publishing control and class assignments with due dates and time limits.

### 4. Authoritative Timed Student Quiz Player
- Server-synchronized countdown timer with automatic submission on timer expiration.
- Dynamic question navigator, progress tracking, and anti-tamper submission guards.

### 5. Transparent Source Verification ("View Source")
- Every evaluated question features a **"View Source"** button that displays the exact source textbook title, page number, and extracted snippet supporting the correct answer.

### 6. Performance Engine & Weak Topic Detection
- Deterministic calculation of overall accuracy, topic-by-topic mastery, difficulty performance, and trends.
- Weak topic threshold detection (accuracy < 65%) automatically triggers remedial recommendations.

### 7. Adaptive Quiz Engine
- Recalibrates question difficulty distribution dynamically based on past attempt performance:
  - *High Performers (≥80%)*: 20% Easy / 50% Medium / 30% Hard
  - *Struggling Learners (≤50%)*: 50% Easy / 40% Medium / 10% Hard
- Prioritizes questions from detected weak topics.

### 8. Spaced Repetition Flashcards & Personal Notes
- Interactive 3D flip flashcards categorized by `LEARNING`, `KNOWN`, and `DIFFICULT`.
- Private student study notebook with topic tags and search.

### 9. Gamification & Weekly Leaderboards
- Milestones and badges: *First Quiz*, *Perfect Score*, *Lightning Learner*, *3-Day Streak*, *7-Day Streak*.
- Daily streak tracking with single-increment calendar-day protection.
- Privacy-safe weekly student rankings.

### 10. Teacher Class Analytics
- Class average scores, completion rates, topic accuracy distributions (Recharts), and curriculum gap identification.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts, React Router v6, Axios |
| **Backend** | Node.js, Express.js, TypeScript, MongoDB, Mongoose, JWT, bcryptjs, Multer, pdf-parse, Zod |
| **AI Integration** | Google Gemini API / OpenAI API / Semantic Grounded Fallback Engine |
| **Testing** | Node / ts-node automated test runner |

---

## 📂 Project Structure

```text
ai-quiz-generator/
│
├── client/                     # React 18 + Vite + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── components/        # Navbar, Sidebar, StatsCard, SourceModal, QuestionCard
│   │   ├── context/           # AuthContext, ThemeContext
│   │   ├── layouts/           # DashboardLayout
│   │   ├── pages/
│   │   │   ├── student/       # Dashboard, Quizzes, QuizPlayer, Results, Performance, Flashcards, Notes, Leaderboard, StudyPlan
│   │   │   ├── teacher/       # Overview, Documents, AIQuizGeneratorStudio, Quizzes, Assignments, Analytics
│   │   │   ├── admin/         # Platform Metrics, User Directory
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── services/          # Axios API clients for all endpoints
│   │   ├── types/             # TypeScript interfaces
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
├── server/                     # Node.js + Express + TypeScript + MongoDB
│   ├── src/
│   │   ├── config/            # DB connection, environment variables
│   │   ├── controllers/       # Auth, Document, AI, Quiz, Attempt, Performance, Flashcard, Note, Assignment, Admin
│   │   ├── middleware/        # authMiddleware, roleMiddleware, errorHandler, uploadMiddleware
│   │   ├── models/            # User, Document, Question, Quiz, Attempt, Performance, Flashcard, Note, Assignment, Achievement, StudyPlan
│   │   ├── routes/            # API Route definitions
│   │   ├── services/          # AuthService, DocumentService, AIService, QuizService, EvaluationService, PerformanceService, AdaptiveService, FlashcardService, AssignmentService, GamificationService
│   │   ├── utils/             # PDF text extraction, chunker, standard responses
│   │   ├── app.ts             # Express setup
│   │   ├── server.ts          # Server listener
│   │   └── seed.ts            # Development & demo seed data
│   ├── test-runner.ts         # Automated backend test suite
│   └── package.json
│
├── package.json               # Root workspace script runner
└── README.md
```

---

## ⚙️ Environment Variables

### Backend (`server/.env` or root `.env`)
```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/ai_quiz_generator
JWT_SECRET=super_secret_jwt_key_ai_quiz_gen_2026_secure
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
AI_API_KEY=your_gemini_or_openai_key_here  # Optional: Fallback engine operates when empty
AI_PROVIDER=gemini                        # gemini or openai
MAX_FILE_SIZE_MB=15
WEAK_TOPIC_THRESHOLD_PERCENT=65
```

### Frontend (`client/.env`)
```env
VITE_API_URL=http://localhost:5001/api
```

---

## ⚡ Quick Start & Running Locally

### 1. Start MongoDB
Ensure MongoDB is running locally on port `27017` or update `MONGODB_URI`.

### 2. Install & Seed Database
```bash
# In server directory
cd server
npm install
npm run dev

# Seed demo accounts and sample Operating Systems course material
npx ts-node src/seed.ts
```

### 3. Run Frontend
```bash
# In client directory
cd client
npm install
npm run dev
```

### 4. Open Application
- **Frontend URL**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5001/api](http://localhost:5001/api)

---

## 🔑 Demo Login Accounts

| Role | Email | Password | Features |
|---|---|---|---|
| **Teacher** | `teacher@test.com` | `password123` | Upload PDFs, AI Quiz Studio, Question Review, Class Analytics |
| **Student A** | `studentA@test.com` | `password123` | Timed Quizzes, Explanations & Source Citations, Adaptive Practice, Flashcards |
| **Student B** | `studentB@test.com` | `password123` | User Isolation Verification, Separate attempts & notes |
| **Admin** | `admin@test.com` | `password123` | Platform Metrics, User Directory, Role Management |

*(1-Click Demo Login buttons are available directly on the `/login` page for fast review)*

---

## 🧪 Testing & Verification

Run the automated test suite covering all 8 critical operational groups:
```bash
cd server
npm test
```

### Verified Test Groups:
1. **Authentication & JWT**: Registration, login, password hashing, token expiration, invalid credential rejection (401).
2. **Document Processing & User Isolation**: Text extraction, semantic chunking, and strict access rejection (403) when Student B attempts to access Student A's private documents.
3. **Source-Grounded AI Generation**: Structured JSON output, option validation, AI quality score calculation, and page citations.
4. **Teacher Review & Publishing**: Question status transitions (`PENDING` -> `APPROVED`), distractor edits, and quiz publishing.
5. **Timed Quiz Attempt & Evaluation**: Server-side attempt tracking, automatic scoring, time elapsed calculation, and topic breakdown.
6. **Attempt User Isolation**: Direct attempt ID inspection rejection (403) across accounts.
7. **Performance Engine & Adaptive Engine**: Historical accuracy calculations, weak topic detection, and adaptive quiz generation.
8. **AI Study Plan & Gamification**: 7-Day learning trajectory generation, milestone badge unlocking, and weekly leaderboard computation.

---

## 🔒 Security & User Isolation Policy

- **Token-Derived Identity**: The authenticated user is derived solely from verified JWT payloads—never from request bodies or URL parameter substitutions.
- **Role-Based Guards**: Protected endpoints enforce strict roles (`STUDENT`, `TEACHER`, `ADMIN`).
- **Answer Protection**: Quizzes fetched by students omit `correctAnswer` and `explanation` until an authoritative submission is evaluated on the server.
- **Safe State Reset**: Client auth state and storage are completely flushed upon logout or account switching.
