'use client';

import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import { ToolsSection, FeaturesSection } from '@/components/landing/ToolsSection';
import HowItWorks from '@/components/landing/HowItWorks';
import FAQSection from '@/components/landing/FAQSection';
import PricingSection from '@/components/landing/PricingSection';
import Footer from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-900">
      <Navbar />
      <HeroSection />
      <ToolsSection />
      <FeaturesSection />
      <HowItWorks />
      <FAQSection />
      <PricingSection />
      <Footer />
    </div>
  );
}
