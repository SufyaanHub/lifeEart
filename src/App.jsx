

import React from 'react'
import './App.css'
import Hero from './components/ui/hero'
import TechStack from './components/ui/techstack'
import FirstSpark from './components/ui/firstspark'
import PrebioticBattery from './components/ui/prebioticbattery'
import EnergyVideo from './components/ui/energyvideo'
import OurTeam from './components/ui/ourteam'

function App() {
  return (
    /* Outer wrapper: relative stacking context */
    <div className="relative">

      {/* Hero is sticky - stays fixed while next sections scroll over it */}
      <Hero />

      {/* TechStack is sticky z-0 — Hero slides over it as you scroll down */}
      {/* <TechStack /> */}

      {/* First Spark: Cinematic origin story section - slides over Hero */}
      <FirstSpark />

      {/* Prebiotic Battery: Futuristic dark-mode scientific dashboard */}
      <PrebioticBattery />

      {/* Energy Video: Origin of life energy systems animation */}
      <EnergyVideo />

      {/* Our Team: Team members section */}
      <OurTeam />

    </div>
  )
}

export default App
