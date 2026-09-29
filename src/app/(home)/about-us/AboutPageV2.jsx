import "./about-v2.css";

import HeroIntroSection from "./components/HeroIntroSection";
import CounterSection from "./components/CounterSection";
import AboutBelowFold from "./AboutBelowFold";

export default function AboutPageV2({ platformStats } = {}) {
  return (
    <main className="about-page">
      <HeroIntroSection />
      <CounterSection
        citiesCount={platformStats?.cities}
        buildersCount={platformStats?.builders}
        projectsCount={platformStats?.projects}
      />
      <AboutBelowFold />
    </main>
  );
}
