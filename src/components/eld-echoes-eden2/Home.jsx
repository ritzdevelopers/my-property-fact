'use client';

import { useState } from 'react';
import s from './Eden.module.css';
import { Header, Hero, LeadForm } from './HeaderHero';
import { KeyFacts, Overview } from './Overview';
import { Pricing } from './Pricing';
import Amenities from './Amenities';
import { FloorPlans, Gallery } from './PlansGallery';
import { DeveloperFooter, Faqs, Location } from './LocationFaqFooter';

const modalCopy = {
  enquire: ['Talk to a property advisor', 'Share your number and we will call you back.'],
  price: ['Get the complete price sheet', 'Prices, charges and the payment schedule for every home.'],
  priceLarge: ['Unlock the 1850 sq ft price', 'Get the current price and availability for the larger 3 BHK.'],
  brochure: ['Download the brochure', 'Floor plans, amenities and specifications in one PDF.'],
  plan: ['Unlock the floor plan', 'See room sizes and orientation. We will also send it on WhatsApp.'],
  amen: ['Get the full amenities list', 'All 50+ amenities, with the clubhouse and landscape plan.'],
  visit: ['Book a free site visit', 'Pick a time on the call. Pickup can be arranged on request.'],
  planDetails: ['Get the 10:24 payment plan', 'The full schedule, eligibility and what you pay when.'],
};

function Home() {
  const [modal, setModal] = useState(null);
  const [unlocked, setUnlocked] = useState(false);
  const openModal = type => setModal(type);
  const copy = modal ? modalCopy[modal] : null;
  return (
    <main className={s.page}>
      <Header openModal={openModal} />
      <Hero openModal={openModal} unlockPlan={() => setUnlocked(true)} />
      <KeyFacts />
      <Overview openModal={openModal} />
      <Pricing openModal={openModal} />
      <Amenities openModal={openModal} />
      <FloorPlans openModal={openModal} unlocked={unlocked} />
      <Gallery openModal={openModal} />
      <Location openModal={openModal} />
      <Faqs openModal={openModal} />
      <DeveloperFooter openModal={openModal} />
      {copy && <div className={s.modalBack} role="dialog" aria-modal="true" aria-labelledby="sheet-title" onMouseDown={e => e.target === e.currentTarget && setModal(null)}>
        <div className={s.modal}>
          <button className={s.close} aria-label="Close" onClick={() => setModal(null)}>×</button>
          <h2 id="sheet-title" className={s.formTitle} style={{marginRight:48}}>{copy[0]}</h2>
          <p className={s.formSub}>{copy[1]}</p>
          <LeadForm compact onComplete={() => modal === 'plan' && setUnlocked(true)} />
        </div>
      </div>}
    </main>
  );
}

export default Home;
