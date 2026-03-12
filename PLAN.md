# Smart Friend - Implementation Plan

## Phase 1: Project Setup

- [ ] Initialize Next.js project with TypeScript + Tailwind v4
- [ ] Copy and adapt `backend/firebase.ts` from Valentines project
- [ ] Copy and adapt `app/lib/stripe.ts` from Valentines project
- [ ] Set up `.env.local` with all required keys (Stripe, Firebase, Vapi)
- [ ] Install dependencies: `@vapi-ai/web`, `@stripe/stripe-js`, `@stripe/react-stripe-js`, `stripe`, `firebase`

## Phase 2: Firebase Wallet Backend

- [ ] Create wallet helper (`app/lib/wallet.ts`):
  - `getBalance()` - read current balance from `wallet/balance`
  - `deductBalance(amount)` - subtract pence from balance (use Firebase transaction for atomicity)
  - `addBalance(amount)` - add pence to balance (use Firebase transaction)
  - `logTransaction(type, amount, metadata)` - write to `transactions/`
  - `hasEnoughBalance(amount)` - check if balance >= amount
- [ ] Create API route `GET /api/wallet` - returns current balance
- [ ] Seed initial wallet balance at 0

## Phase 3: Stripe Top-Up Flow

- [ ] Create `TopUpModal.tsx` - modal with preset amounts (£1, £5, £10) or custom
- [ ] Create API route `POST /api/topup` - creates Stripe PaymentIntent for chosen amount
- [ ] Create API route `POST /api/webhook` - Stripe webhook handler:
  - On `payment_intent.succeeded`: credit wallet + log transaction
  - Verify webhook signature for security
- [ ] Create `WalletDisplay.tsx` - shows balance, "Top Up" button
- [ ] Wire up Stripe Payment Request Button (Apple Pay / Google Pay) in modal

## Phase 4: Vapi Call Interface

- [ ] Create Vapi client wrapper (`app/lib/vapi.ts`)
- [ ] Create `CallInterface.tsx`:
  - Big "Call Smart Friend" button when idle
  - Active call UI: speaking indicator, duration timer, end call button
  - Pre-call check: verify wallet has enough balance (minimum e.g. 50p)
  - On call start: begin cost tracking interval (deduct ~5p per minute or whatever Vapi charges)
  - On call end: final cost deduction, log call to `calls/`
  - Auto-end call if wallet hits 0
- [ ] Create `TranscriptView.tsx` - live transcript of the conversation
- [ ] Handle Vapi events: `call-start`, `call-end`, `speech-start`, `speech-end`, `message`, `error`

## Phase 5: Main Page & UI

- [ ] Build `app/page.tsx` - the main (and only) page:
  - Hero section: "Smart Friend" branding
  - Wallet balance display (top right or prominent)
  - Call interface (centered, large call button)
  - Live transcript below call interface
  - Top-up modal (triggered from wallet display)
- [ ] Style everything with Tailwind - clean, modern, friendly aesthetic
- [ ] Add responsive design (mobile-first since people will use this on phones)
- [ ] Add animations: call button pulse, speaking indicators, balance updates

## Phase 6: Real-Time Balance & Polish

- [ ] Firebase real-time listener on `wallet/balance` so all connected clients see live updates
- [ ] Handle edge cases:
  - What if balance runs out mid-call? → End call gracefully with warning
  - What if Stripe payment fails? → Show error, don't credit wallet
  - What if Vapi connection fails? → Show error, don't charge
- [ ] Add call history view (optional, stretch goal)
- [ ] Test full flow: top up → call → balance deduction → top up again

## Environment Variables Needed

```env
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Firebase
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
FIREBASE_DATABASE_URL=

# Vapi
NEXT_PUBLIC_VAPI_PUBLIC_KEY=
NEXT_PUBLIC_VAPI_ASSISTANT_ID=
```

## Cost Model

- Vapi charges per minute of call time
- We charge the shared wallet per minute (need to determine rate - start with ~10p/min as estimate, adjust based on actual Vapi pricing)
- Top-up amounts: £1, £5, £10 (preset buttons)
- Minimum balance to start a call: 50p (5 minutes at 10p/min)
