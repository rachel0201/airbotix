import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { subscriptionTiers } from '@/data/subscriptionTiers'

const guaranteePoints = [
  'Cancel or change tiers anytime before renewal',
  'Secure payments processed via trusted partners',
  'Invoice receipts for schools and organisations',
  '30-day success check-in with our team',
]

const supportHighlights = [
  {
    title: 'Flexible billing',
    description: 'Choose monthly or annual billing with savings for upfront yearly commitments.',
  },
  {
    title: 'Learning resources',
    description: 'Lesson plans, coding challenges, and safety checklists ready for classrooms.',
  },
  {
    title: 'Onboarding',
    description: 'Guided setup for dashboards, student groups, and hardware kits in under an hour.',
  },
]

const Subscriptions = () => {
  return (
    <div className="bg-gray-50">
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold text-primary-700 uppercase tracking-wide">Subscription plans</p>
          <h1 className="mt-4 text-4xl sm:text-5xl font-bold text-gray-900">
            Scale your AI & Robotics program with predictable pricing
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
            Pick a tier that matches your rollout stage—from single-class pilots to multi-campus deployments. Swap tiers anytime,
            and every plan includes curriculum updates and support.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 pb-16 sm:pb-24">
        <div className="grid gap-8 md:grid-cols-3">
          {subscriptionTiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl bg-white shadow-lg border ${
                tier.isPopular ? 'border-primary-300 shadow-primary-100' : 'border-gray-200'
              } flex flex-col h-full`}
            >
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">{tier.name}</h2>
                  {tier.isPopular && <span className="px-3 py-1 text-xs font-semibold text-primary-700 bg-primary-100 rounded-full">Most popular</span>}
                </div>
                <p className="text-gray-600 mb-6">{tier.description}</p>
                <div className="mb-6">
                  <p className="text-4xl font-extrabold text-gray-900">${tier.priceMonthly}</p>
                  <p className="text-sm text-gray-500">per month, billed monthly</p>
                  <p className="text-sm text-gray-500 mt-1">or ${tier.priceYearly} billed yearly (save 14%)</p>
                </div>
                <div className="space-y-3">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <CheckCircleIcon className="w-5 h-5 text-primary-600 mt-0.5" />
                      <p className="text-gray-700">{feature}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <p className="text-sm text-gray-600">{tier.bestFor}</p>
                </div>
              </div>
              <div className="p-8 border-t border-gray-100 bg-gray-50">
                <a href="/contact" className="btn-primary w-full text-center block">
                  Start {tier.name.toLowerCase()} plan
                </a>
                <p className="text-xs text-gray-500 text-center mt-3">No setup fees. Switching is instant.</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border-t border-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <p className="text-sm font-semibold text-primary-700 uppercase tracking-wide">What’s included</p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">Subscription benefits designed for educators</h2>
            <p className="mt-4 text-lg text-gray-600">
              Each subscription unlocks content, tooling, and human support so your team can deliver confident, safe, and engaging
              workshops. Upgrade as cohorts grow—your resources and analytics scale with you.
            </p>
            <div className="mt-8 space-y-4">
              {supportHighlights.map((item) => (
                <div key={item.title} className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-2 text-gray-700">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900">Payment and rollout guidance</h3>
            <p className="mt-2 text-gray-700">
              We process payments through secure gateways and can issue invoices for schools. Your subscription activates as soon as
              payment clears, with immediate access to resources and onboarding support.
            </p>
            <div className="mt-6 space-y-3">
              {guaranteePoints.map((point) => (
                <div key={point} className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-primary-600 mt-0.5" />
                  <p className="text-gray-700">{point}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 rounded-xl bg-white border border-primary-100">
              <p className="text-sm font-medium text-primary-700">Looking for procurement paperwork?</p>
              <p className="text-sm text-gray-700 mt-2">
                We provide supplier forms, insurance certificates, and student safety outlines for compliance reviews. Reach out and
                our team will bundle them with your subscription quote.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Subscriptions
