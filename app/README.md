# Yapper Voice

Talk to AI friends who are always available. Brainstorm, vent, or just chat — on demand.

**Live at [yappervoice.com](https://yappervoice.com)**

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4**
- **Vapi.ai** — real-time voice conversations via the Web SDK
- **Stripe** — Apple Pay / Google Pay top-ups via Payment Request API
- **Firebase Realtime Database** — shared wallet balance with live sync

## How it works

1. User lands on a single page with a call button and agent picker
2. Tap call — browser mic connects to a Vapi assistant via WebRTC
3. Conversation streams in real-time with a live transcript
4. Cost is deducted from a shared wallet every 10 seconds during the call
5. Anyone can top up the wallet with £1 / £5 / £10 via Apple Pay or Google Pay
6. Balance updates in real-time across all connected clients via Firebase

## Project structure

```
app/
├── app/
│   ├── page.tsx                    # Single-page app
│   ├── layout.tsx                  # Root layout, DM Sans font, metadata
│   ├── globals.css                 # Design tokens, animations, background
│   ├── api/
│   │   ├── agents/route.ts         # GET — agent list + Vapi metadata
│   │   ├── topup/route.ts          # POST — Stripe PaymentIntent + wallet credit
│   │   ├── deduct/route.ts         # POST — deduct balance during calls
│   │   └── wallet/route.ts         # GET — current balance
│   ├── components/
│   │   ├── CallInterface.tsx       # Call button, Vapi connection, timer, transcript
│   │   ├── AgentPicker.tsx         # Dropdown to switch between agents
│   │   ├── WalletDisplay.tsx       # Balance display + top-up button
│   │   ├── TopUpModal.tsx          # Amount picker modal
│   │   ├── CheckoutButton.tsx      # Stripe Payment Request (Apple/Google Pay)
│   │   └── TranscriptView.tsx      # Live chat transcript
│   └── lib/
│       ├── agents.ts               # Agent config (IDs, names, cost per minute)
│       ├── firebase-client.ts      # Client-side Firebase (real-time balance listener)
│       ├── stripe.ts               # Stripe server singleton
│       ├── vapi.ts                 # Vapi public key export
│       └── wallet.ts               # Wallet read/write/deduct with Firebase transactions
├── backend/
│   └── firebase.ts                 # Firebase server wrapper (CRUD + transactions)
├── .env.local                      # All secrets (not committed)
└── package.json
```

## Setup

```bash
cd app
npm install
```

Create `.env.local`:

```env
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

# Firebase
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...
FIREBASE_DATABASE_URL=...

# Firebase (client — for real-time balance)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_DATABASE_URL=...

# Vapi
NEXT_PUBLIC_VAPI_PUBLIC_KEY=...
VAPI_API_KEY=...
```

```bash
npm run dev
```

## Adding agents

Edit `app/lib/agents.ts`:

```ts
export const agents: AgentConfig[] = [
  {
    assistantId: "your-vapi-assistant-id",
    name: "Smart Friend",
    description: "Brainstorm ideas and think out loud",
    costPerMinutePence: 15,
  },
];
```

The agents API route automatically fetches model/voice/transcriber metadata from Vapi for each assistant.

## Deployment

Works with Vercel out of the box — just push and set the environment variables in the dashboard.
