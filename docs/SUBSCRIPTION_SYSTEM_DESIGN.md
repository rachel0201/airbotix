# Subscription Feature System Design

## Overview
The subscription feature introduces a dedicated marketing page that outlines paid tiers (Silver, Gold, Platinum) and clarifies payment expectations for schools and partners. It uses static data to render pricing cards, guarantees, and rollout guidance.

## Component hierarchy
- `src/pages/Subscriptions.tsx`
  - Hero with positioning copy
  - Pricing grid sourced from `subscriptionTiers`
    - CTA buttons linking to Contact
  - Benefits + payment guidance panels

## Data flow
- Static tier data lives in `src/data/subscriptionTiers.ts`.
- The page maps `subscriptionTiers` into cards without external API calls.
- CTA links route users to `/contact` for payment initiation or invoicing.

## File location mapping
- Routing entry: `src/App.tsx` registers `/subscriptions`.
- Navigation access: `src/components/Header.tsx` adds desktop + mobile links.
- Data source: `src/data/subscriptionTiers.ts` defines tier metadata.
- Page UI: `src/pages/Subscriptions.tsx` renders all subscription content.

## AI quick-reference
- Add or adjust tiers by editing `subscriptionTiers` (typed with `SubscriptionTier`).
- Keep CTAs consistent (`/contact`) until a dedicated checkout flow exists.
- Popular badge is controlled via `isPopular` on the tier object.
