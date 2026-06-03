'use client'

import { useEffect, useRef } from 'react'

const problems = [
  'Chasing tenants for rent',
  'Searching for payment confirmations',
  'Calling caretakers for updates',
  'Losing track of vacancies',
  'Managing maintenance through phone calls',
]

export default function Problem() {
  const sectionRef = useRef<HTMLElement>(null)
  const revealed = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !revealed.current) {
          revealed.current = true
          const items = sectionRef.current?.querySelectorAll<HTMLElement>('[data-animate]')
          items?.forEach((el, i) => {
            el.style.transition = `opacity 0.7s ease ${i * 0.1}s, transform 0.7s ease ${i * 0.1}s`
            el.style.opacity = '1'
            el.style.transform = 'translateY(0)'
          })
        }
      },
      { threshold: 0.15 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="problem"
      style={{ background: '#080808', padding: '7rem 2rem' }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'start' }}>

        {/* Left — label + heading */}
        <div>
          <p
            data-animate
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.72rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'rgba(232,220,200,0.4)',
              marginBottom: '1.25rem',
              opacity: 0,
              transform: 'translateY(20px)',
            }}
          >
            The Problem
          </p>
          <h2
            data-animate
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(2rem, 3.5vw, 3rem)',
              fontWeight: 400,
              lineHeight: 1.2,
              color: '#fff',
              letterSpacing: '-0.02em',
              marginBottom: '1.5rem',
              opacity: 0,
              transform: 'translateY(20px)',
            }}
          >
            Still Managing Properties Through Spreadsheets and WhatsApp?
          </h2>
          <p
            data-animate
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.95rem',
              lineHeight: 1.75,
              color: 'rgba(232,220,200,0.6)',
              opacity: 0,
              transform: 'translateY(20px)',
            }}
          >
            KeyNest brings everything together into one centralized system so you always know what&apos;s happening across your properties.
          </p>
        </div>

        {/* Right — problem list */}
        <div style={{ paddingTop: '3.5rem' }}>
          <p
            data-animate
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.85rem',
              color: 'rgba(232,220,200,0.45)',
              marginBottom: '1.5rem',
              opacity: 0,
              transform: 'translateY(20px)',
            }}
          >
            Managing rental properties shouldn&apos;t mean:
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0' }}>
            {problems.map((p, i) => (
              <li
                key={i}
                data-animate
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.1rem 0',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  opacity: 0,
                  transform: 'translateY(20px)',
                }}
              >
                <span style={{ color: '#E8DCC8', fontSize: '0.75rem', opacity: 0.6, flexShrink: 0 }}>✗</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.95rem', color: 'rgba(255,255,255,0.75)', fontWeight: 400 }}>
                  {p}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #problem > div { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
          #problem > div > div:last-child { padding-top: 0 !important; }
        }
      `}</style>
    </section>
  )
}
