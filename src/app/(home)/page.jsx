import HomePage from "./components/home/page";
import HomeIntroMotion from "./components/home/HomeIntroMotion";
import HeroLcpPreloads from "./components/_homecomponents/HeroLcpPreloads";

export default function Home() {
  return (
    <>
      <HeroLcpPreloads />
      <HomeIntroMotion>
        <HomePage />
      </HomeIntroMotion>
    </>
  );
}
