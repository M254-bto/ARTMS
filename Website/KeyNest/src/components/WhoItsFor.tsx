'use client'

import { useEffect, useRef } from 'react'

const audiences = [
  { title: 'Landlords', desc: 'Individual property owners who want less chaos and more clarity.' },
  { title: 'Property Managers', desc: 'Professionals managing multiple clients who need one reliable system.' },
  { title: 'Real Estate Investors', desc: 'Investors who need portfolio-level visibility to make smart decisions.' },
  { title: 'Apartment Developments', desc: 'Large developments that need structured tenant and payment workflows.' },
]

export default function WhoItsFor() {
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
            }, i * 100)
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
      id="who"
      style={{
        background: '#0c0c0c',
        padding: '7rem 2rem',
        borderTop: '1px solid rgba(255,255,255,0.04)',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '4rem', maxWidth: '580px' }}>
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
            Who It&apos;s For
          </p>
          <h2
            data-animate
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(1.9rem, 3vw, 2.75rem)',
              fontWeight: 400,
              color: '#fff',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              marginBottom: '1.25rem',
              opacity: 0,
              transform: 'translateY(20px)',
              transition: 'opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s',
            }}
          >
            Whether you manage 10 units or 1,000
          </h2>
          <p
            data-animate
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.95rem',
              lineHeight: 1.75,
              color: 'rgba(232,220,200,0.55)',
              opacity: 0,
              transform: 'translateY(20px)',
              transition: 'opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s',
            }}
          >
            KeyNest helps you stay organized and in control.
          </p>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {audiences.map((a, i) => (
            <div
              key={a.title}
              data-animate
              style={{
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '2px',
                padding: '2rem',
                opacity: 0,
                transform: 'translateY(24px)',
                transition: `opacity 0.7s ease ${0.25 + i * 0.1}s, transform 0.7s ease ${0.25 + i * 0.1}s, border-color 0.3s ease, background 0.3s ease`,
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = 'rgba(232,220,200,0.2)'
                el.style.background = 'rgba(232,220,200,0.03)'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = 'rgba(255,255,255,0.07)'
                el.style.background = 'transparent'
              }}
            >
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', fontWeight: 400, color: '#E8DCC8', marginBottom: '0.75rem' }}>
                {a.title}
              </h3>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.45)', fontWeight: 300 }}>
                {a.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
