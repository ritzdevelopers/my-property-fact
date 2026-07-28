import "./about-v2.css";

import HeroIntroSection from "./components/HeroIntroSection";
import VideoCTASection from "./components/VideoCTASection";
import WhyChooseSection from "./components/WhyChooseSection";
import TimelineSection from "./components/TimelineSection";
import VaastuStripSection from "../components/home/vaastu-strip/VaastuStripSection";
import SocialFeedsOfMPF from "../components/_homecomponents/SocialFeedsOfMPF";
import WhyMyPropertyFact from "./WhyMyPropertyFact";

export default function AboutPageV2() {
  return (
    <main className="about-page">
      <HeroIntroSection />
      <VideoCTASection />
      <WhyChooseSection />
      <TimelineSection />
      <WhyMyPropertyFact />
      <VaastuStripSection />
      <SocialFeedsOfMPF />
    </main>
  );
}