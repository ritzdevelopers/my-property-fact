import { Amenities } from "@/eldeco-echoes-of-eden/components/Amenities";
import { Faq } from "@/eldeco-echoes-of-eden/components/Faq";
import { FloorPlans } from "@/eldeco-echoes-of-eden/components/FloorPlans";
import { Gallery } from "@/eldeco-echoes-of-eden/components/Gallery";
import { Hero } from "@/eldeco-echoes-of-eden/components/Hero";
import { Highlights } from "@/eldeco-echoes-of-eden/components/Highlights";
import { LocationAdvantages } from "@/eldeco-echoes-of-eden/components/LocationAdvantages";
import { Overview } from "@/eldeco-echoes-of-eden/components/Overview";
import { Price } from "@/eldeco-echoes-of-eden/components/Price";
import { PromoCta } from "@/eldeco-echoes-of-eden/components/PromoCta";

export default function EldecoEchoesOfEden() {
  return (
    <main className="flex-1">
      <Hero />
      <Overview />
      <Highlights />
      <PromoCta />
      <Price />
      <Amenities />
      <FloorPlans />
      <Gallery />
      <LocationAdvantages />
      <Faq />
    </main>
  );
}
