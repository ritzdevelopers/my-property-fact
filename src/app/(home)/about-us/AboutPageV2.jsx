import "./about-v2.css";

import HeroIntroSection from "./components/HeroIntroSection";
import CounterSection from "./components/CounterSection";
import VideoCTASection from "./components/VideoCTASection";
import WhyChooseSection from "./components/WhyChooseSection";
import TimelineSection from "./components/TimelineSection";
import WhyMyPropertyFact from "./components/WhyMyPropertyFact";
import VaastuStripSection from "../components/home/vaastu-strip/VaastuStripSection";
import SocialFeedsOfMPF from "../components/_homecomponents/SocialFeedsOfMPF";

export default function AboutPageV2() {
  return (
    <main className="about-page">
      <HeroIntroSection />
      <CounterSection />
      <VideoCTASection />
      <WhyChooseSection />
      <TimelineSection />
      <WhyMyPropertyFact />
      <VaastuStripSection ariaLabelledBy="our-commitment-heading" />
      <SocialFeedsOfMPF sectionTitle="Social Feeds from My Property Fact on Instagram" />
    </main>
  );
}