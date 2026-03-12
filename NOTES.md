# Smart Friend - Notes & Decisions

## Concept

"Your friends aren't always available, and sometimes they don't have the required knowledge."

Smart Friend is a conversational AI you can call anytime to bounce ideas off, think through problems, or just chat. One tap to call, talk naturally, hang up when done.

## Key Decisions

### Shared Wallet (No Auth)
- No user accounts or login
- Single shared wallet across all users
- Anyone can top up, anyone can call
- Simplifies everything massively - no auth flow, no per-user billing
- Trade-off: someone could drain the wallet. Acceptable for now.

### Payment Flow
- Stripe Payment Request API (Apple Pay / Google Pay) for frictionless topup
- Preset amounts: £1, £5, £10
- Currency: GBP (£)
- Wallet credited only after Stripe webhook confirms payment (not client-side)

### Vapi Integration
- Using Vapi Web SDK (`@vapi-ai/web`) for browser-based voice calls
- Assistant already configured on Vapi dashboard (user provides assistant ID)
- Public API key used client-side to initiate calls
- No server-side Vapi SDK needed for basic call functionality

### Cost Tracking
- Need to determine actual per-minute cost from Vapi pricing
- Deduct from wallet in real-time during calls (interval-based)
- Auto-end call when wallet balance hits zero
- Log all transactions for transparency

## Things to Figure Out
- Exact Vapi per-minute cost to set our deduction rate
- Whether to show call history or keep it simple
- How prominent to make the transcript view
- Whether to add a "low balance" warning threshold
