import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { LiveTournaments } from "@/components/home/LiveTournaments";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { TopPlayersSection } from "@/components/home/TopPlayersSection";
import { CTASection } from "@/components/home/CTASection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <LiveTournaments />
      <FeaturesSection />
      <TopPlayersSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
