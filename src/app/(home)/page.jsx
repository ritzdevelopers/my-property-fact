import HomePage from "./components/home/HomePage";
import HomeIntroMotion from "./components/home/HomeIntroMotion";
import HeroLcpPreloads from "./components/_homecomponents/HeroLcpPreloads";
import JsonLdScript from "@/app/_global_components/jsonLd/JsonLdScript";
import { buildFaqJsonLd } from "@/app/_global_components/jsonLd/buildJsonLd";
import { HOME_FAQ_ITEMS } from "./components/home/noida-projects/homeFaqItems";

export default function Home() {
  return (
    <>
      <link rel="canonical" href="https://mypropertyfact.in/" />
      <JsonLdScript data={buildFaqJsonLd(HOME_FAQ_ITEMS)} />
      <HeroLcpPreloads />
      <HomeIntroMotion>
        <HomePage />
      </HomeIntroMotion>
    </>
  );
}
