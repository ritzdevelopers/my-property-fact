import s from './Eden.module.css';

function PlanSketch() {
  return (
    <div className={s.planPreview}>
      <img className={s.planPreviewImg} src="/echoes-eden/floor-plan.webp" alt="" aria-hidden="true" />
      <span className={s.planLock}>▣ Floor plan on request</span>
    </div>
  );
}

export function Pricing({ openModal }) {
  return (
    <>
      <section id="price" className={s.light}>
        <div className={`${s.shell} ${s.sectionPad}`}>
          <h2 className={`${s.heading} ${s.priceIntro}`}>Price and configurations</h2>
          <p className={s.priceLead}>Both homes are 3 BHK. Get the full price sheet with charges and the payment schedule.</p>
          <div className={s.priceGrid}>
            <article className={s.priceCard}>
              <div className={s.cardTop}>
                <h3>3 BHK</h3>
                <span className={s.pill}>10:24 plan</span>
              </div>
              <PlanSketch />
              <dl className={s.cardStats}>
                <div>
                  <dt>Size</dt>
                  <dd>1550 sq ft <span className={s.confirm}>area type</span></dd>
                </div>
                <div>
                  <dt>Price</dt>
                  <dd className={s.cardPrice}>₹1.99 Cr*</dd>
                </div>
                <div>
                  <dt>Rate</dt>
                  <dd>₹<span className={s.confirm}>rate</span> per sq ft</dd>
                </div>
              </dl>
              <button className={`${s.gold} ${s.priceCardBtn}`} onClick={() => openModal('price')}>Get price sheet</button>
            </article>

            <article className={s.priceCard}>
              <div className={s.cardTop}>
                <h3>3 BHK, larger</h3>
                <span className={s.pill}>10:24 plan</span>
              </div>
              <PlanSketch />
              <dl className={s.cardStats}>
                <div>
                  <dt>Size</dt>
                  <dd>1850 sq ft <span className={s.confirm}>area type</span></dd>
                </div>
                <div>
                  <dt>Price</dt>
                  <dd className={s.cardPrice}>On request</dd>
                </div>
                <div>
                  <dt>Availability</dt>
                  <dd>Limited <span className={s.confirm}>confirm</span></dd>
                </div>
              </dl>
              <button className={`${s.gold} ${s.priceCardBtn}`} onClick={() => openModal('priceLarge')}>Unlock 1850 sq ft price</button>
            </article>

            <aside className={s.offerCard}>
              <span className={`${s.offerNumber} ${s.offerCardNumber}`}>10:24</span>
              <h3 className={s.offerCardTitle}>Pay 10% now, nothing more for 24 months**</h3>
              <p className={s.offerCardText}>Book your home with 10% of the price and make no further payment for two years. Ask your advisor for the full schedule and eligibility.</p>
              <p className={s.offerCardNote}>**Offer terms: <span className={s.confirm}>add terms</span></p>
              <button className={`${s.gold} ${s.priceCardBtn}`} onClick={() => openModal('planDetails')}>Get payment plan details</button>
            </aside>
          </div>
        </div>
      </section>

      <section className={s.offerBand} aria-label="Current offer">
        <div className={`${s.shell} ${s.offerBandInner}`}>
          <div className={s.copy}>
            <h2 className={`${s.heading} ${s.darkHeading}`}>Lock this month’s price</h2>
            <p className={s.offerBandText} style={{color:'#fff'}}>Prices are revised periodically <span className={s.confirm}>confirm</span>. Visit the site this month to book at the current rate.</p>
            <ul className={s.checkList}>
              <li>✓ 10:24 payment plan</li>
              <li>✓ UP RERA registered</li>
              <li>✓ Developer since 1985</li>
            </ul>
          </div>
          <button className={`${s.gold} ${s.offerBandBtn}`} onClick={() => openModal('visit')}>Book a free site visit</button>
        </div>
      </section>
    </>
  );
}
