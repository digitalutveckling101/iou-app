# Hur IOU-appen fungerar

## Översikt

```
┌─────────────┐
│   Användare │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────────┐
│  Clerk Authentication           │
│  (Google / Email login)         │
└──────────┬──────────────────────┘
           │
           ↓
┌──────────────────────────────────┐
│     Next.js App Router           │
│  ┌────────────────────────────┐  │
│  │  Dashboard (/)             │  │
│  │  - Total Balans            │  │
│  │  - Personlista             │  │
│  │  - Ny Transaktion-knapp    │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │  Person Sida (/person/:id) │  │
│  │  - Individuell balans      │  │
│  │  - Transaktionshistorik    │  │
│  │  - Återbetalning           │  │
│  └────────────────────────────┘  │
└──────────┬───────────────────────┘
           │
           ↓
┌──────────────────────────────────┐
│       API Routes                 │
│  /api/transactions (GET/POST/DEL)│
│  /api/payments (GET/POST)        │
│  /api/balances (GET)             │
└──────────┬───────────────────────┘
           │
           ↓
┌──────────────────────────────────┐
│    Vercel Postgres Database      │
│  ┌────────────────────────────┐  │
│  │  transactions table        │  │
│  │  - id, user_id, person,    │  │
│  │    amount, type, date      │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │  payments table            │  │
│  │  - id, transaction_id,     │  │
│  │    amount, date            │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
```

## Dataflöde

### 1. Lägg till transaktion

```
Användare → Klickar "Ny Transaktion"
    ↓
Dialog öppnas med formulär
    ↓
Användare fyller i:
  - Namn: "Anna"
  - Belopp: 500 SEK
  - Typ: "Jag lånade ut"
  - Beskrivning: "Middag"
    ↓
POST /api/transactions
    ↓
lib/db.ts → createTransaction()
    ↓
INSERT INTO transactions
    ↓
Dashboard uppdateras automatiskt
```

### 2. Beräkna balans

```
GET /api/balances
    ↓
lib/db.ts → getPersonBalances()
    ↓
SQL Query:
  SUM(
    CASE
      WHEN type = 'lent_out' THEN +amount
      WHEN type = 'borrowed' THEN -amount
    END
  ) - (totalt betalat)
    ↓
Returnera per person:
  - Anna: +500 SEK (hon är skyldig dig)
  - Erik: -200 SEK (du är skyldig honom)
    ↓
Total balans: +300 SEK (Grön!)
```

### 3. Registrera återbetalning

```
Person sida → Klicka plånboks-ikon
    ↓
Dialog med betalningsformulär
    ↓
Användare fyller i belopp: 200 SEK
    ↓
POST /api/payments
    ↓
lib/db.ts → createPayment()
    ↓
INSERT INTO payments (transaction_id, amount)
    ↓
Kvarvarande belopp uppdateras:
  500 SEK - 200 SEK = 300 SEK kvar
```

## Balanslogik

### Positiv balans (Grön)

```
Du lånade ut:     +1000 SEK (Anna)
Du lånade:        -300 SEK (Erik)
Betalat till dig: +200 SEK (Anna betalade tillbaka)
─────────────────────────────────
Total balans:     +900 SEK (Grön)

= Andra är skyldiga dig totalt 900 SEK
```

### Negativ balans (Röd)

```
Du lånade ut:     +300 SEK (Anna)
Du lånade:        -1000 SEK (Erik)
Du betalade:      -200 SEK (till Erik)
─────────────────────────────────
Total balans:     -900 SEK (Röd)

= Du är skyldig andra totalt 900 SEK
```

## Säkerhet

### Middleware Protection

```
Varje request →
    ↓
middleware.ts körs
    ↓
Är användaren inloggad? (Clerk)
    ├─ JA → Fortsätt till sida
    └─ NEJ → Redirect till /sign-in
```

### API Protection

```
API Request →
    ↓
const { userId } = await auth()
    ↓
userId finns?
    ├─ JA → userId används i alla DB queries
    │       (användaren ser BARA sin egen data)
    └─ NEJ → Return 401 Unauthorized
```

## Exempel på användning

### Scenario: Middag med vänner

**Steg 1:** Du betalar middagen för Anna och Erik (totalt 900 SEK)

```
Lägg till transaktion:
- Namn: "Anna"
- Belopp: 450
- Typ: "Jag lånade ut"
- Beskrivning: "Middag på restaurang"

Lägg till transaktion:
- Namn: "Erik"
- Belopp: 450
- Typ: "Jag lånade ut"
- Beskrivning: "Middag på restaurang"
```

