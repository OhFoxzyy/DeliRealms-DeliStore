import { LandingHeader } from "@/components/landing/header";
import { HeroSection } from "@/components/landing/hero-section";
import { IntegrationsSection } from "@/components/landing/integrations-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { CTASection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";

export default async function HomePage() {
  return (
    <>
      <LandingHeader/>
      <div className="min-h-screen bg-background">
        <main>
          <HeroSection />
          <IntegrationsSection />
          <PricingSection />
          <CTASection />
        </main>
      </div>
      <Footer/>
    </>
  );
}
