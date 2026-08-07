# Guldasta
### AI-Powered Relationship Intelligence & Gifting Platform

> *Guldasta* (meaning "bouquet" in Urdu) — a curated, personalised approach to gifting and celebrating the people who matter most.

**Live demo:** [guldasta-app.vercel.app](https://guldasta-app.vercel.app)

---

## What is Guldasta?

Most gifting apps are just storefronts. Guldasta starts from the **relationship** — who the person is, what you know about them, what has already been given — and uses that context to drive AI gift recommendations and AI-written personal messages.

Built as a full-stack project by [Akshita Sarda](https://github.com/akshita19904).

---

## Features

###  People & Relationship Management
Add people to your circle with relationship type, birthday, anniversary, interests, age, gender, and freeform notes. Every other feature pulls from this context.

###  Relationship Memory (Notes)
A lightweight journal per person. Notes feed directly into AI prompts so suggestions feel specific — not generic.

###  AI Gift Suggestions
A two-stage pipeline:
1. **Scoring engine** ranks all in-stock products using 7 weighted dimensions: interest match (with synonym expansion), budget fit, occasion fit, relationship affinity, gender/age fit, past gift penalty, and platform popularity.
2. **Groq LLaMA** (`openai/gpt-oss-120b`) personalises the top 10 scored results — writing a specific "why this suits them" reason for each.

Suggestions only pick from real catalog products, never invented items. Falls back gracefully if AI is unavailable.

###  AI Messages
Generate personalised messages in 4 tones — warm, funny, poetic, or short — using the person's name, relationship, interests, and any extra context you provide. Includes one-click **Share on WhatsApp** and **Open in Email** integrations.

###  Gift Store & Fast Order Confirmation
73+ products across 7 categories: Bouquets, Hampers, Experiences, Cakes, Personalised, Plants, Combos. Each with real product images (Pexels CDN), rich descriptions, and semantic tags. Includes:
- Cart with persistent localStorage
- Optimistic order placement UX with non-blocking async background email processing (~30ms response time)
- Dedicated Order Confirmation modal with order ID, delivery date, and total paid summary
- One-click category tab auto-selection & highlighted product scroll from Gifts view

###  Password Reset & Security Flow
- Secure JWT-based stateless authentication
- Password hashing with Bcrypt ($2^{12}$ salt rounds)
- Full **Forgot Password / Password Reset** workflow via single-use SHA-256 hashed tokens and 1-hour expiration timers with branded HTML email templates

###  Celebrations & Reminders
A unified Celebrations page with timeline and month-grid views. Reminders from three sources:
- **Auto-synced** from People (birthdays, anniversaries)
- **Custom** reminders (any date, any title)
- **Indian holiday sync** (Republic Day, Holi, Diwali, etc.)

###  Cron-Based Reminder Emails
A daily midnight cron job (`node-cron`) sends three types of emails:

| Type | Trigger |
|---|---|
| Advance notice | `remindDaysBefore` days before the date |
| Same-day | On the actual date |
| Catch-up | If server was down (3-day grace window) |

Tracks sent/not-sent per reminder per year via `advanceNotifSent`, `sameDayNotifSent`, and `notifYear` fields — so recurring birthday reminders reset correctly each year.

###  Admin Console
Gated by an email allow-list (`ADMIN_EMAILS` env var). Includes:
- **Orders** — view all orders, filter by status, advance through pipeline (`pending` → `confirmed` → `preparing` → `out_for_delivery` → `delivered`), cancel
- **Analytics dashboard** — total users, orders, revenue, best-selling products, most popular categories, AI usage by type with success rates, 6-month orders trend

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| Database | MongoDB Atlas (Mongoose ODM) |
| AI | Groq — `openai/gpt-oss-120b` (configurable via `GROQ_MODEL`) |
| Email | Nodemailer (Gmail SMTP) |
| Scheduling | node-cron (in-process) |
| Images | Pexels API (CDN URLs stored in DB) |
| Frontend hosting | Vercel |
| Backend hosting | Render |

---

## Architecture

```
backend/src/
  models/         User, Person, Reminder, Gift, Product, Order, Note, AiUsageLog
  controllers/    authController, personController, orderController, giftController, messageController, etc.
  routes/         auth, people, orders, gifts, messages, celebrations, etc.
  middleware/     auth.ts (JWT protect), admin.ts (email allow-list)
  services/       emailService, reminderCronService, reminderCron, aiUsageLogger, scoringEngine
  scripts/        seedCatalog.ts, fetchWebGifts.ts, warmEmbeddings.ts

frontend/src/
  pages/          Dashboard, People, Celebrations, Gifts, Store, Customize,
                  Messages, Orders, Settings, AdminOverview, AdminOrders, Login, Register, ResetPassword
  components/     Layout, AdminLayout
  context/        AuthContext
  utils/          api.ts (axios instance)
```

---

## Data Models

```
User          → name, email, password (bcrypt), avatar, notificationsEnabled, resetPasswordToken, resetPasswordExpires
Person        → userId, name, relationship, birthday, anniversary, interests, age, gender, notes
Note          → userId, personId, content (relationship memory)
Gift          → userId, personId, title, category, occasion, isSaved, isAIGenerated
Product       → name, description, price, category, imageUrl, tags, inStock, isCustomizable, customizationOptions
Order         → userId, items[], totalAmount, recipientName, deliveryAddress, deliveryDate, status, giftMessage
Reminder      → userId, personId?, title, date, type, remindDaysBefore, recurringYearly, advanceNotifSent, sameDayNotifSent, notifYear
AiUsageLog    → userId, type (gift_suggestion|message_single|message_multi), success
```

---

## Getting Started (Local)

### Prerequisites
- Node.js 18+
- MongoDB Atlas cluster
- Groq API key ([console.groq.com](https://console.groq.com))
- Gmail account with App Password enabled

### Backend setup

```bash
cd backend
npm install
```

Create `backend/.env`:
```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-120b
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
ADMIN_EMAILS=your_admin_email@gmail.com
FRONTEND_URL=http://localhost:5173
PEXELS_API_KEY=your_pexels_api_key
```

```bash
npm run dev
```

### Frontend setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

### Seed the catalog

```bash
cd backend
npx ts-node src/scripts/seedCatalog.ts
npx ts-node src/scripts/fetchWebGifts.ts
```

This seeds 73+ products with real Pexels images. Safe to re-run — uses upsert by name.

---

## Deployment

| Service | Platform | Notes |
|---|---|---|
| Frontend | Vercel | Auto-deploys on push to `main` |
| Backend | Render | May sleep on inactivity — first request takes ~50s |
| Database | MongoDB Atlas | Whitelist `0.0.0.0/0` for Render's dynamic IPs |

---

## Roadmap

- [ ] Forgot password / email reset flow
- [ ] Embeddings + semantic person-profile similarity (HuggingFace `all-MiniLM-L6-v2`)
- [ ] MongoDB Atlas Vector Search
- [ ] Upgrade Render to always-on instance for reliable cron
