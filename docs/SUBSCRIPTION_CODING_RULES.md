# Subscription Feature Coding Rules

1. **Single source for pricing**
   - Only set pricing and tier metadata in `src/data/subscriptionTiers.ts`.
   - Do not hardcode prices elsewhere; reference the data object.

2. **Typed tier updates**
   - Preserve the `SubscriptionTier` union for `name` to prevent mismatched badges or copy.
   - Add new properties to the interface before using them in the page.

3. **Presentation patterns**
   - Use the existing card layout in `Subscriptions.tsx` as the base for new tiers or badges.
   - Keep CTAs pointing to `/contact` until a checkout or billing integration exists.

4. **Content consistency**
   - Highlight popular tiers via `isPopular` rather than string comparisons.
   - Update guarantee and support copy in-page arrays to keep messaging centralized.

5. **Documentation upkeep**
   - When changing pricing logic or adding integrations, update all three subscription docs in `docs/` to reflect data flow and usage.
