'use client'

import { useEffect, useRef } from 'react'

const pillars = [
  {
    label: 'Complete Visibility',
    body: 'Know who has paid, who hasn\'t, and what needs attention — without making a single phone call.',
  },
  {
    label: 'Efficient Operations',
    body: 'Reduce manual work and keep everything organized. Less time on admin means more time where it matters.',
  },
  {
    label: 'Scale With Confidence',
    body: 'Manage one property or many without losing control. KeyNest grows with your portfolio.',
  },
]

export default function Why() {
  const sectionRef = useRef<HTMLElement>(null)
  const revealed = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !revealed.current) {
          revealed.current = true
          sectionRef.current?.querySelectorAll<HTMLElement>('[data-animate]').forEach((el, i) => {
            setTimeout(() => {
              el.style.opacity = '1'
              el.style.transform = 'translateY(0)'
            }, i * 110)
          })
        }
      },
      { threshold: 0.12 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="why"
      style={{
        background: '#080808',
        padding: '7rem 2rem',
        borderTop: '1px solid rgba(255,255,255,0.04)',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '5rem', alignItems: 'start' }}>

          {/* Left sticky label + heading */}
          <div style={{ position: 'sticky', top: '7rem' }}>
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
                transition: 'opacity 0.7s ease, transform 0.7s ease',
              }}
            >
              Why KeyNest
            </p>
            <h2
              data-animate
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(2rem, 3vw, 2.75rem)',
                fontWeight: 400,
                color: '#fff',
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                opacity: 0,
                transform: 'translateY(20px)',
                transition: 'opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s',
              }}
            >
              Built for Property Owners Who Want More Control
            </h2>
          </div>

          {/* Right — pillars */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {pillars.map((p, i) => (
              <div
                key={p.label}
                data-animate
                style={{
                  padding: '2.5rem 0',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  opacity: 0,
                  transform: 'translateY(24px)',
                  transition: `opacity 0.7s ease ${0.2 + i * 0.13}s, transform 0.7s ease ${0.2 + i * 0.13}s`,
                }}
              >
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                  <span style={{
                    display: 'block',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#E8DCC8',
                    marginTop: '0.55rem',
                    flexShrink: 0,
                    opacity: 0.6,
                  }} />
                  <div>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', fontWeight: 400, color: '#E8DCC8', marginBottom: '0.6rem' }}>
                      {p.label}
                    </h3>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.92rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.5)', fontWeight: 300, maxWidth: '480px' }}>
                      {p.body}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #why > div > div { grid-template-columns: 1fr !important; gap: 2rem !important; }
          #why > div > div > div:first-child { position: static !important; }
        }
      `}</style>
    </section>
  )
}
