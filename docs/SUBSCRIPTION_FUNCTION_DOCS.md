# Subscription Feature Function Documentation

## Data types
### `SubscriptionTier`
Defined in `src/data/subscriptionTiers.ts`.
```ts
interface SubscriptionTier {
  name: 'Silver' | 'Gold' | 'Platinum'
  priceMonthly: number
  priceYearly: number
  description: string
  features: string[]
  bestFor: string
  isPopular?: boolean
}
```

## Usage patterns
- Import `subscriptionTiers` to render pricing cards:
```tsx
import { subscriptionTiers } from '@/data/subscriptionTiers'

{subscriptionTiers.map((tier) => (
  <PricingCard tier={tier} />
))}
```
- Use `isPopular` to flag a badge without comparing string literals.
- CTA buttons currently link to `/contact` for payment or invoice follow-up.

## Component behaviors
- `Subscriptions` page maps tier data into cards with pricing, features, and best-fit guidance.
- Guarantee bullets and support highlights are static arrays within the page for clarity.
- Payment messaging lives in the "Payment and rollout guidance" panel for easy edits.

## Error handling & constraints
- Data is static; no runtime fetch errors expected.
- Keep tier names aligned with the literal union to avoid runtime typos.
- Avoid embedding pricing in multiple locations—update only `subscriptionTiers` to keep copy consistent.
