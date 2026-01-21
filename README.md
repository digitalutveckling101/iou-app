# IOU - Skulder & Lån App

En enkel, mobilvänlig webbapp för att hålla koll på skulder och lån mellan dig och dina vänner.

## Funktioner

- **Privat åtkomst**: Endast du kan se din data (kopplat till ditt Clerk userId)
- **Dashboard**: Se total balans och lista över personer
  - Grön balans = andra är skyldiga dig mer
  - Röd balans = du är skyldig andra mer
- **Registrera transaktioner**: Lägg till lån (lånat ut eller lånat)
- **Historikvy**: Se alla transaktioner med en specifik person
- **Betalningar**: Registrera del- eller fullständiga återbetalningar
- **Mobile-first design**: Optimerad för mobiler med Tailwind CSS

## Teknisk stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS + Shadcn/ui
- **Autentisering**: Clerk (Google-login och lösenordsfritt)
- **Databas**: Vercel Postgres
- **Hosting**: Vercel

## Installation

### 1. Klona projektet

Projektet är redan skapat lokalt. Navigera till projektmappen:

```bash
cd /Volumes/T7\ Grå\ 1TB/dev/iou
```

### 2. Installera dependencies

```bash
npm install
```

### 3. Konfigurera Clerk

1. Gå till [Clerk.com](https://clerk.com) och skapa ett konto
2. Skapa en ny applikation
3. Aktivera "Email" och "Google" som login-metoder
4. Kopiera API-nycklarna från Dashboard → API Keys
5. Uppdatera `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 4. Konfigurera Vercel Postgres

#### Lokal utveckling

1. Gå till [Vercel Dashboard](https://vercel.com/dashboard)
2. Skapa ett nytt projekt eller välj ett befintligt
3. Gå till Storage → Create Database → Postgres
4. När databasen är skapad, gå till .env.local-fliken
5. Kopiera alla POSTGRES_* variabler
6. Klistra in dem i din `.env.local` fil

#### Initiera databasen

Kör detta kommando för att skapa tabellerna:

```bash
npm run db:init
```

### 5. Starta utvecklingsservern

```bash
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000) i din webbläsare.

## Deploy till Vercel

### 1. Installera Vercel CLI (om du inte har det)

```bash
npm i -g vercel
```

### 2. Deploy

```bash
vercel
```

### 3. Lägg till miljövariabler

1. Gå till Vercel Dashboard → ditt projekt
2. Gå till Settings → Environment Variables
3. Lägg till alla variabler från `.env.local`:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - Alla `POSTGRES_*` variabler (kopieras automatiskt om du använde Vercel Postgres)

### 4. Uppdatera Clerk URLs

1. Gå till Clerk Dashboard → din applikation
2. Gå till Paths
3. Uppdatera följande URLs till din Vercel-domän:
   - Sign-in URL: `https://din-app.vercel.app/sign-in`
   - Sign-up URL: `https://din-app.vercel.app/sign-up`
   - After sign-in URL: `https://din-app.vercel.app`
   - After sign-up URL: `https://din-app.vercel.app`

## Projektstruktur

```
iou/
├── app/
│   ├── api/
│   │   ├── balances/          # API för balanser
│   │   ├── payments/          # API för betalningar
│   │   └── transactions/      # API för transaktioner
│   ├── person/[name]/         # Person detaljvy
│   ├── sign-in/               # Clerk sign-in sida
│   ├── sign-up/               # Clerk sign-up sida
│   ├── layout.tsx             # Root layout med Clerk
│   ├── page.tsx               # Dashboard (huvudsida)
│   └── globals.css            # Global CSS
├── components/
│   ├── ui/                    # Shadcn/ui komponenter
│   ├── dashboard-stats.tsx    # Total balans kort
│   ├── person-list.tsx        # Lista över personer
│   └── transaction-form.tsx   # Formulär för transaktioner
├── lib/
│   ├── db.ts                  # Databasfunktioner
│   └── utils.ts               # Utility funktioner
└── scripts/
    └── init-db.ts             # Databas initiering
```

## Databasschema

### Tabellen `transactions`

| Kolumn            | Typ          | Beskrivning                           |
| ----------------- | ------------ | ------------------------------------- |
| id                | SERIAL       | Primärnyckel                          |
| user_id           | VARCHAR(255) | Clerk userId                          |
| person_name       | VARCHAR(255) | Personens namn                        |
| amount            | DECIMAL      | Belopp i SEK                          |
| type              | VARCHAR(20)  | 'lent_out' eller 'borrowed'           |
| description       | TEXT         | Beskrivning (frivillig)               |
| transaction_date  | TIMESTAMP    | Datum för transaktion                 |
| due_date          | TIMESTAMP    | Förfallodatum (frivillig)             |
| created_at        | TIMESTAMP    | Skapad tid                            |

### Tabellen `payments`

| Kolumn          | Typ       | Beskrivning                    |
| --------------- | --------- | ------------------------------ |
| id              | SERIAL    | Primärnyckel                   |
| transaction_id  | INTEGER   | FK till transactions           |
| amount          | DECIMAL   | Betalat belopp                 |
| payment_date    | TIMESTAMP | Datum för betalning            |
| created_at      | TIMESTAMP | Skapad tid                     |

## Användning

### Lägg till en transaktion

1. Klicka på "Ny Transaktion"
2. Fyll i personens namn, belopp och typ (lånat ut/lånat)
3. Lägg till valfri beskrivning och datum
4. Klicka "Spara"

### Registrera en betalning

1. Klicka på en person i listan
2. Hitta transaktionen du vill registrera en betalning för
3. Klicka på plånboks-ikonen
4. Ange belopp och klicka "Spara betalning"

### Ta bort en transaktion

1. Klicka på en person i listan
2. Klicka på papperskorgs-ikonen vid transaktionen
3. Bekräfta borttagningen

## Felsökning

### "Unauthorized" fel

- Kontrollera att dina Clerk API-nycklar är korrekta i `.env.local`
- Se till att du är inloggad

### Databas-fel

- Kontrollera att du har kört `npm run db:init`
- Verifiera att dina Postgres-variabler är korrekta

### Sidan laddas inte

- Kontrollera att utvecklingsservern körs (`npm run dev`)
- Kolla konsolen för felmeddelanden

## Licens

MIT
