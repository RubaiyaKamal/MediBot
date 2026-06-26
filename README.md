# MediBot — AI Clinic Chatbot

MediBot is a general-purpose AI-powered chatbot for clinics, hospitals, and GPs. It lets patients book appointments, get answers to common questions, and describe symptoms — all through a simple chat interface in **English or Urdu**.

---

## What It Does

### For Patients
- **Book appointments** — tell the bot your name, preferred doctor, date, and time; it confirms and saves the booking
- **Check doctor availability** — ask which doctors are available on a specific day
- **View doctors** — see all doctors, their specialties, and available days
- **Get FAQ answers** — opening hours, fees, payment methods, walk-in policy, and more
- **Symptom queries** — describe symptoms; bot suggests the right specialist and recommends seeing a doctor (never diagnoses)
- **Bilingual** — type in English or Urdu (Roman or Nastaliq script); bot detects and replies in the same language
- **Emergency guidance** — always shows emergency number 1122 prominently

### For Clinic Admins
- **Admin dashboard** — view and manage all appointments
- **Confirm appointments** — change status from Pending to Confirmed
- **Manage doctors** — add or remove doctors with their specialties and available days
- **Manage FAQs** — add questions and answers in both English and Urdu
- **Multi-clinic support** — one deployment serves multiple clinics, each with their own data

---

## Tech Stack

| Layer | Technology |
|---|---|
| **AI / Chatbot** | OpenAI GPT-4o-mini with function calling |
| **Backend** | Python 3.12 + FastAPI |
| **Database** | SQLite (local) / PostgreSQL (production) via SQLModel |
| **Authentication** | JWT tokens (admin login) + bcrypt password hashing |
| **Frontend** | React 18 + TypeScript + TailwindCSS |
| **Routing** | Vite dev server with proxy to FastAPI |
| **Translations** | i18next (English + Urdu locale files) |
| **Markdown** | react-markdown (renders bot replies with lists, bold, etc.) |
| **Email** | Python smtplib — appointment confirmation emails |
| **Deployment** | Docker Compose (Postgres + FastAPI + React) |

---

## Project Structure

```
MediBot/
├── backend/
│   ├── app/
│   │   ├── core/          # Config, database, JWT security
│   │   ├── models/        # SQLModel tables (clinics, doctors, appointments, FAQs, chat)
│   │   ├── routes/        # API endpoints (chat, auth, clinics, doctors, FAQs, appointments)
│   │   └── services/      # OpenAI GPT service, appointment logic, FAQ search
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/    # ChatWindow, MessageBubble, TypingIndicator, QuickReplies
│   │   ├── pages/         # ChatPage (patients), AdminPage (clinic staff)
│   │   ├── services/      # Axios API calls
│   │   └── locales/       # en.json and ur.json translation files
│   └── package.json
└── docker-compose.yml
```

---

## How to Run Locally

### 1. Backend
```bash
cd backend
py -3.12 -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
# Copy .env.example to .env and fill in OPENAI_API_KEY and SECRET_KEY
python -m uvicorn app.main:app --reload
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Open in browser
| URL | Purpose |
|---|---|
| http://localhost:5173 | Patient chat |
| http://localhost:5173/admin | Admin dashboard |
| http://localhost:8000/docs | API documentation (Swagger) |

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in:

```
DATABASE_URL=sqlite:///./medibot.db
OPENAI_API_KEY=sk-...
SECRET_KEY=<long-random-string>
MAIL_USERNAME=your@gmail.com        # optional, for confirmation emails
MAIL_PASSWORD=your-app-password     # Gmail App Password
```

---

## Demo Clinics

| Clinic | Slug | Admin Password |
|---|---|---|
| MediCare Clinic Karachi | `medicare-karachi` | `admin123` |
| Al-Shifa Hospital | `al-shifa` | `admin123` |

---

## Roadmap (Advanced Features)

- SMS / WhatsApp appointment reminders (Twilio)
- Google Calendar sync for doctor schedules
- Patient login and appointment history
- Voice input (Web Speech API)
- Analytics dashboard
- Prescription refill requests
- Embeddable widget (`<script>` tag for any clinic website)
