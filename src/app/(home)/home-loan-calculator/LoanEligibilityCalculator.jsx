"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { Manrope, Plus_Jakarta_Sans } from "next/font/google";
import { PiCalculatorLight } from "react-icons/pi";
import {
  HiOutlineArrowRight,
  HiOutlineBriefcase,
} from "react-icons/hi";
import styles from "./loan-eligibility.module.css";
import {
  TENURE_OPTIONS,
  RATE_OPTIONS,
  calculateEligibility,
  formatINR,
  formatPercent,
  validateInputs,
} from "./loanMath";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function setLecText(root, key, value) {
  const el = root.querySelector(`[data-lec-val="${key}"]`);
  if (el) el.textContent = value;
}

const STEPS = [
  {
    id: "01",
    title: "Enter Details",
    text: "Fill in your income, EMI, tenure and other details.",
    icon: "/static/home-loan-calculator/icon-step-details.svg",
  },
  {
    id: "02",
    title: "Calculate",
    text: "Click on the calculate button.",
    icon: "/static/home-loan-calculator/icon-step-calculate.svg",
  },
  {
    id: "03",
    title: "View Eligibility",
    text: "Get your estimated loan amount and EMI.",
    icon: "/static/home-loan-calculator/Vector (14).svg?v=eye",
  },
  {
    id: "04",
    title: "Apply for Loan",
    text: "Choose your preferred project and apply online.",
    icon: "/static/home-loan-calculator/icon-step-apply.svg",
  },
];

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
});

const FIELD_ICONS = {
  user: "/static/home-loan-calculator/icon-user.svg",
  calendar: "/static/home-loan-calculator/icon-calendar.svg",
  home: "/static/home-loan-calculator/icon-home.svg",
  rupee: "/static/home-loan-calculator/icon-rupee.svg",
  info: "/static/home-loan-calculator/icon-info.svg",
  wallet: "/static/home-loan-calculator/icon-wallet.svg",
  percent: "/static/home-loan-calculator/icon-percent.svg",
  resultCalendar: "/static/home-loan-calculator/icon-result-calendar.svg",
  lock: "/static/home-loan-calculator/icon-lock.svg",
  link: "/static/home-loan-calculator/icon-link.svg",
};

function FieldIcon({ name, onDark = false }) {
  return (
    <img
      src={FIELD_ICONS[name]}
      alt=""
      width={18}
      height={18}
      className={onDark ? styles.fieldIconOnDark : styles.fieldIcon}
      aria-hidden="true"
    />
  );
}

