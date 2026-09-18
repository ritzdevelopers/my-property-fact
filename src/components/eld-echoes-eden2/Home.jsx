'use client';

import { useEffect, useRef, useState } from 'react';
import s from './Eden.module.css';
import { Header, Hero, LeadForm } from './HeaderHero';
import { KeyFacts, Overview } from './Overview';
import { Pricing } from './Pricing';
import Amenities from './Amenities';
import { FloorPlans, Gallery } from './PlansGallery';
import { DeveloperFooter, Faqs, Location } from './LocationFaqFooter';

const FILLED_KEY = 'userFilled';
const FIRST_OPEN_MS = 15000;
const REPEAT_OPEN_MS = 20000;

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

function hasFilledForm() {
  return sessionStorage.getItem(FILLED_KEY) === 'true';
}

function Home() {
  const [modal, setModal] = useState(null);
  const [unlocked, setUnlocked] = useState(false);
  const hasSeenModal = useRef(false);
  const openModal = type => setModal(type);
  const closeModal = () => setModal(null);
  const copy = modal ? modalCopy[modal] : null;

  useEffect(() => {
    if (modal) {
      hasSeenModal.current = true;
      return;
    }

    if (hasFilledForm()) return;

    const delay = hasSeenModal.current ? REPEAT_OPEN_MS : FIRST_OPEN_MS;
    const timer = setTimeout(() => {
      if (hasFilledForm()) return;
      setModal('enquire');
    }, delay);

    return () => clearTimeout(timer);
  }, [modal]);

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
      {copy && <div className={s.modalBack} role="dialog" aria-modal="true" aria-labelledby="sheet-title" onMouseDown={e => e.target === e.currentTarget && closeModal()}>
        <div className={s.modal}>
          <button className={s.close} aria-label="Close" onClick={closeModal}>×</button>
          <h2 id="sheet-title" className={s.formTitle} style={{marginRight:48}}>{copy[0]}</h2>
          <p className={s.formSub}>{copy[1]}</p>
          <LeadForm compact onComplete={() => modal === 'plan' && setUnlocked(true)} />
        </div>
      </div>}
    </main>
  );
}

export default Home;
