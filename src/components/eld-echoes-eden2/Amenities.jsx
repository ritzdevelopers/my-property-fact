'use client';

import {
  MdStorefront,
  MdPark,
  MdSportsTennis,
  MdStadium,
  MdForest,
  MdChildCare,
  MdVideocam,
  MdFitnessCenter,
  MdElectricalServices,
  MdEventSeat,
  MdNature,
} from 'react-icons/md';
import s from './Eden.module.css';

const amenities = [
  { title: 'Convenience Retail', Icon: MdStorefront },
  { title: 'Landscape Hangout Area', Icon: MdPark },
  { title: 'Multipurpose Court', Icon: MdSportsTennis },
  { title: 'Amphitheatre', Icon: MdStadium },
  { title: 'Peripheral Greens', Icon: MdForest },
  { title: 'Palm Tree Avenue', Icon: MdNature },
  { title: 'Kids Swing Area', Icon: MdChildCare },
  { title: 'CCTV Security', Icon: MdVideocam },
  { title: 'Open Gym', Icon: MdFitnessCenter },
  { title: 'Power Backup', Icon: MdElectricalServices },
  { title: 'School Bus Waiting Area', Icon: MdEventSeat },
];

export default function Amenities({ openModal }) {
  return (
    <section id="amenities" className={s.light}>
      <div className={`${s.shell} ${s.sectionPad}`}>
        <div className={s.sectionHead}>
          <div className={s.amenIntro}>
            <h2 className={`${s.heading} ${s.amenTitle}`}>More than 50 amenities, planned for everyday life</h2>
            <p className={s.amenLead}>
              Three acres of central greens, spaces for fitness and play, and the essentials that keep daily life running.
            </p>
          </div>
          <button className={`${s.gold} ${s.sectionBtn}`} onClick={() => openModal('amen')}>
            Get the full amenities list
          </button>
        </div>

        <ul className={s.amenIconGrid}>
          {amenities.map(({ title, Icon }) => (
            <li className={s.amenIconItem} key={title}>
              <Icon className={s.amenGlyph} aria-hidden="true" />
              <span>{title}</span>
            </li>
          ))}
        </ul>
        <p className={s.amenNote}>Showing selected amenities. The brochure lists all 50+.</p>
      </div>
    </section>
  );
}
