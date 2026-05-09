import { useState } from 'react'

type FormState = {
  fullName: string
  email: string
  subject: string
  message: string
}

const initialState: FormState = {
  fullName: '',
  email: '',
  subject: '',
  message: '',
}

const inputClass =
  'w-full rounded-xl border border-hairline bg-canvas-pure text-ink px-4 py-3 text-[15px] placeholder:text-stone focus:border-brand-coral focus:ring-2 focus:ring-brand-coral/20 outline-none transition-colors'

const Contact = () => {
  const [form, setForm] = useState<FormState>(initialState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const formspreeId = import.meta.env.VITE_FORMSPREE_ID as string | undefined
  const fallbackEmail = import.meta.env.VITE_CONTACT_EMAIL as string | undefined

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const validate = (): string | null => {
    if (!form.fullName.trim()) return 'Please enter your full name'
    if (!form.email.trim()) return 'Please enter your email address'
    const emailOk = /.+@.+\..+/.test(form.email)
    if (!emailOk) return 'Please enter a valid email address'
    if (!form.message.trim()) return 'Please enter a message'
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
      if (formspreeId) {
        const endpoint = `https://formspree.io/f/${formspreeId}`
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            name: form.fullName,
            email: form.email,
            subject: form.subject,
            message: form.message,
          }),
        })

        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data?.error || 'Failed to send message')
        }

        setSuccessMessage('Thank you! Your message has been sent.')
        setForm(initialState)
      } else if (fallbackEmail) {
        const mailto = new URL(`mailto:${fallbackEmail}`)
        const subject = form.subject || 'New Contact Message from Airbotix Website'
        const body = `Name: ${form.fullName}\nEmail: ${form.email}\n\n${form.message}`
        mailto.searchParams.set('subject', subject)
        mailto.searchParams.set('body', body)
        window.location.href = mailto.toString()
        setSuccessMessage('Opening your email client...')
      } else {
        throw new Error(
          'No form endpoint configured. Please set VITE_FORMSPREE_ID or VITE_CONTACT_EMAIL.'
        )
      }
    } catch (err) {
      setErrorMessage((err as Error)?.message || 'Something went wrong. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-canvas">
      {/* ============================================================
          Hero
          ============================================================ */}
      <section className="relative overflow-hidden py-24 md:py-32 bg-canvas">
        <div className="blob-bg bg-brand-mint" style={{ width: 480, height: 480, top: -100, right: -180, opacity: 0.30 }} aria-hidden="true" />

        <div className="relative max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <span className="eyebrow eyebrow-mint">CONTACT</span>
            <h1 className="hero-display">
              Let's talk about <span className="squiggle-word text-brand-coral">your kids.</span>
            </h1>
            <p className="lead-text mt-7">
              Have a question, or want to bring a workshop to your school? Drop us a message — we
              read every one and reply within 1–2 business days.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
          Form
          ============================================================ */}
      <section className="py-16 md:py-20 bg-wash-mint">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="bg-canvas-pure rounded-3xl shadow-card-soft p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-semibold text-ink mb-2">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={form.fullName}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-ink mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-ink mb-2">
                  Subject <span className="text-stone font-normal">(optional)</span>
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  value={form.subject}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-ink mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  value={form.message}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Tell us about your school, students' ages, preferred dates, etc."
                  required
                />
              </div>

              {errorMessage && (
                <div className="text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-[14px]">
                  {errorMessage}
                </div>
              )}
              {successMessage && (
                <div className="text-emerald-700 bg-wash-mint border border-brand-mint/30 rounded-xl px-4 py-3 text-[14px]">
                  {successMessage}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="btn-pill-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message →'}
                </button>
              </div>
            </form>
            {!formspreeId && (
              <p className="text-[12px] text-stone mt-5">
                Tip: Set <code className="bg-surface px-1.5 py-0.5 rounded text-ink-soft">VITE_FORMSPREE_ID</code> to enable direct submissions.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact
