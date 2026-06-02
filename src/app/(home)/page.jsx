import HomePage from "./components/home/page";
import HomeIntroMotion from "./components/home/HomeIntroMotion";
import HeroLcpPreloads from "./components/_homecomponents/HeroLcpPreloads";
import JsonLdScript from "@/app/_global_components/jsonLd/JsonLdScript";
import { buildFaqJsonLd } from "@/app/_global_components/jsonLd/buildJsonLd";
import { HOME_FAQ_ITEMS } from "./components/home/noida-projects/homeFaqItems";

export default function Home() {
  return (
    <>
      <JsonLdScript data={buildFaqJsonLd(HOME_FAQ_ITEMS)} />
      {/* <h1 className="visually-hidden">Smart Real Estate Decisions Start Here</h1> */}
      <HeroLcpPreloads />
      <HomeIntroMotion>
        <HomePage />
      </HomeIntroMotion>
    </>
  );
}
