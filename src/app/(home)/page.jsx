import HomePage from "./components/home/page";
import HomeIntroMotion from "./components/home/HomeIntroMotion";
import HeroLcpPreloads from "./components/_homecomponents/HeroLcpPreloads";

export default function Home() {
  return (
    <>
      <h1 className="visually-hidden">Smart Real Estate Decisions Start Here</h1>
      <HeroLcpPreloads />
      <HomeIntroMotion>
        <HomePage />
      </HomeIntroMotion>
    </>
  );
}
