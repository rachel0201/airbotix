import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

type BookingForm = {
  workshopId: string
  organization: string
  contactName: string
  email: string
  phone: string
  preferredDate: string
  location: string
  studentsCount: string
  gradeRange: string
  notes: string
}

const emptyForm: BookingForm = {
  workshopId: '',
  organization: '',
  contactName: '',
  email: '',
  phone: '',
  preferredDate: '',
  location: '',
  studentsCount: '',
  gradeRange: '',
  notes: '',
}

const Book = () => {
  const [params] = useSearchParams()
  const [form, setForm] = useState<BookingForm>(emptyForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const formspreeId = import.meta.env.VITE_FORMSPREE_BOOK_ID as string | undefined
  const fallbackEmail = import.meta.env.VITE_CONTACT_EMAIL as string | undefined

  useEffect(() => {
    const w = params.get('workshop') || ''
    setForm((prev) => ({ ...prev, workshopId: w }))
  }, [params])

  const isValidEmail = useMemo(() => /.+@.+\..+/, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const validate = (): string | null => {
    if (!form.contactName.trim()) return 'Please enter a contact name'
    if (!form.email.trim() || !isValidEmail.test(form.email)) return 'Please enter a valid email'
    if (!form.organization.trim()) return 'Please enter your organization/school'
    if (!form.workshopId.trim()) return 'Please choose a workshop'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMessage('')
    setErrorMessage('')
    const validationError = validate()
    if (validationError) {
      setErrorMessage(validationError)
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        workshopId: form.workshopId,
        organization: form.organization,
        contactName: form.contactName,
        email: form.email,
        phone: form.phone,
        preferredDate: form.preferredDate,
        location: form.location,
        studentsCount: form.studentsCount,
        gradeRange: form.gradeRange,
        notes: form.notes,
      }

      if (formspreeId) {
        const endpoint = `https://formspree.io/f/${formspreeId}`
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
        })
        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data?.error || 'Failed to submit booking request')
        }
        setSuccessMessage('Thanks! Your booking request has been sent.')
        setForm(emptyForm)
      } else if (fallbackEmail) {
        const mailto = new URL(`mailto:${fallbackEmail}`)
        mailto.searchParams.set(
          'subject',
          `Workshop Booking Request: ${form.workshopId || 'General'}`
        )
        const bodyLines = [
          `Workshop: ${form.workshopId}`,
          `Organization: ${form.organization}`,
          `Contact: ${form.contactName}`,
          `Email: ${form.email}`,
          `Phone: ${form.phone}`,
          `Preferred Date: ${form.preferredDate}`,
          `Location: ${form.location}`,
          `Students: ${form.studentsCount}`,
          `Grade Range: ${form.gradeRange}`,
          '',
          form.notes,
        ]
        mailto.searchParams.set('body', bodyLines.join('\n'))
        window.location.href = mailto.toString()
        setSuccessMessage('Opening your email client...')
      } else {
        throw new Error('No booking endpoint configured. Set VITE_FORMSPREE_BOOK_ID or VITE_CONTACT_EMAIL')
      }
    } catch (err) {
      setErrorMessage((err as Error)?.message || 'Something went wrong. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-canvas">
      <section className="relative overflow-hidden py-24 md:py-28 bg-canvas">
        <div className="blob-bg bg-brand-coral" style={{ width: 480, height: 480, top: -120, right: -180, opacity: 0.25 }} aria-hidden="true" />

        <div className="relative max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <span className="eyebrow">BOOK A WORKSHOP</span>
            <h1 className="hero-display">
              Bring Airbotix to <span className="squiggle-word text-brand-coral">your school.</span>
            </h1>
            <p className="lead-text mt-7">
              Tell us a few details and we'll get back to you to confirm availability and next steps.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-wash-coral">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="bg-canvas-pure rounded-3xl shadow-card-soft p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">Workshop</label>
                  <input
                    name="workshopId"
                    value={form.workshopId}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-hairline bg-canvas-pure text-ink px-4 py-3 text-[15px] placeholder:text-stone focus:border-brand-coral focus:ring-2 focus:ring-brand-coral/20 outline-none transition-colors"
                    placeholder="e.g., ai-intro"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">Organization / School</label>
                  <input
                    name="organization"
                    value={form.organization}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-hairline bg-canvas-pure text-ink px-4 py-3 text-[15px] placeholder:text-stone focus:border-brand-coral focus:ring-2 focus:ring-brand-coral/20 outline-none transition-colors"
                    placeholder="Your school or organization"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">Contact Name</label>
                  <input
                    name="contactName"
                    value={form.contactName}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-hairline bg-canvas-pure text-ink px-4 py-3 text-[15px] placeholder:text-stone focus:border-brand-coral focus:ring-2 focus:ring-brand-coral/20 outline-none transition-colors"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-hairline bg-canvas-pure text-ink px-4 py-3 text-[15px] placeholder:text-stone focus:border-brand-coral focus:ring-2 focus:ring-brand-coral/20 outline-none transition-colors"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">Phone (optional)</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-hairline bg-canvas-pure text-ink px-4 py-3 text-[15px] placeholder:text-stone focus:border-brand-coral focus:ring-2 focus:ring-brand-coral/20 outline-none transition-colors"
                    placeholder="Mobile or landline"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">Preferred Date</label>
                  <input
                    name="preferredDate"
                    type="date"
                    value={form.preferredDate}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-hairline bg-canvas-pure text-ink px-4 py-3 text-[15px] placeholder:text-stone focus:border-brand-coral focus:ring-2 focus:ring-brand-coral/20 outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">Location (City/Suburb)</label>
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-hairline bg-canvas-pure text-ink px-4 py-3 text-[15px] placeholder:text-stone focus:border-brand-coral focus:ring-2 focus:ring-brand-coral/20 outline-none transition-colors"
                    placeholder="e.g., Melbourne"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">Students</label>
                  <input
                    name="studentsCount"
                    value={form.studentsCount}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-hairline bg-canvas-pure text-ink px-4 py-3 text-[15px] placeholder:text-stone focus:border-brand-coral focus:ring-2 focus:ring-brand-coral/20 outline-none transition-colors"
                    placeholder="Approx. number of students"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">Grade Range</label>
                <input
                  name="gradeRange"
                  value={form.gradeRange}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-hairline bg-canvas-pure text-ink px-4 py-3 text-[15px] placeholder:text-stone focus:border-brand-coral focus:ring-2 focus:ring-brand-coral/20 outline-none transition-colors"
                  placeholder="e.g., Grades 5-6"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">Notes (optional)</label>
                <textarea
                  name="notes"
                  rows={6}
                  value={form.notes}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-hairline bg-canvas-pure text-ink px-4 py-3 text-[15px] placeholder:text-stone focus:border-brand-coral focus:ring-2 focus:ring-brand-coral/20 outline-none transition-colors"
                  placeholder="Anything else we should know (equipment, accessibility, objectives, etc.)"
                />
              </div>

              {errorMessage && (
                <div className="text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-[14px]">{errorMessage}</div>
              )}
              {successMessage && (
                <div className="text-emerald-700 bg-wash-mint border border-brand-mint/30 rounded-xl px-4 py-3 text-[14px]">{successMessage}</div>
              )}

              <div className="flex justify-end pt-2">
                <button type="submit" className="btn-pill-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Booking Request →'}
                </button>
              </div>
            </form>
            {!formspreeId && (
              <p className="text-[12px] text-stone mt-5">
                Tip: Set <code className="bg-surface px-1.5 py-0.5 rounded text-ink-soft">VITE_FORMSPREE_BOOK_ID</code> in your environment to enable direct submissions.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Book

