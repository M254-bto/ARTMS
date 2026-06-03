'use client'

import { useEffect, useRef } from 'react'

export default function FinalCTA() {
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
            }, i * 120)
          })
        }
      },
      { threshold: 0.2 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="contact"
      style={{
        background: '#080808',
        padding: '8rem 2rem',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle warm radial glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '700px',
          height: '400px',
          background: 'radial-gradient(ellipse at center, rgba(232,220,200,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <p
          data-animate
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.72rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'rgba(232,220,200,0.4)',
            marginBottom: '1.5rem',
            opacity: 0,
            transform: 'translateY(20px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          Get Started
        </p>

        <h2
          data-animate
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)',
            fontWeight: 400,
            lineHeight: 1.15,
            color: '#fff',
            letterSpacing: '-0.02em',
            marginBottom: '1.5rem',
            opacity: 0,
            transform: 'translateY(24px)',
            transition: 'opacity 0.8s ease 0.1s, transform 0.8s ease 0.1s',
          }}
        >
          Spend Less Time Managing.{' '}
          <br />
          <em style={{ color: '#E8DCC8', fontStyle: 'italic' }}>Spend More Time Growing.</em>
        </h2>

        <p
          data-animate
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.97rem',
            lineHeight: 1.75,
            color: 'rgba(232,220,200,0.55)',
            marginBottom: '2.75rem',
            opacity: 0,
            transform: 'translateY(20px)',
            transition: 'opacity 0.7s ease 0.22s, transform 0.7s ease 0.22s',
          }}
        >
          Stop relying on spreadsheets, notebooks, and endless follow-ups.
          Gain the visibility, control, and efficiency you need to grow your
          property investments with confidence.
        </p>

        <div
          data-animate
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            opacity: 0,
            transform: 'translateY(20px)',
            transition: 'opacity 0.7s ease 0.34s, transform 0.7s ease 0.34s',
          }}
        >
          <a href="https://artms-web.vercel.app" target="_blank" rel="noopener noreferrer" className="btn-primary">
            Get Started
          </a>
        </div>
      </div>
    </section>
  )
}
