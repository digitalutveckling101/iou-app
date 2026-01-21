# Snabbstartsguide - IOU App

## Steg 1: Konfigurera Clerk (5 min)

1. Gå till [clerk.com](https://clerk.com) och skapa ett konto
2. Klicka "Create Application"
3. Välj ett namn (t.ex. "IOU App")
4. Under "Sign-in options", välj:
   - ✅ Email
   - ✅ Google
5. Klicka "Create Application"
6. Kopiera API-nycklarna som visas:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```
7. Öppna `.env.local` i projektet och klistra in nycklarna

## Steg 2: Konfigurera Vercel Postgres (5 min)

### Alternativ A: Använda Vercel Dashboard (Rekommenderat)

1. Gå till [vercel.com/dashboard](https://vercel.com/dashboard)
2. Klicka "Add New..." → "Project"
3. Importera detta projekt (eller skapa ett tomt)
4. Gå till Storage → "Create Database"
5. Välj "Postgres" → "Continue"
6. Välj region och klicka "Create"
7. När databasen är skapad, gå till fliken ".env.local"
8. Klicka "Copy Snippet"
9. Klistra in alla POSTGRES_* variabler i din `.env.local`

### Alternativ B: Deploy först, sedan lägg till databas

1. Kör `vercel` i terminalen för att deploya
2. Följ steg 4-9 från Alternativ A

## Steg 3: Initiera databasen

Kör detta kommando i terminalen:

```bash
npm run db:init
```

Du bör se: ✅ Databastabeller skapade!

## Steg 4: Starta appen

```bash
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000)

## Steg 5: Testa appen

1. Klicka "Sign In" och logga in med Google eller Email
2. Du kommer till Dashboard
3. Klicka "Ny Transaktion"
4. Lägg till ett testlån:
   - Namn: "Anna"
   - Belopp: 500
   - Typ: "Jag lånade ut"
   - Beskrivning: "Middag"
   - Spara
5. Du bör nu se Anna i listan med +500 SEK

## Steg 6: Deploy till produktion

```bash
vercel --prod
```

### Uppdatera Clerk med din produktions-URL

1. Gå till Clerk Dashboard
2. Gå till "Paths" i sidomenyn
3. Uppdatera URL:erna till din Vercel-domän:
   - Sign-in URL: `https://din-app.vercel.app/sign-in`
   - Sign-up URL: `https://din-app.vercel.app/sign-up`
   - After sign-in: `https://din-app.vercel.app`
   - After sign-up: `https://din-app.vercel.app`

## Klart!

Din IOU-app är nu live och redo att användas!

## Vanliga problem

### Problem: "Unauthorized" när jag försöker använda appen

**Lösning**: Kontrollera att Clerk-nycklarna är rätt i `.env.local`

### Problem: Databasen fungerar inte

**Lösning**:
1. Kontrollera att alla POSTGRES_* variabler finns i `.env.local`
2. Kör `npm run db:init` igen

### Problem: Kan inte logga in

**Lösning**:
1. Kontrollera att du aktiverade Email och/eller Google i Clerk Dashboard
2. Rensa cookies och försök igen

### Problem: Sidan visar fel efter deploy

**Lösning**:
1. Gå till Vercel Dashboard → ditt projekt → Settings → Environment Variables
2. Se till att alla variabler från `.env.local` finns där
3. Gör en ny deploy

## Nästa steg

- Lägg till fler personer och transaktioner
- Registrera återbetalningar
- Testa på din mobil (designen är mobile-first!)
- Bjud in vänner att använda appen

Ha kul med din IOU-app! 🎉
