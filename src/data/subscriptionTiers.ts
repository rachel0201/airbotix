export interface SubscriptionTier {
  name: 'Silver' | 'Gold' | 'Platinum'
  priceMonthly: number
  priceYearly: number
  description: string
  features: string[]
  bestFor: string
  isPopular?: boolean
}

export const subscriptionTiers: SubscriptionTier[] = [
  {
    name: 'Silver',
    priceMonthly: 29,
    priceYearly: 299,
    description: 'Essential tools for individual educators launching AI & Robotics programs.',
    features: [
      '2 instructor seats with shared dashboards',
      '4 hands-on workshop kits per term',
      'Digital curriculum library access',
      'Email support with 48-hour response',
    ],
    bestFor: 'Teachers piloting robotics clubs or integrating STEM projects.',
  },
  {
    name: 'Gold',
    priceMonthly: 59,
    priceYearly: 599,
    description: 'Expanded capacity and support for schools running recurring workshops.',
    features: [
      '5 instructor seats with role-based permissions',
      '10 workshop kits per term with replenishment',
      'Live virtual onboarding for staff',
      'Priority chat + email support (same business day)',
      'Student progress analytics exports',
    ],
    bestFor: 'School STEM leads scaling term-long robotics and AI learning.',
    isPopular: true,
  },
  {
    name: 'Platinum',
    priceMonthly: 99,
    priceYearly: 999,
    description: 'Enterprise-grade package with premium content and white-glove delivery.',
    features: [
      'Unlimited instructor seats with SSO integration',
      '20+ workshop kits with spare parts pool',
      'Custom curriculum design with quarterly planning',
      'Dedicated success manager with office hours',
      'Onsite launch day facilitation',
      'Advanced analytics with cohort benchmarking',
    ],
    bestFor: 'Multi-campus networks or education partners delivering large-scale programs.',
  },
]
