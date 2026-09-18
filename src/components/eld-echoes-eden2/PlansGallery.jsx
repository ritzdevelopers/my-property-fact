'use client';

import { useEffect, useState } from 'react';
import { MdLock } from 'react-icons/md';
import s from './Eden.module.css';

const plans = [
  { label: '3 BHK, 1550 sq ft', size: '1550 sq ft', price: '₹1.99 Cr*' },
  { label: '3 BHK, 1850 sq ft', size: '1850 sq ft', price: 'On request' },
];

export function FloorPlans({ openModal, unlocked }) {
  const [selected, setSelected] = useState(0);
  const plan = plans[selected];

  return (
    <section id="plans" className={s.plans}>
      <div className={`${s.shell} ${s.sectionPad} ${s.plansGrid}`}>
        <div className={s.largePlan}>
          <img
            className={`${s.largePlanImg} ${unlocked ? '' : s.largePlanBlur}`}
            src="/echoes-eden/floor-plan.webp"
            alt={unlocked ? `Floor plan for ${plan.label}` : ''}
            aria-hidden={!unlocked}
          />
          {!unlocked && (
            <div className={s.largeLock}>
              <span className={s.largeLockIcon} aria-hidden="true">
                <MdLock />
              </span>
              <button
                className={`${s.gold} ${s.sectionBtn}`}
                onClick={() => openModal('plan')}
              >
                Unlock floor plan
              </button>
            </div>
          )}
          {unlocked && (
            <p className={s.planCaption}>Floor plan for {plan.label}.</p>
          )}
        </div>

        <div className={s.copy}>
          <h2 className={s.heading}>Floor plans</h2>
          <div className={`${s.tabs} ${s.planTabs}`}>
            {plans.map((p, i) => (
              <button
                className={`${s.tab} ${selected === i ? s.tabActive : ''}`}
                onClick={() => setSelected(i)}
                key={p.label}
              >
                {p.label}
              </button>
            ))}
          </div>
          <dl className={s.planStats}>
            <div>
              <dt>Home</dt>
              <dd>3 BHK</dd>
            </div>
            <div>
              <dt>Size</dt>
              <dd>{plan.size}</dd>
            </div>
            <div>
              <dt>Price</dt>
              <dd>{plan.price}</dd>
            </div>
            <div>
              <dt>Layout</dt>
              <dd>Daylight and cross-ventilation</dd>
            </div>
          </dl>
          <p>Unlock the plan to see room sizes and orientation. We will also send it to you on WhatsApp.</p>
          <button
            className={`${s.outline} ${s.sectionBtn}`}
            onClick={() => openModal('brochure')}
          >
            Download all plans in the brochure
          </button>
        </div>
      </div>
    </section>
  );
}

export function Gallery({ openModal }) {
  const photos = Array.from({ length: 10 }, (_, i) => `/echoes-eden/gallery${i + 1}.webp`);
  const [active, setActive] = useState(null);

  useEffect(() => {
    if (active === null) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setActive(null);
      if (e.key === 'ArrowRight') setActive((i) => (i + 1) % photos.length);
      if (e.key === 'ArrowLeft') setActive((i) => (i - 1 + photos.length) % photos.length);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [active, photos.length]);

  return (
    <section id="gallery" className={s.dark}>
      <div className={`${s.shell} ${s.sectionPad}`}>
        <div className={`${s.sectionHead} ${s.galleryHead}`}>
          <h2 className={`${s.heading} ${s.darkHeading}`}>Gallery</h2>
          <span className={s.galleryCount}>10 photos, artist’s impressions</span>
        </div>
        <div className={s.galleryGrid}>
          {photos.map((src, i) => (
            <button
              key={src}
              type="button"
              className={s.galleryItem}
              onClick={() => setActive(i)}
              aria-label={`Open gallery image ${i + 1}`}
            >
              <img src={src} alt="" className={s.galleryImg} />
            </button>
          ))}
        </div>
        <div className={s.galleryCta}>
          <button className={`${s.gold} ${s.galleryCtaBtn}`} onClick={() => openModal('visit')}>
            See it in person: book a site visit
          </button>
        </div>
      </div>

      {active !== null && (
        <div
          className={s.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label={`Gallery image ${active + 1} of ${photos.length}`}
          onMouseDown={(e) => e.target === e.currentTarget && setActive(null)}
        >
          <button type="button" className={s.lightboxClose} aria-label="Close" onClick={() => setActive(null)}>×</button>
          <button
            type="button"
            className={`${s.lightboxNav} ${s.lightboxPrev}`}
            aria-label="Previous image"
            onClick={() => setActive((i) => (i - 1 + photos.length) % photos.length)}
          >
            ‹
          </button>
          <img className={s.lightboxImg} src={photos[active]} alt={`Gallery image ${active + 1}`} />
          <button
            type="button"
            className={`${s.lightboxNav} ${s.lightboxNext}`}
            aria-label="Next image"
            onClick={() => setActive((i) => (i + 1) % photos.length)}
          >
            ›
          </button>
          <span className={s.lightboxCount}>{active + 1} / {photos.length}</span>
        </div>
      )}
    </section>
  );
}

