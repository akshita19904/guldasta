# Guldasta git add README.md
### AI-Powered Relationship Intelligence & Gifting Platform

> *Guldasta* (meaning "bouquet" in Urdu) — a curated, personalised approach to gifting and celebrating the people who matter most.

**Live demo:** [guldasta-app.vercel.app](https://guldasta-app.vercel.app)

---

## What is Guldasta?

Most gifting apps are just storefronts. Guldasta starts from the **relationship** — who the person is, what you know about them, what has already been given — and uses that context to drive AI gift recommendations and AI-written personal messages.

Built as a full-stack placement project by [Akshita Sarda](https://github.com/akshita19904).

---

## Features

###  People & Relationship Management
Add people to your circle with relationship type, birthday, anniversary, interests, age, gender, and freeform notes. Every other feature pulls from this context.

###  Relationship Memory (Notes)
A lightweight journal per person. Notes feed directly into AI prompts so suggestions feel specific — not generic.

###  AI Gift Suggestions
A two-stage pipeline:
1. **Scoring engine** ranks all in-stock products using 7 weighted dimensions: interest match (with synonym expansion), budget fit, occasion fit, relationship affinity, gender/age fit, past gift penalty, and platform popularity
2. **Groq LLaMA** personalises the top 10 scored results — writing a specific "why this suits them" reason for each

Suggestions only pick from real catalog products, never invented items. Falls back gracefully if AI is unavailable.

###  AI Messages
Generate personalised messages in 4 tones — warm, funny, poetic, or short — using the person's name, relationship, interests, and any extra context you provide.

###  Gift Store
56 products across 7 categories: Bouquets, Hampers, Experiences, Cakes, Personalised, Plants, Combos. Each with real product images (Pexels CDN), rich descriptions, and 6–8 semantic tags. Includes:
- Cart with persistent localStorage
- Bouquet customiser (colours, sizes, add-ons)
- Checkout with delivery details and gift message
- One-click reorder from order history

###  Celebrations & Reminders
A unified Celebrations page with timeline and month-grid views. Reminders from three sources:
- **Auto-synced** from People (birthdays, anniversaries)
- **Custom** reminders (any date, any title)
- **Indian holiday sync** (Republic Day, Holi, Diwali, etc.)

Soft-delete behaviour: synced reminders that are manually deleted won't be recreated on re-sync.

###  Cron-Based Reminder Emails
A daily midnight cron job (node-cron) sends three types of emails:

| Type | Trigger |
|---|---|
| Advance notice | `remindDaysBefore` days before the date |
| Same-day | On the actual date |
| Catch-up | If server was down (3-day grace window) |

Tracks sent/not-sent per reminder per year via `advanceNotifSent`, `sameDayNotifSent`, and `notifYear` fields — so recurring birthday reminders reset correctly each year.

###  Admin Console
Gated by an email allow-list (`ADMIN_EMAILS` env var). Includes:
- **Orders** — view all orders, filter by status, advance through pipeline (pending → confirmed → preparing → out for delivery → delivered), cancel
- **Analytics dashboard** — total users, orders, revenue, best-selling products, most popular categories, AI usage by type with success rates, 6-month orders trend

###  AI Usage Logging
Every Groq API call (gift suggestions, single messages, multi-messages) is logged to `AiUsageLog` with type and success/failure status. Powers the admin analytics AI-usage panel.

###  Settings
- Edit profile (name, avatar colour)
- Change password (with current password verification)
- Toggle reminder email notifications on/off (respected by the cron job)

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
  controllers/    one per resource
  routes/         one per resource, mounted under /api/*
  middleware/     auth.ts (JWT protect), admin.ts (email allow-list)
  services/       emailService, reminderCronService, reminderCron, aiUsageLogger, scoringEngine
  scripts/        seedCatalog.ts, warmEmbeddings.ts

frontend/src/
  pages/          Dashboard, People, Celebrations, Gifts, Store, Customize,
                  Messages, Orders, Settings, AdminOverview, AdminOrders, Login, Register
  components/     Layout, AdminLayout
  context/        AuthContext
  hooks/          useGiftHistory, useNotes
  utils/          api.ts (axios instance)
```

---

## Recommendation Scoring Engine

The gift scoring engine runs before the AI and ranks all 56 products deterministically:

| Dimension | Weight | Method |
|---|---|---|
| Interest match | 28% | Keyword overlap + synonym expansion (cars → adventure/experience) |
| Budget fit | 22% | 100 if within range, linear decay above max (0 at 2× max) |
| Occasion fit | 18% | Product tags matched against occasion keyword map |
| Relationship fit | 15% | Category/tag affinity per relationship type |
| Gender/age fit | 10% | Penalty for strongly mismatched products (e.g. New Mum Hamper for teen male) |
| Past gift penalty | 4% | Fades over 2 years for exact repeats, 90 days for same-category |
| Popularity | 3% | Normalised units-sold from Order aggregation |

The AI only sees the top 10 pre-ranked products and personalises — it doesn't filter or rank.

---

## Data Models

```
User          → name, email, password (bcrypt), avatar, notificationsEnabled
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
```

This seeds 56 products with real Pexels images. Safe to re-run — uses upsert by name.

---

## Deployment

| Service | Platform | Notes |
|---|---|---|
| Frontend | Vercel | Auto-deploys on push to `main` |
| Backend | Render (free tier) | May sleep on inactivity — first request takes ~50s |
| Database | MongoDB Atlas | Whitelist `0.0.0.0/0` for Render's dynamic IPs |

### Environment variables on Render
Set the same variables as local `.env` plus:
```
NODE_ENV=production
FRONTEND_URL=https://guldasta-app.vercel.app
```

---

## Roadmap

- [ ] Embeddings + semantic person-profile similarity (HuggingFace `all-MiniLM-L6-v2`)
- [ ] MongoDB Atlas Vector Search
- [ ] Forgot password / email reset flow
- [ ] Age + gender fields on People form (frontend)
- [ ] Upgrade Render to always-on instance for reliable cron

---

## License

MIT