import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

type BookType = 'consult' | 'class' | '1on1' | 'school' | 'platform'

interface PickerOption {
  type: BookType
  tone: string
  title: string
  desc: string
  recommended?: boolean
}

const pickerOptions: PickerOption[] = [
  {
    type: 'consult',
    tone: 'coral',
    title: 'Free 15-min consult',
    desc: 'Not sure which program fits? Talk to us — we recommend based on your kid’s age, schedule and goals. No obligation.',
    recommended: true,
  },
  {
    type: 'class',
    tone: 'sky',
    title: 'Group class enrolment',
    desc: 'Reserve a seat in AI Creative Lab (ages 8–11) or AI Coding Studio (ages 12–17). 3–6 kids per cohort.',
  },
  {
    type: '1on1',
    tone: 'bubblegum',
    title: '1-on-1 tutoring',
    desc: 'Private online sessions with a senior instructor. From A$80/hour, or 10/20-pack discounts.',
  },
  {
    type: 'school',
    tone: 'sunshine',
    title: 'School partnership',
    desc: 'Year-long classroom program, co-taught with your teachers. Curriculum-aligned, Term 1–4.',
  },
  {
    type: 'platform',
    tone: 'mint',
    title: 'Kids OpenCode waitlist',
    desc: 'Early access to our flagship AI coding platform when it launches 2026 Q3.',
  },
]

const labels: Record<BookType, { eyebrow: string; title: string; intro: string; submit: string }> = {
  consult: {
    eyebrow: 'FREE CONSULT',
    title: 'Book your free 15-minute consult.',
    intro: 'We’ll figure out which program fits your kid — group class, 1-on-1, or platform waitlist. No pressure to sign up.',
    submit: 'Book free consult',
  },
  class: {
    eyebrow: 'GROUP CLASS',
    title: 'Reserve a seat in a class.',
    intro: 'Tell us which cohort and your kid’s age. We’ll confirm availability and next cohort start date within 1 business day.',
    submit: 'Send enrolment request',
  },
  '1on1': {
    eyebrow: '1-ON-1 TUTORING',
    title: 'Book a 1-on-1 session.',
    intro: 'Tell us a bit about your kid and what they want to work on. We’ll match a senior instructor and follow up to schedule.',
    submit: 'Send booking request',
  },
  school: {
    eyebrow: 'SCHOOL PARTNERSHIP',
    title: 'Bring Airbotix to your school.',
    intro: 'Year-long classroom programs, co-taught with your staff. Tell us about your school and we’ll propose a plan within 5 business days.',
    submit: 'Send partnership inquiry',
  },
  platform: {
    eyebrow: 'PLATFORM WAITLIST',
    title: 'Join the Kids OpenCode waitlist.',
    intro: '',
    submit: '',
  },
}

interface FormState {
  parent_name: string
  email: string
  phone: string
  kid_age: string
  cohort_interest: string
  subject_interest: string
  pack_choice: string
  school_name: string
  students_count: string
  preferred_date: string
  notes: string
  // school-only
  organization_role: string
  grade_range: string
}

const emptyForm: FormState = {
  parent_name: '',
  email: '',
  phone: '',
  kid_age: '',
  cohort_interest: '',
  subject_interest: '',
  pack_choice: '',
  school_name: '',
  students_count: '',
  preferred_date: '',
  notes: '',
  organization_role: '',
  grade_range: '',
}

