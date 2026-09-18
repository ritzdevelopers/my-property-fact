import {
  MdSpeed,
  MdWbSunny,
  MdPark,
  MdApartment,
  MdFitnessCenter,
  MdBusiness,
} from 'react-icons/md';
import s from './Eden.module.css';

const highlights = [
  { Icon: MdSpeed, title: 'Two minutes to the expressway', text: 'Direct access to the Yamuna Expressway corridor, one of the region’s fastest-growing stretches.' },
  { Icon: MdWbSunny, title: 'Daylight in every home', text: 'Each 3 BHK is oriented for daylight and cross-ventilation through the day.' },
  { Icon: MdPark, title: 'Views over the green', text: 'Podium-level towers face the 3-acre central green rather than the next block.' },
  { Icon: MdApartment, title: 'Low tower density', text: 'Fewer towers on 5 acres leave 80% of the site as open space.' },
  { Icon: MdFitnessCenter, title: 'Amenities for daily use', text: 'More than 50 amenities planned around everyday routines, from the open gym to the amphitheatre.' },
  { Icon: MdBusiness, title: 'Built by Eldeco', text: 'A North Indian developer delivering projects since 1985, across 20 cities.' },
];

export function KeyFacts() {
  const facts = [
    ['Configuration', '3 BHK homes'],
    ['Sizes', '1550 and 1850 sq ft'],
    ['Starting price', '₹1.99 Cr*'],
    ['Land and open space', '5 acres, 80% open'],
    ['Possession', <span className={s.confirm}>date</span>],
    ['Towers and homes', <span className={s.confirm}>count</span>],
  ];
  return (
    <section aria-label="Key facts" className={s.factsWrap}>
      <div className={s.shell}>
        <dl className={s.facts}>
          {facts.map(([a, b]) => (
            <div key={a}>
              <dt>{a}</dt>
              <dd>{b}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function Overview({ openModal }) {
  return (
    <>
      <section id="overview" className={s.light}>
        <div className={`${s.shell} ${s.overviewGrid}`}>
          <div className={s.copy}>
            <h2 className={s.heading}>A green, low-density address in Sector 22D</h2>
            <p>Eldeco Echoes of Eden, located in Sector 22D, Yamuna Expressway, Greater Noida, offers premium 3 BHK VRV air-conditioned homes designed for modern and comfortable living. Starting at ₹1.99 Cr*, these luxury residences combine elegant design, green surroundings and strategic connectivity to the Yamuna Expressway.</p>
            <p>With the attractive Pay 10% Now and Nothing for 24 Months scheme, homebuyers can explore a flexible payment option. Eldeco Echoes of Eden is an ideal choice for those looking for luxury 3 BHK flats in Greater Noida, premium apartments on Yamuna Expressway, residential property in Sector 22D, and a well-connected home in Greater Noida.</p>
            <div className={s.actions}>
              <button className={`${s.gold} ${s.sectionBtn}`} onClick={() => openModal('visit')}>Book a free site visit</button>
              <button className={`${s.outline} ${s.sectionBtn}`} onClick={() => openModal('brochure')}>Download brochure</button>
            </div>
          </div>
          <figure className={s.overviewFigure}>
            <img
              className={s.overviewImage}
              src="/echoes-eden/hero-bg.webp"
              alt="Towers of Eldeco Echoes of Eden, artist’s impression"
              width={640}
              height={460}
            />
            <figcaption className={s.overviewCaption}>Towers of Eldeco Echoes of Eden, artist’s impression.</figcaption>
          </figure>
        </div>
      </section>
      <section id="highlights" className={s.dark}>
        <div className={`${s.shell} ${s.sectionPad}`}>
          <div className={s.sectionHead}>
            <h2 className={`${s.heading} ${s.darkHeading} ${s.highlightTitle}`}>Why buyers shortlist Echoes of Eden</h2>
            <button className={`${s.gold} ${s.sectionBtn}`} onClick={() => openModal('brochure')}>Download brochure</button>
          </div>
          <div className={s.highlightGrid}>
            {highlights.map(({ Icon, title, text }) => (
              <div className={s.highlight} key={title}>
                <span className={s.highlightIcon} aria-hidden="true">
                  <Icon />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
