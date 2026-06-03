import HomePage from "./components/home/page";
import HomeIntroMotion from "./components/home/HomeIntroMotion";
import HeroLcpPreloads from "./components/_homecomponents/HeroLcpPreloads";
import JsonLdScript from "@/app/_global_components/jsonLd/JsonLdScript";
import { buildFaqJsonLd } from "@/app/_global_components/jsonLd/buildJsonLd";
import { HOME_FAQ_ITEMS } from "./components/home/noida-projects/homeFaqItems";
import SeoFaqNarrative from "@/app/_global_components/seo/SeoFaqNarrative";

export default function Home() {
  return (
    <>
      <JsonLdScript data={buildFaqJsonLd(HOME_FAQ_ITEMS)} />
      <SeoFaqNarrative items={HOME_FAQ_ITEMS} />
      <HeroLcpPreloads />
      <HomeIntroMotion>
        <HomePage />
      </HomeIntroMotion>
    </>
  );
}