const Picker = () => (
  <div className="bg-canvas">
    <section className="relative overflow-hidden py-24 md:py-28 bg-canvas">
      <div className="blob-bg bg-brand-coral" style={{ width: 480, height: 480, top: -120, right: -180, opacity: 0.25 }} aria-hidden="true" />
      <div className="blob-bg bg-brand-sky" style={{ width: 360, height: 360, bottom: -120, left: -160, opacity: 0.25 }} aria-hidden="true" />

      <div className="relative max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="max-w-3xl">
          <span className="eyebrow">BOOK</span>
          <h1 className="hero-display">
            What would you like to <span className="squiggle-word text-brand-coral">book?</span>
          </h1>
          <p className="lead-text mt-7">
            Pick the right entry point for your family. If you’re not sure, start with a free 15-minute consult.
          </p>
        </div>
      </div>
    </section>

    <section className="py-16 md:py-20 bg-canvas">
      <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pickerOptions.map((opt) => (
            <Link
              key={opt.type}
              to={opt.type === 'platform' ? '/programs/platform#waitlist' : `/book?type=${opt.type}`}
              className="card-base relative overflow-hidden hover:shadow-card-lift transition-shadow no-underline group"
            >
              <div className={`absolute top-0 left-0 right-0 h-1.5 bg-grad-${opt.tone}`} />
              {opt.recommended && (
                <span className="sticker-coral" style={{ position: 'absolute', top: -12, right: 20 }}>
                  RECOMMENDED
                </span>
              )}
              <h3 className="text-[20px] font-bold text-ink mt-3 mb-3 leading-tight">{opt.title}</h3>
              <p className="text-[14px] text-ink-soft leading-relaxed mb-5">{opt.desc}</p>
              <div className={`text-[14px] font-semibold text-brand-${opt.tone} group-hover:translate-x-1 transition-transform inline-block`}>
                {opt.type === 'platform' ? 'Join waitlist →' : 'Start →'}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  </div>
)

const Field = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  children,
}: {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  type?: string
  placeholder?: string
  required?: boolean
  children?: ReactNode
}) => (
  <div>
    <label htmlFor={name} className="block text-[13px] font-semibold text-ink mb-2">
      {label} {required && <span className="text-brand-coral">*</span>}
    </label>
    {children ? (
      children
    ) : type === 'textarea' ? (
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        rows={4}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 rounded-xl border-2 border-hairline focus:border-brand-coral focus:outline-none transition-colors text-[15px] resize-none"
      />
    ) : (
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 rounded-xl border-2 border-hairline focus:border-brand-coral focus:outline-none transition-colors text-[15px]"
      />
    )}
  </div>
)

