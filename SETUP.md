# IOU App Setup Guide

## Databas Setup

### Steg 1: Skapa Vercel Postgres databas

1. Gå till [Vercel Dashboard](https://vercel.com/dashboard)
2. Välj ditt projekt (eller skapa ett nytt)
3. Gå till Storage-fliken
4. Klicka "Create Database"
5. Välj "Postgres"
6. Följ instruktionerna för att skapa databasen

### Steg 2: Kopiera miljövariabler

När databasen är skapad:
1. Gå till Settings → Environment Variables
2. Kopiera alla Postgres-variabler
3. Klistra in dem i din `.env.local` fil

### Steg 3: Initiera databastabeller

Kör följande kommando för att skapa tabellerna:

```bash
npm run db:init
```

## Clerk Setup

### Steg 1: Skapa Clerk konto

1. Gå till [Clerk.com](https://clerk.com)
2. Skapa ett konto och en ny applikation
3. Välj "Email" och "Google" som login-metoder

### Steg 2: Kopiera API-nycklar

1. I Clerk Dashboard, gå till "API Keys"
2. Kopiera "Publishable Key" och "Secret Key"
3. Lägg till dem i din `.env.local`:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

## Kör projektet

```bash
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000) i din webbläsare.

## Deploy till Vercel

```bash
# Installera Vercel CLI om du inte redan har det
npm i -g vercel

# Deploy
vercel
```

Se till att lägga till alla miljövariabler från `.env.local` i Vercel Dashboard under Settings → Environment Variables.
