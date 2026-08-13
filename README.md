# Age-Gap Dating Platform — Implementation Guide

## Stack
- Next.js 14 (App Router) + TypeScript
- PostgreSQL + Prisma
- Supabase Storage (or Cloudflare R2) for media, signed URLs only — never public buckets
- Socket.IO or Supabase Realtime for chat
- Persona / Veriff / Onfido for ID verification (do not build your own)
- Tailwind CSS

## Phase 1 — MVP Backend & Auth
- Signup/login, hard 18+ age gate at the API layer (see `signup/route.ts`)
- Kick off ID verification session immediately after signup; account is UNVERIFIED
  and non-discoverable until vendor webhook confirms VERIFIED
- Role split (SPONSOR / PARTNER) baked into the User model, not just UI copy
- Session/auth (swap `lib/session.ts` stub for NextAuth or Supabase Auth)

## Phase 2 — Profiles & UI
- Profile creation forms per role (different optional fields — see schema)
- Photo upload -> signed upload to storage -> `Photo` row with `isPrivate` flag
- Private album flow: request access -> `PhotoAccessGrant` row -> signed GET URL
  only if a live grant exists
- Visibility controls: PUBLIC / STEALTH / INCOGNITO enforced server-side in
  `discover/route.ts`, not just hidden client-side

## Phase 3 — Discovery & Real-Time Chat
- `/api/discover` — filtered candidate list, verified-only, block-aware
- `/api/matches` — mutual-match creates a `Conversation`
- `/api/messages` — send message, runs `scanMessageForScamPatterns` before persist
- Wire Socket.IO (or Supabase Realtime channel per `conversationId`) for live
  delivery + read receipts + typing indicators
- Media-in-chat: same signed-upload pattern as profile photos, watermark on
  upload (server-side, e.g. sharp) before storing

## Phase 4 — Security, Moderation, Compliance
- **Legal review before launch**: ToS must explicitly prohibit commercial sex
  work solicitation; confirm your payment processor's category rules (most
  mainstream processors restrict "sugar dating" — you'll likely need a
  high-risk-friendly processor, not standard Stripe)
- Moderator queue: surface `flaggedForReview` messages and `OPEN` reports in
  an internal admin dashboard (build as a separate `/admin` route gated by
  `Role.MODERATOR`/`Role.ADMIN`)
- `UNDERAGE_SUSPECTED` reports auto-suspend pending review (already wired in
  `reports/route.ts`) — treat this as a P0 workflow, not a queue item
- Rate-limit message sends and match requests per user (e.g. Upstash Redis)
  to blunt bot/scam-farm behavior
- Data retention & deletion: build a "delete my account" flow that actually
  cascades (schema uses `onDelete: Cascade` on the sensitive relations) —
  needed for GDPR/CCPA-style compliance depending on your user base
- Logging: log verification decisions and suspensions with reason codes for
  audit trail, but never log raw ID documents/PII beyond what your KYC vendor
  already retains on their compliant infrastructure

## Explicitly out of scope of this scaffold (build/buy separately)
- The KYC/liveness verification itself (use a vendor)
- Payment/allowance processing rails
- Production-grade content moderation for images (consider a vendor like
  Hive or AWS Rekognition for automated NSFW/CSAM detection — this is
  legally mandated in most jurisdictions, not optional)