function SelectChevron() {
  return (
    <svg
      className={styles.selectChevron}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4 6.2L8 10.2L12 6.2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CustomSelect({
  id,
  value,
  options,
  onChange,
  icon,
  open,
  onOpenChange,
}) {
  const rootRef = useRef(null);
  const selected = options.find((option) => String(option.value) === String(value)) || options[0];

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) onOpenChange(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") onOpenChange(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onOpenChange]);

  return (
    <div
      ref={rootRef}
      className={`${styles.selectWrap}${open ? ` ${styles.selectOpen}` : ""}`}
    >
      <button
        type="button"
        id={id}
        className={styles.selectTrigger}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
      >
        {icon}
        <span className={styles.selectValue}>{selected?.label}</span>
        <SelectChevron />
      </button>
      {open ? (
        <ul className={styles.selectMenu} role="listbox" aria-labelledby={id}>
          {options.map((option) => {
            const active = String(option.value) === String(value);
            return (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`${styles.selectOption}${active ? ` ${styles.selectOptionActive}` : ""}`}
                  onClick={() => {
                    onChange(String(option.value));
                    onOpenChange(false);
                  }}
                >
                  <span>{option.label}</span>
                  {active ? <span className={styles.selectTick} aria-hidden="true" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

const DONUT_RADIUS = 46;
const DONUT_CIRC = 2 * Math.PI * DONUT_RADIUS;

const EMPTY_RESULT = {
  eligibleAmount: 0,
  monthlyEmi: 0,
  interestRate: 8.5,
  tenureYears: 20,
  requestedTenure: 20,
  tenureCapped: false,
  totalInterest: 0,
  totalPayable: 0,
  principalPercent: 0,
  interestPercent: 100,
  notEligible: false,
};

export default function LoanEligibilityCalculator() {
  const [form, setForm] = useState({
    monthlyIncome: "",
    existingEmi: "",
    tenureYears: "20",
    interestRate: "8.5",
    employmentType: "salaried",
    age: "",
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [hasCalculated, setHasCalculated] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [openSelect, setOpenSelect] = useState(null);

  const resultCardRef = useRef(null);
  const donutRef = useRef(null);
  const donutArcRef = useRef(null);
  const howSectionRef = useRef(null);
  const calcTimerRef = useRef(null);
  const calcIdRef = useRef(0);
  const skipLiveRef = useRef(false);
  const liveUpdateRef = useRef(false);
  const lastValuesRef = useRef({
    eligible: 0,
    emi: 0,
    rate: 0,
    tenure: 0,
    interest: 0,
    total: 0,
    principal: 0,
  });

  const display = result || EMPTY_RESULT;
  const principalPct = Math.max(0, Math.min(100, Math.round(display.principalPercent)));
  const interestPct = Math.max(0, 100 - principalPct);
  const donutDash = `${(principalPct / 100) * DONUT_CIRC} ${DONUT_CIRC}`;

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const message = validateInputs(form);
    if (message) {
      setError(message);
      setHasCalculated(false);
      setResult(null);
      setIsCalculating(false);
      setIsRevealing(false);
      return;
    }

    const next = calculateEligibility(form);
    const id = ++calcIdRef.current;
    const reduce = prefersReducedMotion();

    if (calcTimerRef.current) window.clearTimeout(calcTimerRef.current);
    skipLiveRef.current = true;
    liveUpdateRef.current = false;
    setError("");
    setIsCalculating(true);
    setIsRevealing(true);

    if (resultCardRef.current && window.matchMedia("(max-width: 767px)").matches) {
      resultCardRef.current.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "center",
      });
    }

    calcTimerRef.current = window.setTimeout(() => {
      if (calcIdRef.current !== id) return;
      setResult(next);
      setHasCalculated(true);
      setIsCalculating(false);
      setAnimKey((key) => key + 1);
    }, reduce ? 0 : 720);
  };

  useLayoutEffect(() => {
    return () => {
      if (calcTimerRef.current) window.clearTimeout(calcTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!hasCalculated) return;
    if (skipLiveRef.current) {
      skipLiveRef.current = false;
      return;
    }

    const message = validateInputs(form);
    if (message) {
      setError(message);
      return;
    }

    const timer = window.setTimeout(() => {
      liveUpdateRef.current = true;
      setError("");
      setResult(calculateEligibility(form));
      setAnimKey((key) => key + 1);
    }, 280);

    return () => window.clearTimeout(timer);
  }, [form, hasCalculated]);

  useLayoutEffect(() => {
    const root = resultCardRef.current;
    if (!root || !hasCalculated || !result || animKey === 0) return;

    const fromZero = !liveUpdateRef.current;
    liveUpdateRef.current = false;
    const reduce = prefersReducedMotion();
    const principalLen = result.notEligible ? 0 : (principalPct / 100) * DONUT_CIRC;
    const eligibleLabel =
      result.notEligible ? "₹ —" : formatINR(result.eligibleAmount);

    const applyFinalValues = () => {
      setLecText(root, "eligible", eligibleLabel);
      setLecText(root, "emi", formatINR(result.monthlyEmi));
      setLecText(root, "rate", `${formatPercent(result.interestRate)} p.a.`);
      setLecText(root, "tenure", `${result.tenureYears} Years`);
      setLecText(root, "interest", formatINR(result.totalInterest));
      setLecText(root, "total", formatINR(result.totalPayable));
      setLecText(root, "donutPct", `${principalPct}%`);
      setLecText(
        root,
        "legendPrincipal",
        `${formatINR(result.eligibleAmount)} (${principalPct}%)`,
      );
      setLecText(
        root,
        "legendInterest",
        `${formatINR(result.totalInterest)} (${interestPct}%)`,
      );
      if (donutArcRef.current) {
        donutArcRef.current.setAttribute(
          "stroke-dasharray",
          `${principalLen} ${DONUT_CIRC}`,
        );
      }
      lastValuesRef.current = {
        eligible: result.notEligible ? 0 : result.eligibleAmount,
        emi: result.monthlyEmi,
        rate: result.interestRate,
        tenure: result.tenureYears,
        interest: result.totalInterest,
        total: result.totalPayable,
        principal: principalPct,
      };
    };

    if (reduce) {
      applyFinalValues();
      setIsRevealing(false);
      return undefined;
    }

    const proxy = fromZero
      ? {
          eligible: 0,
          emi: 0,
          rate: 0,
          tenure: 0,
          interest: 0,
          total: 0,
          principal: 0,
        }
      : { ...lastValuesRef.current };

    const rows = root.querySelectorAll("[data-lec-row]");
    const legends = root.querySelectorAll("[data-lec-legend]");
    const note = root.querySelector("[data-lec-note]");
    const amount = root.querySelector("[data-lec-val='eligible']");

    const writeFrame = () => {
      const principalNow = Math.round(proxy.principal);
      setLecText(
        root,
        "eligible",
        result.notEligible ? "₹ —" : formatINR(proxy.eligible),
      );
      setLecText(root, "emi", formatINR(proxy.emi));
      setLecText(root, "rate", `${formatPercent(proxy.rate)} p.a.`);
      setLecText(root, "tenure", `${Math.round(proxy.tenure)} Years`);
      setLecText(root, "interest", formatINR(proxy.interest));
      setLecText(root, "total", formatINR(proxy.total));
      setLecText(root, "donutPct", `${principalNow}%`);
      setLecText(
        root,
        "legendPrincipal",
        `${formatINR(result.notEligible ? 0 : proxy.eligible)} (${principalNow}%)`,
      );
      setLecText(
        root,
        "legendInterest",
        `${formatINR(proxy.interest)} (${Math.max(0, 100 - principalNow)}%)`,
      );
      if (donutArcRef.current) {
        const len = (proxy.principal / 100) * DONUT_CIRC;
        donutArcRef.current.setAttribute("stroke-dasharray", `${len} ${DONUT_CIRC}`);
      }
    };

    const ctx = gsap.context(() => {
      writeFrame();

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        onComplete: () => {
          applyFinalValues();
          setIsRevealing(false);
        },
      });

      if (fromZero) {
        tl.from(
          amount,
          { y: 14, autoAlpha: 0, duration: 0.45, ease: "power3.out" },
          0,
        );
        if (note) {
          tl.from(note, { y: 8, autoAlpha: 0, duration: 0.4 }, 0.08);
        }
        if (rows.length) {
          tl.from(
            rows,
            { y: 12, autoAlpha: 0, duration: 0.38, stagger: 0.07 },
            0.16,
          );
        }
        if (donutRef.current) {
          tl.from(
            donutRef.current,
            { scale: 0.84, duration: 0.55, ease: "back.out(1.4)" },
            0.28,
          );
        }
        if (legends.length) {
          tl.from(
            legends,
            { x: 10, autoAlpha: 0, duration: 0.4, stagger: 0.08 },
            0.36,
          );
        }
      }

      tl.to(
        proxy,
        {
          eligible: result.notEligible ? 0 : result.eligibleAmount,
          emi: result.monthlyEmi,
          rate: result.interestRate,
          tenure: result.tenureYears,
          interest: result.totalInterest,
          total: result.totalPayable,
          principal: principalPct,
          duration: fromZero ? 1.15 : 0.8,
          ease: "power2.out",
          onUpdate: writeFrame,
        },
        0,
      );
    }, root);

    return () => {
      ctx.revert();
      applyFinalValues();
    };
  }, [animKey, hasCalculated, result, principalPct, interestPct]);

  useLayoutEffect(() => {
    const root = howSectionRef.current;
    if (!root) return;

    const mm = gsap.matchMedia();
    mm.add(
      {
        reduceMotion: "(prefers-reduced-motion: reduce)",
        hideChevrons: "(min-width: 768px) and (max-width: 1023px) and (min-height: 541px)",
      },
      (context) => {
        const { reduceMotion, hideChevrons } = context.conditions;
        if (reduceMotion || hideChevrons) return;

        const chevrons = root.querySelectorAll("[data-lec-chevron]");
        if (!chevrons.length) return;

        const tl = gsap.timeline({
          repeat: -1,
          repeatDelay: 0.35,
          defaults: { ease: "power1.inOut" },
        });

        chevrons.forEach((chevron, index) => {
          tl.fromTo(
            chevron,
            { x: 0, autoAlpha: 0.4 },
            { x: 7, autoAlpha: 1, duration: 0.42, yoyo: true, repeat: 1 },
            index * 0.22,
          );
        });
      },
      root,
    );

    return () => mm.revert();
  }, []);

  return (
    <div className={styles.page} data-lec-page="">
      <section className={styles.hero} aria-labelledby="loan-eligibility-heading">
        <img
          src="/static/home-loan-calculator-banner.jpg"
          alt=""
          className={styles.heroImage}
          width={1024}
          height={326}
          aria-hidden="true"
          fetchPriority="high"
        />
        <div className={styles.heroOverlay} aria-hidden="true" />
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <nav className={styles.breadcrumb} aria-label="Breadcrumb">
              <Link href="/" title="Home">
                Home
              </Link>
              <span aria-hidden="true"> &gt; </span>
              <span>Loan Eligibility Calculator</span>
            </nav>
            <h1
              id="loan-eligibility-heading"
              className={`${styles.heroTitle} ${plusJakarta.className}`}
            >
              Loan Eligibility <span>Calculator</span>
            </h1>
            <p className={`${styles.heroSubtitle} ${manrope.className}`}>
              Find out how much loan you may be eligible for based on your income
              and financial profile.
            </p>
          </div>

          <aside className={`${styles.smartCard} ${manrope.className}`}>
            <div className={styles.smartCardHead}>
              <span className={styles.smartCardIcon} aria-hidden="true">
                <img
                  src="/static/home-loan-calculator/icon-smart-calculator.svg"
                  alt=""
                  width={22}
                  height={27}
                />
              </span>
              <div className={styles.smartCardCopy}>
                <h2 className={plusJakarta.className}>Smart Calculator</h2>
                <p>Estimate your purchasing power instantly</p>
              </div>
            </div>
            <div className={styles.smartCardDivider} aria-hidden="true" />
            <div className={styles.smartCardStats}>
              <div>
                <strong>Instant Approval</strong>
                <span>Verified Rates</span>
              </div>
              <div>
                <strong>8.5% p.a.</strong>
                <span>Verified Rates</span>
              </div>
              <div>
                <strong>Up to 30 Yrs</strong>
                <span>Verified Rates</span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className={styles.calculatorSection} aria-label="Loan eligibility form">
        <div className={styles.calculatorGrid}>
          <form
            className={`${styles.formCard} ${manrope.className}`}
            onSubmit={handleSubmit}
            noValidate
          >
            <div className={styles.formHeader}>
              <h2 className={plusJakarta.className}>
                Calculate Your Loan Eligibility
              </h2>
              <p className={styles.formLead}>
                Enter your details below to know how much loan you may be eligible for.
              </p>
            </div>

            <label className={styles.field}>
              <span>Monthly Income (₹)</span>
              <span className={styles.inputBox}>
                <FieldIcon name="rupee" />
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="100000000"
                  placeholder="Enter your monthly income"
                  value={form.monthlyIncome}
                  onChange={(e) => updateField("monthlyIncome", e.target.value)}
                />
              </span>
            </label>

            <label className={styles.field}>
              <span>Existing Monthly EMI (₹)</span>
              <span className={styles.inputBox}>
                <FieldIcon name="rupee" />
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="100000000"
                  placeholder="Enter existing EMI (if any)"
                  value={form.existingEmi}
                  onChange={(e) => updateField("existingEmi", e.target.value)}
                />
              </span>
            </label>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <span id="lec-tenure-label">Loan Tenure (Years)</span>
                <CustomSelect
                  id="lec-tenure"
                  value={form.tenureYears}
                  open={openSelect === "tenure"}
                  onOpenChange={(next) => setOpenSelect(next ? "tenure" : null)}
                  onChange={(value) => updateField("tenureYears", value)}
                  icon={<FieldIcon name="calendar" />}
                  options={TENURE_OPTIONS.map((years) => ({
                    value: String(years),
                    label: `${years} Years`,
                  }))}
                />
              </div>

              <div className={styles.field}>
                <span id="lec-rate-label">Interest Rate (% p.a.)</span>
                <CustomSelect
                  id="lec-rate"
                  value={form.interestRate}
                  open={openSelect === "rate"}
                  onOpenChange={(next) => setOpenSelect(next ? "rate" : null)}
                  onChange={(value) => updateField("interestRate", value)}
                  icon={<FieldIcon name="percent" />}
                  options={RATE_OPTIONS.map((rate) => ({
                    value: String(rate),
                    label: `${formatPercent(rate)} p.a.`,
                  }))}
                />
              </div>
            </div>

            <fieldset className={styles.employmentField}>
              <legend>Employment Type</legend>
              <div className={styles.employmentToggle} role="group">
                <button
                  type="button"
                  className={form.employmentType === "salaried" ? styles.empActive : ""}
                  onClick={() => updateField("employmentType", "salaried")}
                >
                  <HiOutlineBriefcase aria-hidden="true" />
                  Salaried
                </button>
                <button
                  type="button"
                  className={form.employmentType === "self-employed" ? styles.empActive : ""}
                  onClick={() => updateField("employmentType", "self-employed")}
                >
                  <FieldIcon
                    name="home"
                    onDark={form.employmentType === "self-employed"}
                  />
                  Self Employed
                </button>
              </div>
            </fieldset>

            <label className={styles.field}>
              <span>Age (Years)</span>
              <span className={`${styles.inputBox} ${styles.inputWithIcon}`}>
                <FieldIcon name="user" />
                <input
                  type="number"
                  inputMode="numeric"
                  min="18"
                  max="70"
                  placeholder="Enter your age"
                  value={form.age}
                  onChange={(e) => updateField("age", e.target.value)}
                />
              </span>
            </label>

            {error ? <p className={styles.formError}>{error}</p> : null}

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isCalculating}
              aria-busy={isCalculating}
            >
              {isCalculating ? (
                <>
                  <span className={styles.btnSpinner} aria-hidden="true" />
                  Calculating...
                </>
              ) : (
                <>
                  <PiCalculatorLight aria-hidden="true" />
                  Calculate Eligibility
                  <HiOutlineArrowRight aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <div
            ref={resultCardRef}
            className={`${styles.resultCard} ${manrope.className}${
              isCalculating ? ` ${styles.resultCardCalculating}` : ""
            }`}
            aria-busy={isCalculating || isRevealing}
            aria-live={isCalculating || isRevealing ? "off" : "polite"}
          >
            <div className={styles.resultHero}>
              <p className={styles.resultKicker}>You may be eligible for</p>
              <p
                className={`${styles.resultAmount} ${plusJakarta.className}`}
                data-lec-val="eligible"
              >
                {hasCalculated && !display.notEligible
                  ? formatINR(display.eligibleAmount)
                  : "₹ —"}
              </p>
            </div>

            <div className={styles.resultNote} data-lec-note="">
              <img
                src={FIELD_ICONS.info}
                alt=""
                width={24}
                height={24}
                className={styles.resultNoteIcon}
                aria-hidden="true"
              />
              <span>
                {isCalculating
                  ? "Crunching your numbers to estimate eligibility…"
                  : display.notEligible
                    ? "Based on your current obligations, an additional loan may not be available."
                    : hasCalculated
                      ? display.tenureCapped
                        ? `Estimate based on your details. Tenure is capped at ${display.tenureYears} years for retirement age.`
                        : "Your estimated loan amount is based on your provided details."
                      : "Enter your details and tap Calculate Eligibility to see your estimate."}
              </span>
            </div>

            <ul className={styles.breakdown}>
              <li data-lec-row="">
                <span>
                  <FieldIcon name="wallet" />
                  Estimated Monthly EMI
                </span>
                <strong data-lec-val="emi">
                  {hasCalculated ? formatINR(display.monthlyEmi) : "₹ —"}
                </strong>
              </li>
              <li data-lec-row="">
                <span>
                  <FieldIcon name="percent" />
                  Interest Rate
                </span>
                <strong data-lec-val="rate">
                  {hasCalculated ? `${formatPercent(display.interestRate)} p.a.` : "—"}
                </strong>
              </li>
              <li data-lec-row="">
                <span>
                  <FieldIcon name="resultCalendar" />
                  Loan Tenure
                </span>
                <strong data-lec-val="tenure">
                  {hasCalculated ? `${display.tenureYears} Years` : "—"}
                </strong>
              </li>
              <li data-lec-row="">
                <span>
                  <FieldIcon name="lock" />
                  Total Interest Payable
                </span>
                <strong data-lec-val="interest">
                  {hasCalculated ? formatINR(display.totalInterest) : "₹ —"}
                </strong>
              </li>
              <li data-lec-row="">
                <span>
                  <FieldIcon name="link" />
                  Total Amount Payable
                </span>
                <strong data-lec-val="total">
                  {hasCalculated ? formatINR(display.totalPayable) : "₹ —"}
                </strong>
              </li>
            </ul>

            <div className={styles.chartBlock}>
              <h3>EMI Breakdown</h3>
              <div className={styles.chartRow}>
                <div ref={donutRef} className={styles.donut} aria-hidden="true">
                  <svg viewBox="0 0 120 120" className={styles.donutSvg}>
                    <circle
                      className={styles.donutTrack}
                      cx="60"
                      cy="60"
                      r={DONUT_RADIUS}
                    />
                    <circle
                      ref={donutArcRef}
                      className={styles.donutArc}
                      cx="60"
                      cy="60"
                      r={DONUT_RADIUS}
                      transform="rotate(-90 60 60)"
                      strokeDasharray={hasCalculated ? donutDash : `0 ${DONUT_CIRC}`}
                    />
                  </svg>
                  <div className={styles.donutHole}>
                    <strong data-lec-val="donutPct">
                      {hasCalculated ? `${principalPct}%` : "—"}
                    </strong>
                    <em>Principal</em>
                  </div>
                </div>
                <ul className={styles.legend}>
                  <li data-lec-legend="">
                    <i className={styles.legendPrincipal} aria-hidden="true" />
                    <div>
                      <strong>Principal Amount</strong>
                      <span data-lec-val="legendPrincipal">
                        {hasCalculated
                          ? `${formatINR(display.eligibleAmount)} (${principalPct}%)`
                          : "₹ —"}
                      </span>
                    </div>
                  </li>
                  <li data-lec-legend="">
                    <i className={styles.legendInterest} aria-hidden="true" />
                    <div>
                      <strong>Interest Amount</strong>
                      <span data-lec-val="legendInterest">
                        {hasCalculated
                          ? `${formatINR(display.totalInterest)} (${interestPct}%)`
                          : "₹ —"}
                      </span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        ref={howSectionRef}
        className={`${styles.howSection} ${manrope.className}`}
        aria-labelledby="how-it-works-heading"
      >
        <div className={styles.howInner}>
          <header className={styles.howHeader}>
            <h2 id="how-it-works-heading" className={plusJakarta.className}>
              How It Works
            </h2>
            <p>Get your loan eligibility in just a few simple steps.</p>
          </header>
          <ol className={styles.steps}>
            {STEPS.map((step, index) => (
              <li key={step.id} className={styles.step}>
                <div className={styles.stepVisual}>
                  <span className={styles.stepIcon}>
                    <img src={step.icon} alt="" width={24} height={24} aria-hidden="true" />
                  </span>
                  <span className={`${styles.stepNum} ${plusJakarta.className}`}>{step.id}</span>
                </div>
                <h3 className={plusJakarta.className}>{step.title}</h3>
                <p>{step.text}</p>
                {index < STEPS.length - 1 ? (
                  <span className={styles.stepChevron} aria-hidden="true">
                    <span className={styles.stepChevronIcon} data-lec-chevron="">
                      <img
                        src="/static/home-loan-calculator/icon-step-arrow.svg"
                        alt=""
                        width={7}
                        height={11}
                      />
                    </span>
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.ctaBanner} aria-labelledby="loan-cta-heading">
        <aside className={`${styles.disclaimer} ${manrope.className}`} role="note">
          <img
            src="/static/home-loan-calculator/icon-note.svg"
            alt=""
            width={21}
            height={21}
            aria-hidden="true"
          />
          <div className={styles.disclaimerCopy}>
            <strong className={plusJakarta.className}>Important Note</strong>
            <p>
              The eligibility amount shown is indicative and may vary based on
              your credit profile, income, existing obligations and applicable
              lending policies.
            </p>
          </div>
        </aside>
        <div className={styles.ctaInner}>
          <img
            src="/static/home-loan-calculator-cta.jpg"
            alt=""
            className={styles.ctaImage}
            width={1024}
            height={173}
            aria-hidden="true"
          />
          <div className={styles.ctaOverlay} aria-hidden="true" />
          <div className={styles.ctaCopy}>
            <h2 id="loan-cta-heading" className={plusJakarta.className}>
              Ready to get started?
            </h2>
            <p className={manrope.className}>
              Take the next step towards your dream home with MPF.
            </p>
          </div>
          <Link
            href="/contact-us"
            className={`${styles.ctaBtn} ${manrope.className}`}
            title="Apply for a Loan"
          >
            Apply for a Loan
            <HiOutlineArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
