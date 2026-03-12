

import React, { lazy, Suspense } from 'react'
import './App.css'

// Lazy load heavy components for better performance
const Hero = lazy(() => import('./components/optimized/Hero'))
const TechStack = lazy(() => import('./components/ui/techstack'))
const FirstSpark = lazy(() => import('./components/ui/firstspark'))
const PrebioticBattery = lazy(() => import('./components/ui/prebioticbattery'))
const EnergyVideo = lazy(() => import('./components/ui/energyvideo'))
const OurTeam = lazy(() => import('./components/ui/ourteam'))
const StickyScrollRevealDemo = lazy(() => import('./components/StickyScroll').then(module => ({ default: module.StickyScrollRevealDemo })))

// Optimized loading component
const LoadingFallback = ({ height = "50vh" }) => (
  <div className="flex items-center justify-center bg-slate-50" style={{ height }}>
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
  </div>
)

function App() {
  return (
    /* Outer wrapper: relative stacking context */
    <div className="relative">

      {/* Hero is sticky - stays fixed while next sections scroll over it */}
      <Suspense fallback={<LoadingFallback height="100vh" />}>
        <Hero />
      </Suspense>

      {/* TechStack is sticky z-0 — Hero slides over it as you scroll down */}
      {/* <Suspense fallback={<LoadingFallback />}>
        <TechStack />
      </Suspense> */}

      {/* First Spark: Cinematic origin story section - slides over Hero */}
      <Suspense fallback={<LoadingFallback />}>
        <FirstSpark />
      </Suspense>

      {/* Prebiotic Battery: Futuristic dark-mode scientific dashboard */}
      <Suspense fallback={<LoadingFallback />}>
        <PrebioticBattery />
      </Suspense>

      {/* Energy Video: Origin of life energy systems animation */}
      <Suspense fallback={<LoadingFallback />}>
        <EnergyVideo />
      </Suspense>
      
      {/* Sticky Scroll Reveal Demo */}
      <Suspense fallback={<LoadingFallback />}>
        <StickyScrollRevealDemo />
      </Suspense>

      {/* Our Team: Team members section */}
      <Suspense fallback={<LoadingFallback />}>
        <OurTeam />
      </Suspense>

    </div>
  )
}

export default App
