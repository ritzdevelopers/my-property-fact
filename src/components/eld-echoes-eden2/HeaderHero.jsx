'use client';

import { useEffect, useState } from 'react';
import s from './Eden.module.css';
import {
  goToEchoesEdenThankYou,
  submitEchoesEdenLead,
} from './echoesEdenLeadSubmit';

const options = ['3 BHK, 1550 sq ft', '3 BHK, 1850 sq ft', 'Not sure yet'];

const navLinks = [
  ['#overview', 'Overview'],
  ['#price', 'Price'],
  ['#amenities', 'Amenities'],
  ['#plans', 'Floor plans'],
  ['#gallery', 'Gallery'],
  ['#location', 'Location'],
  ['#faqs', 'FAQs'],
];

export function Header({ openModal }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={s.header}>
      <div className={`${s.shell} ${s.headerInner}`}>
        <a className={s.brand} href="#home" onClick={closeMenu}>
          <img
            className={s.brandLogo}
            src="/echoes-eden/elde-logo.png"
            alt="Echoes of Eden by Eldeco"
            width={160}
            height={48}
            title="Echoes of Eden by Eldeco"
          />
        </a>
        <nav className={s.nav} aria-label="Page sections">
          {navLinks.map(([href, label]) => (
            <a key={href} href={href}>{label}</a>
          ))}
        </nav>
        <div className={s.headerCta}>
          <button
            className={s.gold}
            onClick={() => openModal('enquire')}
            style={{ height: 46, padding: '0 22px', fontSize: 15 }}
          >
            Enquire now
          </button>
          <button
            type="button"
            className={`${s.menuToggle} ${menuOpen ? s.menuToggleOpen : ''}`}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      <div
        className={`${s.menuBackdrop} ${menuOpen ? s.menuBackdropOpen : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      />
      <aside
        id="mobile-nav"
        className={`${s.menuDrawer} ${menuOpen ? s.menuDrawerOpen : ''}`}
        aria-hidden={!menuOpen}
      >
        <div className={s.menuDrawerHead}>
          <span className={s.brandTitle}>Menu</span>
          <button type="button" className={s.menuClose} onClick={closeMenu} aria-label="Close menu">×</button>
        </div>
        <nav className={s.menuNav} aria-label="Mobile sections">
          {navLinks.map(([href, label]) => (
            <a key={href} href={href} onClick={closeMenu}>{label}</a>
          ))}
        </nav>
        <button
          className={s.gold}
          onClick={() => { closeMenu(); openModal('enquire'); }}
          style={{ height: 52, width: '100%', fontSize: 16 }}
        >
          Enquire now
        </button>
      </aside>
    </header>
  );
}

export function LeadForm({ compact = false, onComplete }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', cfg: '', consent: true });
  const [tried, setTried] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const validName = form.name.replace(/[^A-Za-z]/g, '').length >= 2;
  const validPhone = /^[6-9][0-9]{9}$/.test(form.phone);
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());

  const submit = async () => {
    setTried(true);
    setSubmitError('');
    if (!(validName && validPhone && validEmail && form.cfg && form.consent)) return;

    setSubmitting(true);
    try {
      await submitEchoesEdenLead({
        name: form.name,
        email: form.email,
        phone: form.phone,
        homeType: form.cfg,
      });
      sessionStorage.setItem('userFilled', 'true');
      onComplete?.();
      goToEchoesEdenThankYou();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className={s.form}>
      <div className={s.field}>
        <label htmlFor={compact ? 'sheet-name' : 'hero-name'}>Full name</label>
        <input className={s.input} id={compact ? 'sheet-name' : 'hero-name'} autoComplete="name" placeholder="e.g. Rahul Sharma" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} disabled={submitting} />
        {tried && !validName && <span className={s.error}>Enter your name so the advisor knows who to ask for.</span>}
      </div>
      <div className={s.field}>
        <label htmlFor={compact ? 'sheet-phone' : 'hero-phone'}>Mobile number</label>
        <div className={s.phoneField}><span className={s.prefix}>+91</span>
          <input className={s.input} id={compact ? 'sheet-phone' : 'hero-phone'} type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="10-digit mobile number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} disabled={submitting} />
        </div>
        {tried && !validPhone && <span className={s.error}>Enter a 10-digit mobile number starting with 6, 7, 8 or 9.</span>}
      </div>
      <div className={s.field}>
        <label htmlFor={compact ? 'sheet-email' : 'hero-email'}>Email address</label>
        <input
          className={s.input}
          id={compact ? 'sheet-email' : 'hero-email'}
          type="email"
          autoComplete="email"
          placeholder="e.g. rahul@email.com"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          disabled={submitting}
        />
        {tried && !validEmail && <span className={s.error}>Enter a valid email address so we can send details.</span>}
      </div>
      <fieldset className={s.fieldset}><legend className={s.legend}>Which home are you looking for?</legend>
        <div className={s.chips}>{options.map(o => <button key={o} type="button" aria-pressed={form.cfg === o} onClick={() => setForm({ ...form, cfg: o })} className={`${s.chip} ${form.cfg === o ? s.chipActive : ''}`} disabled={submitting}>{o}</button>)}</div>
        {tried && !form.cfg && <span className={s.error}>Pick an option, or choose “Not sure yet”.</span>}
      </fieldset>
      <label className={s.consent}><input type="checkbox" checked={form.consent} onChange={e => setForm({ ...form, consent: e.target.checked })} disabled={submitting} /><span>I authorise company representatives to call, SMS, email or WhatsApp me about its products and offers. This consent overrides any registration for DNC/NDNC. <a href="#disclaimer">Privacy policy</a></span></label>
      {tried && !form.consent && <span className={s.error}>Tick the consent box so we can call you back.</span>}
      {submitError && <span className={s.error}>{submitError}</span>}
      <button className={s.gold} type="button" onClick={submit} disabled={submitting} style={{ height: 54, fontSize: 16 }}>
        {submitting ? 'Submitting…' : 'Get instant callback'}
      </button>
      <div className={s.proof}><span>✓ Callback in <span className={s.confirm}>10</span> min</span><span>✓ RERA registered</span><span>✓ No spam</span></div>
    </div>
  );
}

export function Hero({ openModal, unlockPlan }) {
  return (
    <section id="home" className={s.hero}>
      <div className={s.heroBg} aria-hidden="true" />
      <div className={`${s.shell} ${s.heroGrid}`}>
        <div className={s.heroCopy}>
          <div className={s.location}>⌖ <span>Sector 22D, Yamuna Expressway, Greater Noida</span></div>
          <h1 className={s.heroTitle}>Eldeco Echoes of Eden: premium 3 BHK homes on the Yamuna Expressway</h1>
          <p className={s.heroText}>Five acres planned around a 3-acre central green, with 80% of the land left open.</p>
          <div className={s.offerBadge}>
            <span className={s.offerNumber}>10:24</span>
            <span><strong>Pay 10% now,</strong><br />nothing more for 24 months**</span>
          </div>
          <div className={s.heroActions}>
            <div className={s.heroPrice}>
              <span className={s.priceLabel}>Starting price</span>
              <span className={s.price}>₹1.99 Cr*</span>
            </div>
            <button className={`${s.gold} ${s.heroBtn}`} onClick={() => openModal('price')}>Get price sheet</button>
            <button className={`${s.ghost} ${s.heroBtn}`} onClick={() => openModal('brochure')}>↓ Download brochure</button>
          </div>
          <div className={s.heroTrust}>
            <span>✓ UP RERA: UPRERAPRJ125342/02/2026</span>
            <span>◉ Eldeco, building since 1985</span>
          </div>
        </div>
        <div className={s.formCard}>
          <h2 className={s.formTitle}>Get the price sheet and offer details</h2>
          <p className={s.formSub}>Share your number and an advisor will call you back.</p>
          <LeadForm onComplete={unlockPlan} />
        </div>
      </div>
    </section>
  );
}
