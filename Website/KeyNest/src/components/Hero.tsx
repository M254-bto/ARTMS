'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'

export default function Hero() {
  const headRef = useRef<HTMLHeadingElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Simple CSS-animation-based reveal — no GSAP needed here
    const els = [headRef.current, subRef.current, ctaRef.current]
    els.forEach((el, i) => {
      if (!el) return
      el.style.opacity = '0'
      el.style.transform = 'translateY(28px)'
      el.style.transition = `opacity 0.9s ease ${0.2 + i * 0.22}s, transform 0.9s ease ${0.2 + i * 0.22}s`
      requestAnimationFrame(() => {
        el.style.opacity = '1'
        el.style.transform = 'translateY(0)'
      })
    })
  }, [])

  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: '#080808',
      }}
    >
      {/* Photo — right half fades in */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
        }}
      >
        <Image
          src="/hero.png"
          alt="Modern apartment complex at sunset"
          fill
          priority
          quality={90}
          style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
        />
        {/* Left opacity gradient: text sits on solid dark, photo reveals right */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to right, rgba(8,8,8,1) 0%, rgba(8,8,8,0.92) 35%, rgba(8,8,8,0.55) 60%, rgba(8,8,8,0.08) 100%)',
          }}
        />
        {/* Bottom vignette for clean section transition */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to bottom, rgba(8,8,8,0.3) 0%, transparent 30%, transparent 70%, rgba(8,8,8,0.9) 100%)',
          }}
        />
      </div>

      {/* Content — left-aligned */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 2rem',
          width: '100%',
          paddingTop: '7rem',
          paddingBottom: '6rem',
        }}
      >
        <div style={{ maxWidth: '640px' }}>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.75rem',
              fontWeight: 500,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'rgba(232,220,200,0.55)',
              marginBottom: '1.5rem',
            }}
          >
            Property Management Platform
          </p>

          <h1
            ref={headRef}
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(2.6rem, 5.5vw, 4.5rem)',
              fontWeight: 400,
              lineHeight: 1.1,
              color: '#fff',
              marginBottom: '1.5rem',
              letterSpacing: '-0.02em',
            }}
          >
            Property Management{' '}
            <em style={{ fontStyle: 'italic', color: '#E8DCC8' }}>Without</em>{' '}
            the Chaos
          </h1>

          <p
            ref={subRef}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 'clamp(0.95rem, 1.6vw, 1.1rem)',
              lineHeight: 1.7,
              color: 'rgba(232,220,200,0.72)',
              marginBottom: '2.5rem',
              maxWidth: '520px',
            }}
          >
            Track tenants, monitor rent payments, manage maintenance requests,
            and gain complete visibility into your properties from one simple platform.
          </p>

          <div
            ref={ctaRef}
            style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}
          >
            <a href="https://artms-web.vercel.app" target="_blank" rel="noopener noreferrer" className="btn-primary">
              Get Started
            </a>
            <a href="#features" className="btn-secondary">
              See How It Works
            </a>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.4rem',
        }}
      >
        <div
          style={{
            width: '1px',
            height: '48px',
            background: 'linear-gradient(to bottom, transparent, rgba(232,220,200,0.4))',
          }}
        />
        <div
          className="animate-pulse-dot"
          style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(232,220,200,0.5)' }}
        />
      </div>
    </section>
  )
}
