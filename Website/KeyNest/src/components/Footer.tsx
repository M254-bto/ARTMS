'use client'

export default function Footer() {
  return (
    <footer
      style={{
        background: '#050505',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '3rem 2rem',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        {/* Logo + tagline */}
        <div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 600, color: '#E8DCC8' }}>
            Key<span style={{ color: '#fff' }}>Nest</span>
          </span>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.4rem', fontWeight: 300 }}>
            Manage tenants. Track rent. Grow with confidence.
          </p>
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', gap: '2rem' }}>
          {[
            { label: 'Features', href: '#features' },
            { label: 'Why KeyNest', href: '#why' },
            { label: 'Who It\'s For', href: '#who' },
          ].map((l) => (
            <a
              key={l.href}
              href={l.href}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.8rem',
                color: 'rgba(255,255,255,0.35)',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#E8DCC8')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'rgba(255,255,255,0.35)')}
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Copyright + credit */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem' }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)', fontWeight: 300 }}>
            © {new Date().getFullYear()} KeyNest
          </p>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: 'rgba(255,255,255,0.15)', fontWeight: 300 }}>
            Built and operated by{' '}
            <a
              href="https://afribs.co.ke"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'rgba(232,220,200,0.35)', textDecoration: 'none', transition: 'color 0.2s ease' }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#E8DCC8')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'rgba(232,220,200,0.35)')}
            >
              AfriBrain Bespoke Software
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
