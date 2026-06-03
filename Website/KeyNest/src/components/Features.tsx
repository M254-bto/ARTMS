'use client'

import { useEffect, useRef } from 'react'

const features = [
  {
    number: '01',
    title: 'Tenant Management',
    body: 'Keep tenant records, lease information, and occupancy history in one place. No more scattered spreadsheets.',
  },
  {
    number: '02',
    title: 'Rent Tracking',
    body: 'Monitor payments, balances, and collection performance in real time. Know exactly who has paid and who hasn\'t.',
  },
  {
    number: '03',
    title: 'Automated Reminders',
    body: 'Reduce late payments with automatic rent reminders sent to tenants before and after due dates.',
  },
  {
    number: '04',
    title: 'Maintenance Requests',
    body: 'Track issues from reporting to resolution. Caretakers and tenants log requests; you see everything.',
  },
  {
    number: '05',
    title: 'Property Dashboard',
    body: 'See the status of your entire property portfolio at a glance — vacancies, rent collected, open issues.',
  },
]

export default function Features() {
  const sectionRef = useRef<HTMLElement>(null)
  const revealed = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !revealed.current) {
          revealed.current = true
          const items = sectionRef.current?.querySelectorAll<HTMLElement>('[data-animate]')
          items?.forEach((el, i) => {
            setTimeout(() => {
              el.style.opacity = '1'
              el.style.transform = 'translateY(0)'
            }, i * 90)
          })
        }
      },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="features"
      style={{
        background: '#0c0c0c',
        padding: '7rem 2rem',
        borderTop: '1px solid rgba(255,255,255,0.04)',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Section header */}
        <div style={{ marginBottom: '4.5rem' }}>
          <p
            data-animate
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.72rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'rgba(232,220,200,0.4)',
              marginBottom: '1rem',
              opacity: 0,
              transform: 'translateY(20px)',
              transition: 'opacity 0.7s ease, transform 0.7s ease',
            }}
          >
            What You Can Do With KeyNest
          </p>
          <h2
            data-animate
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(1.9rem, 3vw, 2.75rem)',
              fontWeight: 400,
              color: '#fff',
              letterSpacing: '-0.02em',
              maxWidth: '480px',
              lineHeight: 1.2,
              opacity: 0,
              transform: 'translateY(20px)',
              transition: 'opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s',
            }}
          >
            Everything in one place,<br />nothing falls through
          </h2>
        </div>

        {/* Feature grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.05)' }}>
          {features.map((f, i) => (
            <div
              key={f.number}
              data-animate
              style={{
                background: '#0c0c0c',
                padding: '2.5rem',
                opacity: 0,
                transform: 'translateY(24px)',
                transition: `opacity 0.7s ease ${0.2 + i * 0.09}s, transform 0.7s ease ${0.2 + i * 0.09}s`,
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = '#111'
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = '#0c0c0c'
              }}
            >
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', color: 'rgba(232,220,200,0.3)', letterSpacing: '0.1em', display: 'block', marginBottom: '1.5rem' }}>
                {f.number}
              </span>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.35rem', fontWeight: 400, color: '#E8DCC8', marginBottom: '0.9rem', lineHeight: 1.3 }}>
                {f.title}
              </h3>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.5)', fontWeight: 300 }}>
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
