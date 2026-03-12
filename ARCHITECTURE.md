# Smart Friend - Architecture

## Overview

A web wrapper around Vapi.ai conversational AI. Users visit the site, click "Call", and talk to a smart AI friend. A shared wallet system (powered by Stripe + Firebase) lets anyone top up credits that fund the calls for all users.

## Tech Stack

- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS v4
- **Payments:** Stripe (Payment Request API - Apple Pay / Google Pay)
- **Database:** Firebase Realtime Database
- **Voice AI:** Vapi.ai Web SDK (`@vapi-ai/web`)

## Project Structure

```
smart_friend/
├── app/
│   ├── layout.tsx                  # Root layout, fonts, metadata
│   ├── page.tsx                    # Home page - call UI + wallet display
│   ├── globals.css                 # Tailwind imports + custom styles
│   ├── api/
│   │   ├── topup/
│   │   │   └── route.ts           # POST - create Stripe PaymentIntent for wallet topup
│   │   ├── wallet/
│   │   │   └── route.ts           # GET - fetch current wallet balance
│   │   └── webhook/
│   │       └── route.ts           # POST - Stripe webhook to confirm payment & credit wallet
│   ├── components/
│   │   ├── CallInterface.tsx      # Main call UI (start/end, status, transcript)
│   │   ├── WalletDisplay.tsx      # Shows current balance + top-up button
│   │   ├── TopUpModal.tsx         # Stripe payment modal for topping up
│   │   └── TranscriptView.tsx     # Live conversation transcript
│   └── lib/
│       ├── stripe.ts              # Stripe server singleton
│       ├── vapi.ts                # Vapi client helpers
│       └── wallet.ts             # Wallet balance read/write helpers
├── backend/
│   └── firebase.ts                # Firebase Realtime DB wrapper (from Valentines)
├── public/
│   └── (static assets)
├── .env.local
├── package.json
├── tsconfig.json
├── next.config.ts
└── postcss.config.mjs
```

## Firebase Data Model

```
smart_friend/
├── wallet/
│   ├── balance: number            # Current balance in pence (e.g. 500 = £5.00)
│   └── lastUpdated: string        # ISO timestamp
├── transactions/
│   └── {auto-id}/
│       ├── type: "topup" | "call_charge"
│       ├── amount: number         # In pence (positive for topup, negative for charge)
│       ├── timestamp: string
│       ├── stripePaymentId?: string   # For topups
│       └── callId?: string            # For call charges
└── calls/
    └── {auto-id}/
        ├── startTime: string
        ├── endTime?: string
        ├── durationSeconds: number
        ├── costPence: number
        └── status: "active" | "completed" | "failed"
```

## Key Design Decisions

1. **Shared wallet** - No auth needed. Single global balance all users share.
2. **Balance in pence** - Avoids floating point issues. Display as £X.XX on frontend.
3. **Stripe webhooks** - Only credit wallet after confirmed payment (not on client-side success).
4. **Real-time balance** - Firebase Realtime DB for live balance updates across all connected clients.
5. **Call cost tracking** - Deduct from wallet in real-time during calls based on Vapi usage.