const Book = () => {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const rawType = params.get('type') as BookType | null
  const type: BookType | null = rawType && ['consult', 'class', '1on1', 'school', 'platform'].includes(rawType) ? rawType : null

  // Platform waitlist lives on /programs/platform — redirect
  useEffect(() => {
    if (type === 'platform') {
      navigate('/programs/platform#waitlist', { replace: true })
    }
  }, [type, navigate])

  const [form, setForm] = useState<FormState>(emptyForm)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const formspreeId = import.meta.env.VITE_FORMSPREE_ID as string | undefined

  if (!type) {
    return <Picker />
  }

  if (type === 'platform') {
    // Brief loading state while redirect kicks in
    return (
      <div className="bg-canvas py-32 text-center text-ink-soft">Redirecting to the waitlist…</div>
    )
  }

  const meta = labels[type]

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg('')

    const payload = {
      booking_type: type,
      ...form,
      _subject: `Airbotix Booking [${type}]`,
    }

    try {
      if (formspreeId) {
        const r = await fetch(`https://formspree.io/f/${formspreeId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!r.ok) throw new Error('Submission failed. Please try again or email hello@airbotix.ai.')
      }
      setSubmitted(true)
      setForm(emptyForm)
    } catch (err) {
      setErrorMsg((err as Error).message || 'Submission failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-canvas">
      <section className="relative overflow-hidden py-20 md:py-28 bg-canvas">
        <div className="blob-bg bg-brand-coral" style={{ width: 480, height: 480, top: -120, right: -180, opacity: 0.22 }} aria-hidden="true" />

        <div className="relative max-w-[820px] mx-auto px-6 sm:px-8 lg:px-12">
          <Link to="/book" className="text-[13px] text-slate2 hover:text-ink transition-colors no-underline inline-flex items-center gap-2 mb-6">
            ← Change booking type
          </Link>
          <span className="eyebrow eyebrow-coral">{meta.eyebrow}</span>
          <h1 className="text-[36px] md:text-[48px] font-bold leading-[1.1] tracking-tight text-ink mt-3">
            {meta.title}
          </h1>
          {meta.intro && <p className="text-[16px] md:text-[18px] text-ink-soft leading-relaxed mt-6">{meta.intro}</p>}
        </div>
      </section>

      <section className="py-12 md:py-16 bg-wash-sky">
        <div className="max-w-[820px] mx-auto px-6 sm:px-8 lg:px-12">
          {submitted ? (
            <div className="card-base text-center">
              <div className="text-[48px] mb-4">🎉</div>
              <h2 className="text-[26px] font-bold text-ink mb-3">Thanks — we got your request.</h2>
              <p className="text-[15px] text-ink-soft leading-relaxed max-w-md mx-auto mb-7">
                We’ll follow up by email within 1 business day. If urgent, email <a href="mailto:hello@airbotix.ai" className="text-brand-coral font-semibold">hello@airbotix.ai</a>.
              </p>
              <Link to="/" className="btn-pill-primary inline-block">Back home</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="card-base space-y-5">
              {/* Shared fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Your name" name="parent_name" value={form.parent_name} onChange={handleChange} placeholder="Parent / contact name" required />
                <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Phone (optional)" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+61 ..." />
                {type !== 'school' && (
                  <Field label="Kid's age" name="kid_age" value={form.kid_age} onChange={handleChange} required>
                    <select id="kid_age" name="kid_age" value={form.kid_age} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border-2 border-hairline focus:border-brand-coral focus:outline-none transition-colors text-[15px] bg-canvas">
                      <option value="">Select age range</option>
                      <option value="8-11">8-11</option>
                      <option value="12-14">12-14 (middle school)</option>
                      <option value="15-17">15-17</option>
                      <option value="other">Other / multiple kids</option>
                    </select>
                  </Field>
                )}
              </div>

              {/* Class-specific */}
              {type === 'class' && (
                <Field label="Which cohort?" name="cohort_interest" value={form.cohort_interest} onChange={handleChange} required>
                  <select id="cohort_interest" name="cohort_interest" value={form.cohort_interest} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border-2 border-hairline focus:border-brand-coral focus:outline-none transition-colors text-[15px] bg-canvas">
                    <option value="">Select a cohort</option>
                    <option value="ai-creative-lab">AI Creative Lab (Ages 8-11) — A$480 / 8 sessions</option>
                    <option value="ai-coding-studio">AI Coding Studio (Ages 12-17) — A$600 / 10 sessions</option>
                    <option value="holiday-intensive">Holiday Intensive (3-5 day camp)</option>
                    <option value="not-sure">Not sure — recommend for me</option>
                  </select>
                </Field>
              )}

              {/* 1-on-1 specific */}
              {type === '1on1' && (
                <>
                  <Field label="Subject focus" name="subject_interest" value={form.subject_interest} onChange={handleChange} required>
                    <select id="subject_interest" name="subject_interest" value={form.subject_interest} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border-2 border-hairline focus:border-brand-coral focus:outline-none transition-colors text-[15px] bg-canvas">
                      <option value="">Select a focus area</option>
                      <option value="ai-creative">AI Image / Story / Music (8-11)</option>
                      <option value="ai-coding">AI Coding Foundations (11+)</option>
                      <option value="ai-agent">AI Agent Building (13+)</option>
                      <option value="school-project">School STEM Project Co-pilot</option>
                      <option value="hackathon">Hackathon Prep (13+)</option>
                      <option value="university-portfolio">University Portfolio (15+)</option>
                      <option value="not-sure">Not sure — recommend for me</option>
                    </select>
                  </Field>
                  <Field label="Package preference" name="pack_choice" value={form.pack_choice} onChange={handleChange}>
                    <select id="pack_choice" name="pack_choice" value={form.pack_choice} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-2 border-hairline focus:border-brand-coral focus:outline-none transition-colors text-[15px] bg-canvas">
                      <option value="">Decide later</option>
                      <option value="single">Single session — A$80</option>
                      <option value="10-pack">10-pack — A$750 (A$75/hour)</option>
                      <option value="20-pack">20-pack — A$1,400 (A$70/hour)</option>
                    </select>
                  </Field>
                </>
              )}

              {/* School-specific */}
              {type === 'school' && (
                <>
                  <Field label="School name" name="school_name" value={form.school_name} onChange={handleChange} placeholder="e.g., Brisbane Grammar" required />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Your role" name="organization_role" value={form.organization_role} onChange={handleChange} placeholder="Curriculum Lead / Deputy Principal / etc." />
                    <Field label="Approx. students" name="students_count" value={form.students_count} onChange={handleChange} placeholder="e.g., 60 students across Year 7-8" />
                  </div>
                  <Field label="Grade range" name="grade_range" value={form.grade_range} onChange={handleChange} placeholder="e.g., Year 5-8" />
                </>
              )}

              <Field
                label="Anything else? (optional)"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                type="textarea"
                placeholder={
                  type === 'consult'
                    ? "What's your kid into? What are you hoping they get out of this?"
                    : type === 'class'
                    ? 'Preferred time of day? Any scheduling constraints?'
                    : type === '1on1'
                    ? "What's the kid working on? Any specific goals or projects?"
                    : 'What does your school have in mind? Term timing, budget guidance, etc.'
                }
              />

              {errorMsg && (
                <div className="bg-brand-coral/10 border border-brand-coral/30 text-ink px-4 py-3 rounded-xl text-[14px]">
                  {errorMsg}
                </div>
              )}

              <button type="submit" disabled={submitting} className="btn-pill-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? 'Sending…' : meta.submit}
              </button>

              <p className="text-[12px] text-slate2 text-center">
                By submitting, you agree to our <Link to="/privacy" className="text-brand-coral font-semibold no-underline hover:underline">Privacy Policy</Link>.
                We respond within 1 business day.
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}

export default Book