**Resultat:**
```
Dashboard visar:
┌─────────────────┐
│ Total Balans    │
│ +900 SEK        │ (Grön)
└─────────────────┘

Personer:
┌─────────────────┐
│ Anna            │
│ +450 SEK     ▶  │
└─────────────────┘
┌─────────────────┐
│ Erik            │
│ +450 SEK     ▶  │
└─────────────────┘
```

**Steg 2:** Anna betalar tillbaka 200 SEK

```
Klicka på Anna → Klicka plånboks-ikon
Registrera betalning: 200 SEK
```

**Resultat:**
```
Dashboard visar:
┌─────────────────┐
│ Total Balans    │
│ +700 SEK        │ (Grön)
└─────────────────┘

Personer:
┌─────────────────┐
│ Anna            │
│ +250 SEK     ▶  │ (450 - 200)
└─────────────────┘
┌─────────────────┐
│ Erik            │
│ +450 SEK     ▶  │
└─────────────────┘
```

**Steg 3:** Erik betalar tillbaka allt

```
Klicka på Erik → Klicka plånboks-ikon
Registrera betalning: 450 SEK
```

**Resultat:**
```
Dashboard visar:
┌─────────────────┐
│ Total Balans    │
│ +250 SEK        │ (Grön)
└─────────────────┘

Personer:
┌─────────────────┐
│ Anna            │
│ +250 SEK     ▶  │
└─────────────────┘

(Erik visas inte längre eftersom balansen är 0)
```

## Komponenter

### Dashboard Flow

```
app/page.tsx
    ↓
Fetch data:
  - GET /api/balances?type=total → totalBalance
  - GET /api/balances → personBalances[]
    ↓
Rendera:
  ┌─────────────────────────────┐
  │ <DashboardStats>            │
  │   totalBalance: +900 SEK    │
  └─────────────────────────────┘
  ┌─────────────────────────────┐
  │ <TransactionForm>           │
  │   [Ny Transaktion]          │
  └─────────────────────────────┘
  ┌─────────────────────────────┐
  │ <PersonList>                │
  │   - Anna: +450 SEK          │
  │   - Erik: +450 SEK          │
  └─────────────────────────────┘
```

### Person Page Flow

```
app/person/[name]/page.tsx
    ↓
Fetch data:
  - GET /api/transactions?person=Anna
  - GET /api/payments (för varje transaktion)
    ↓
Beräkna för varje transaktion:
  - Totalt betalat = SUM(payments.amount)
  - Kvarvarande = transaction.amount - totalt betalat
    ↓
Rendera:
  ┌─────────────────────────────┐
  │ Balans med Anna             │
  │ +250 SEK (Grön)             │
  └─────────────────────────────┘
  ┌─────────────────────────────┐
  │ Transaktion #1              │
  │ Lånat ut: 450 SEK           │
  │ Betalningar: 200 SEK        │
  │ Kvar: 250 SEK               │
  │ [💰] [🗑️]                   │
  └─────────────────────────────┘
```

## Databas Schema

### transactions

| Kolumn           | Beskrivning                    | Exempel              |
| ---------------- | ------------------------------ | -------------------- |
| id               | Primärnyckel                   | 1                    |
| user_id          | Clerk userId                   | "user_2a..."         |
| person_name      | Namn på person                 | "Anna"               |
| amount           | Belopp i SEK                   | 450.00               |
| type             | 'lent_out' eller 'borrowed'    | "lent_out"           |
| description      | Valfri beskrivning             | "Middag"             |
| transaction_date | När transaktionen skedde       | 2024-01-20           |
| due_date         | Valfritt förfallodatum         | 2024-02-20           |

### payments

| Kolumn         | Beskrivning              | Exempel    |
| -------------- | ------------------------ | ---------- |
| id             | Primärnyckel             | 1          |
| transaction_id | FK till transactions     | 1          |
| amount         | Återbetalt belopp        | 200.00     |
| payment_date   | När betalningen skedde   | 2024-01-25 |

## Tech Stack Roller

| Teknologi       | Roll                                      |
| --------------- | ----------------------------------------- |
| Next.js         | React framework, routing, API            |
| TypeScript      | Typsäkerhet                              |
| Tailwind CSS    | Styling (mobile-first)                   |
| Shadcn/ui       | UI komponenter                           |
| Clerk           | Autentisering (Google, Email)            |
| Vercel Postgres | Databas (transaktioner, betalningar)     |
| Lucide React    | Ikoner                                   |
| Vercel          | Hosting och deploy                       |

## Deployment Flow

```
Local Development
    ↓
git push
    ↓
Vercel detects push
    ↓
Automatic build:
  - npm install
  - npm run build
  - next build
    ↓
Deploy to production
    ↓
Live på https://din-app.vercel.app
```

---

**Nu vet du exakt hur allt fungerar tillsammans!** 🎉
