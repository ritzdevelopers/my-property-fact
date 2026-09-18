'use client';

import { useState } from 'react';
import s from './Eden.module.css';

const faqs = [
  ['What is Eldeco EOE?', 'Eldeco EOE is the short name buyers and brokers use for Eldeco Echoes of Eden, a residential project by Eldeco Group in Sector 22D, Yamuna Expressway, Greater Noida. Both names refer to the same RERA-registered development, which offers 3 BHK homes on a 5-acre site.'],
  ['Where is Eldeco Echoes of Eden located?', 'Eldeco Echoes of Eden is in Sector 22D on the Yamuna Expressway in Greater Noida. The expressway is about 2 minutes away, Galgotias University about 10 minutes, and Noida International Airport at Jewar about 15 minutes by road, based on typical travel times.'],
  ['What sizes and configurations are available?', 'The project offers 3 BHK homes in two sizes, 1550 sq ft and 1850 sq ft. You can request the floor plan for either size through the enquiry form on this page.'],
  ['What is the price of Eldeco Echoes of Eden?', 'The 1550 sq ft 3 BHK starts at ₹1.99 Cr*. The price of the 1850 sq ft home is shared on request. Request the price sheet for current rates, payment schedule and applicable charges.'],
  ['What is the 10:24 payment plan?', 'Under the current offer, buyers pay 10% of the price at booking and make no further payment for 24 months**. Ask for the plan details before you book.'],
  ['Is Eldeco Echoes of Eden RERA registered?', 'Yes. The project is registered with the Uttar Pradesh Real Estate Regulatory Authority under UPRERAPRJ125342/02/2026.'],
  ['Is Eldeco Echoes of Eden a good investment?', 'The project is on the Yamuna Expressway corridor, close to Noida International Airport and several universities. Compare price, timeline and your own goals before you invest.'],
  ['Which amenities does the project offer?', 'The project plans more than 50 amenities, including a 3-acre central green, palm tree avenue, amphitheatre, multipurpose hall, open gym, kids’ swing area, convenience retail, CCTV security and power backup.'],
];

export function Location({ openModal }) {
  const places = [
    ['Yamuna Expressway', '2 min', 'km'],
    ['Galgotias University', '10 min', 'km'],
    ['Noida International Airport, Jewar', '15 min', 'verify, km'],
    ['Sharda University', '20 min', 'km'],
    ['Omaxe Connaught Place', '20 min', 'km'],
    ['Radisson Blu Greater Noida', '25 min', 'km'],
  ];

  return (
    <section id="location" className={s.light}>
      <div className={`${s.shell} ${s.sectionPad} ${s.locationGrid}`}>
        <div className={s.map}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3055.9154954723213!2d77.53278856643487!3d28.320954600258883!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cc70052ea96bb%3A0x503f16956a8f6f34!2sEldeco%20Echoes%20of%20Eden!5e1!3m2!1sen!2sus!4v1789708871345!5m2!1sen!2sus"
            title="Eldeco Echoes of Eden on Google Maps"
            width="600"
            height="450"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
        <div className={s.copy}>
          <h2 className={s.heading}>Connected to the airport, universities and the city</h2>
          <ul className={s.distanceGrid}>
            {places.map(([place, time, note]) => (
              <li key={place}>
                <span className={s.distancePlace}>{place}</span>
                <span className={s.distanceMeta}>
                  <strong className={s.distanceTime}>{time}</strong>{' '}
                  <span className={s.confirm}>{note}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className={s.actions}>
            <button className={`${s.gold} ${s.sectionBtn}`} onClick={() => openModal('visit')}>
              Book a site visit
            </button>
           
          </div>
        </div>
      </div>
    </section>
  );
}

export function Faqs({ openModal }) {
  const [open, setOpen] = useState(0);

  return (
    <section id="faqs" className={s.faqs}>
      <div className={`${s.shell} ${s.sectionPad} ${s.faqGrid}`}>
        <div className={s.faqSide}>
          <h2 className={s.heading}>FAQs</h2>
          <p className={s.faqIntro}>Straight answers about Eldeco Echoes of Eden, Sector 22D.</p>
          <p className={s.faqUpdated}>Last updated: <span className={s.confirm}>date</span></p>
          <div className={s.faqCta}>
            <strong className={s.faqCtaTitle}>Still have questions?</strong>
            <span className={s.faqCtaText}>Talk to a property advisor.</span>
            <button
              type="button"
              className={`${s.gold} ${s.faqCtaBtn}`}
              onClick={() => openModal('enquire')}
            >
              Enquire now
            </button>
          </div>
        </div>
        <div className={s.faqList}>
          {faqs.map(([q, a], i) => (
            <div className={s.faqItem} key={q}>
              <h3 className={s.faqQuestion}>
                <button
                  className={s.faqButton}
                  aria-expanded={open === i}
                  onClick={() => setOpen(open === i ? -1 : i)}
                >
                  <span>{q}</span>
                  <span className={`${s.faqSign} ${open === i ? s.faqSignOpen : ''}`}>
                    {open === i ? '−' : '+'}
                  </span>
                </button>
              </h3>
              {open === i && <p className={s.answer}>{a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DeveloperFooter({ openModal }) {
  return (
    <>
      <section className={s.dark} aria-label="About Eldeco Group">
        <div className={`${s.shell} ${s.developerGrid}`}>
          <div className={s.developerCopy}>
            <h2 className={`${s.heading} ${s.darkHeading} ${s.developerTitle}`}>About Eldeco Group</h2>
            <p className={s.developerText}>
              Eldeco has delivered projects since 1985, so its track record in North India can be checked against completed developments. Across 20 cities, its portfolio spans townships, residential communities, industrial parks, retail and commercial towers.
            </p>
          </div>
          <dl className={s.developerStats}>
            <div>
              <dt>Building since</dt>
              <dd className={`${s.serif} ${s.developerStat}`}>1985</dd>
            </div>
            <div>
              <dt>Cities</dt>
              <dd className={`${s.serif} ${s.developerStat}`}>20</dd>
            </div>
            <div>
              <dt>Projects delivered</dt>
              <dd><span className={s.confirm}>count</span></dd>
            </div>
          </dl>
        </div>
      </section>

      <footer id="disclaimer" className={s.footer}>
        <div className={`${s.shell} ${s.footerGrid}`}>
          <div className={s.reraBlock}>
            <img
              className={s.reraQr}
              src="/echoes-eden/qr-code.png"
              alt="UP RERA QR code for Eldeco Echoes of Eden"
              width={120}
              height={120}
            />
            <span className={s.reraHint}>Scan to verify on UP RERA</span>
          </div>
          <div className={s.footerCopy}>
            <p className={s.footerRera}>UP RERA registration: UPRERAPRJ125342/02/2026</p>
            <p>
              <strong className={s.footerStrong}>Disclaimer:</strong> The content on this website is for information purposes only and does not constitute an offer to avail any service. Images are artist’s impressions.
            </p>
            <p>
              *Starting price is for the 1550 sq ft home and excludes <span className={s.confirm}>taxes and charges</span>. **Pay 10% now, nothing till 24 months: <span className={s.confirm}>offer terms</span>.
            </p>
            <div className={s.copyright}>
              <span>© 2026 My Property Fact</span>
              <a className={s.footerLink} href="#disclaimer">Disclaimer and privacy policy</a>
            </div>
          </div>
        </div>
      </footer>

      <button
        type="button"
        className={`${s.gold} ${s.floatingEnquire}`}
        onClick={() => openModal('enquire')}
      >
        Enquire now
      </button>
    </>
  );
}
