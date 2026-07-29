import { SmoothScrollProvider } from '@/components/marketing/SmoothScrollProvider'
import { ScrollProgress } from '@/components/marketing/ScrollProgress'
import { PageWaterFlow } from '@/components/marketing/PageWaterFlow'
import { CustomCursor } from '@/components/marketing/CustomCursor'
import { GrainOverlay } from '@/components/marketing/GrainOverlay'
import { Preloader } from '@/components/marketing/Preloader'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { Hero } from '@/components/marketing/Hero'
import { AboutSection } from '@/components/marketing/AboutSection'
import { DayInLifeSection } from '@/components/marketing/DayInLifeSection'
import { HealthImpactSection } from '@/components/marketing/HealthImpactSection'
import { NutritionTips } from '@/components/marketing/NutritionTips'
import { MenuShowcase } from '@/components/marketing/MenuShowcase'
import { BrunchBoxSection } from '@/components/marketing/BrunchBoxSection'
import { CateringSection } from '@/components/marketing/CateringSection'
import { ReachSection } from '@/components/marketing/ReachSection'
import { HygieneSection } from '@/components/marketing/HygieneSection'
import { RoadmapSection } from '@/components/marketing/RoadmapSection'
import { FAQSection } from '@/components/marketing/FAQSection'
import { SchoolApplicationSection } from '@/components/marketing/SchoolApplicationSection'
import { SocialSection } from '@/components/marketing/SocialSection'
import { Footer } from '@/components/marketing/Footer'

export default function HomePage() {
  return (
    <SmoothScrollProvider>
      <Preloader />
      <CustomCursor />
      <GrainOverlay />
      <ScrollProgress />
      <PageWaterFlow />
      <MarketingNav />
      <Hero />
      <AboutSection />
      <DayInLifeSection />
      <HealthImpactSection />
      <NutritionTips />
      <MenuShowcase />
      <BrunchBoxSection />
      <CateringSection />
      <ReachSection />
      <HygieneSection />
      <RoadmapSection />
      <FAQSection />
      <SchoolApplicationSection />
      <SocialSection />
      <Footer />
    </SmoothScrollProvider>
  )
}
