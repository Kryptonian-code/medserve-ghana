import PublicLayout from "@/components/layout/PublicLayout";
import HeroSection from "@/components/landing/HeroSection";
import BenefitsSection from "@/components/landing/BenefitsSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import CategoriesSection from "@/components/landing/CategoriesSection";
import TrustSection from "@/components/landing/TrustSection";
import FAQSection from "@/components/landing/FAQSection";
import ContactSection from "@/components/landing/ContactSection";

const Index = () => {
  return (
    <PublicLayout>
      <HeroSection />
      <BenefitsSection />
      <HowItWorksSection />
      <CategoriesSection />
      <TrustSection />
      <FAQSection />
      <ContactSection />
    </PublicLayout>
  );
};

export default Index;
