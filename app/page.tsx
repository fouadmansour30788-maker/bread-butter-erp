import { MarketingNav } from '@/components/marketing/MarketingNav'
import { Hero } from '@/components/marketing/Hero'
import { AboutSection } from '@/components/marketing/AboutSection'
import { HealthImpactSection } from '@/components/marketing/HealthImpactSection'
import { NutritionTips } from '@/components/marketing/NutritionTips'
import { MenuShowcase } from '@/components/marketing/MenuShowcase'
import { CateringSection } from '@/components/marketing/CateringSection'
import { SchoolApplicationSection } from '@/components/marketing/SchoolApplicationSection'
import { Footer } from '@/components/marketing/Footer'

export default function HomePage() {
  return (
    <>
      <MarketingNav />
      <Hero />
      <AboutSection />
      <HealthImpactSection />
      <NutritionTips />
      <MenuShowcase />
      <CateringSection />
      <SchoolApplicationSection />
      <Footer />
    </>
  )
}
