import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { WorkflowSection } from "@/components/landing/workflow-section";
import { CTASection } from "@/components/landing/cta-section";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <WorkflowSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
