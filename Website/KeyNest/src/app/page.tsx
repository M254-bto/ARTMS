import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Problem from '@/components/Problem'
import Features from '@/components/Features'
import Why from '@/components/Why'
import WhoItsFor from '@/components/WhoItsFor'
import FinalCTA from '@/components/FinalCTA'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <div style={{ background: '#080808', minHeight: '100vh' }}>
      <Header />
      <main>
        <Hero />
        <Problem />
        <Features />
        <Why />
        <WhoItsFor />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}
