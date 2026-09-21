"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  ArrowRight, BadgeCheck, Check, ChevronDown, ChevronLeft, ChevronRight, Gauge, Layers3,
  LockKeyhole, MapPin, Menu, Mountain, ShieldCheck,
  Sparkles, Sun, Users, Waves, X,
} from "lucide-react";
import type { IconType } from "react-icons";
import {
  FaAppleWhole, FaArchway, FaChair, FaChampagneGlasses, FaChildren, FaCloudRain,
  FaDumbbell, FaFireFlameCurved, FaLandmarkDome, FaPersonBiking, FaPersonCane,
  FaPersonRunning, FaPersonSkating, FaPersonWalking, FaOm, FaSeedling, FaTree,
  FaVideo,
} from "react-icons/fa6";
import { faqItems, project } from "@/eldeco-7-peak/lib/project-data";
import { validateLeadFields } from "@/lib/leadValidation";
import {
  goToSevenPeaksLpThankYou,
  submitSevenPeaksLpLead,
} from "./sevenPeaksLpLeadSubmit";
import { Autoplay, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";

declare global {
  interface Window { dataLayer?: Record<string, unknown>[]; fbq?: (...args: unknown[]) => void; }
}

type Intent = "price_sheet" | "four_bhk_price" | "cost_sheet" | "floor_plans" | "payment_plan" | "location_map" | "brochure" | "site_visit" | "amenities_brochure" | "call" | "whatsapp";

const intentTitles: Record<Intent, string> = {
  price_sheet: "Get the Eldeco 7 Peaks Price Sheet",
  four_bhk_price: "Check the Current 4 BHK Price",
  cost_sheet: "Get the Detailed Cost Sheet",
  floor_plans: "Unlock Eldeco 7 Peaks Floor Plans",
  payment_plan: "Get the Tata Capital Payment Plan",
  location_map: "Get the Eldeco Omicron 1A Location Map",
  brochure: "Download the Eldeco 7 Peaks Brochure",
  site_visit: "Book a Free Site Visit",
  amenities_brochure: "Download the Amenities Brochure",
  call: "Request a Call Back",
  whatsapp: "Continue on WhatsApp",
};

const highlights = [
  { icon: Layers3, title: "4 apartments per floor", text: "A lower-per-floor arrangement designed around more open sides." },
  { icon: Sun, title: "Three-side-open homes", text: "Residences planned for better openness, daylight and ventilation." },
  { icon: Mountain, title: "Wraparound balconies", text: "Extended outdoor edges that connect more rooms to open views." },
  { icon: Waves, title: "Four distinct pools", text: "Lap, tropical, heated and kids’ pool experiences with clearly distinct use." },
  { icon: Sparkles, title: "Daylit basement", text: "Twenty-eight cutouts are planned to bring natural light below." },
  { icon: Gauge, title: "Four lifts per tower", text: "Three passenger lifts and one service lift are planned for every tower." },
];

const featureAmenities: { icon: IconType; title: string }[] = [
  { icon: FaArchway, title: "Grand Entrance" },
  { icon: FaSeedling, title: "Courtyard Garden" },
  { icon: FaPersonWalking, title: "Reflexology Path" },
  { icon: FaAppleWhole, title: "Orchard Garden" },
  { icon: FaChildren, title: "Kid’s Play Area" },
  { icon: FaPersonSkating, title: "Skating Circuit" },
  { icon: FaPersonBiking, title: "Cycling Track" },
  { icon: FaLandmarkDome, title: "Pavilion Stage & Lawn" },
  { icon: FaPersonCane, title: "Senior Citizen Garden" },
  { icon: FaDumbbell, title: "Outdoor Gym" },
  { icon: FaPersonRunning, title: "Jogging Track" },
  { icon: FaTree, title: "Leisure Park" },
  { icon: FaChampagneGlasses, title: "Party Lawn" },
  { icon: FaOm, title: "Yoga & Meditation Zone" },
  { icon: FaFireFlameCurved, title: "Bonfire Pit" },
  { icon: FaVideo, title: "CCTV Security" },
  { icon: FaChair, title: "Outdoor Sitting Area" },
  { icon: FaCloudRain, title: "Rain Garden" },
];

const gallery = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 18, 19].map((n) => [
  `/eldeco-7-peak-new/gl${n}.webp`,
  `Eldeco 7 Peaks Residences gallery ${String(n).padStart(2, "0")}`,
] as const);

const USER_FILLED_KEY = "userFilled";
const FIRST_OPEN_MS = 15000;
const REPEAT_OPEN_MS = 20000;

function hasFilledForm() {
  return sessionStorage.getItem(USER_FILLED_KEY) === "true";
}

function track(event: string, data: Record<string, unknown> = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, project: "eldeco_7_peaks", ...data });
}

function ConfirmTag({ children = "TO BE CONFIRMED" }: { children?: ReactNode }) {
  return <mark className="inline rounded bg-amber-100 px-1.5 py-0.5 text-[.72em] font-bold text-amber-950">{children}</mark>;
}

function FallbackImage({ src, alt, className = "", priority = false }: { src: string; alt: string; className?: string; priority?: boolean }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`image-fallback overflow-hidden ${className}`} style={{ position: className.includes("absolute") ? "absolute" : "relative" }} role={failed ? "img" : undefined} aria-label={failed ? alt : undefined}>
      {!failed && <img src={src} alt={alt} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} width="1200" height="800" className="h-full w-full object-cover" onError={() => setFailed(true)} />}
      {failed && <span className="absolute inset-0 grid place-items-center p-5 text-center text-sm font-semibold text-white/80">{alt}</span>}
    </div>
  );
}

function SectionTitle({ eyebrow, title, summary, light = false }: { eyebrow: string; title: string; summary: string; light?: boolean }) {
  return (
    <div className="max-w-3xl">
      <p className={light ? "text-xs font-bold uppercase tracking-[.18em] text-[#d9b29d]" : "eyebrow"}>{eyebrow}</p>
      <h2 className={`mt-3 font-serif text-4xl font-bold leading-tight sm:text-5xl  ${light ? "text-white" : "text-[#15382f]"}`}>{title}</h2>
      <p className={`mt-5 max-w-2xl text-base leading-7 sm:text-lg ${light ? "text-white/72" : "text-[#566a63]"}`}>{summary}</p>
    </div>
  );
}

function PrimaryButton({ children, onClick, className = "" }: { children: ReactNode; onClick: () => void; className?: string }) {
  return <button type="button" onClick={onClick} className={`focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#b76a47] px-5 py-3 font-bold text-white shadow-[0_12px_30px_rgba(183,106,71,.22)] transition hover:-translate-y-0.5 hover:bg-[#9f583a] ${className}`}>{children}<ArrowRight className="size-4" aria-hidden="true" /></button>;
}

function LeadForm({ intent, location, compact = false }: { intent: Intent; location: string; compact?: boolean }) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [configuration, setConfiguration] = useState("");
  const [consent, setConsent] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [submitError, setSubmitError] = useState("");
  const [started, setStarted] = useState(false);
  const utms = useMemo(() => typeof window === "undefined" ? {} : Object.fromEntries(new URLSearchParams(window.location.search)), []);
  const busy = status !== "idle";

  function startForm() {
    if (!started) { setStarted(true); track("form_start", { form_location: location, intent }); }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    const validation = validateLeadFields({ name, email, phone: mobile });
    const next: Record<string, string> = {
      ...(validation.name ? { name: validation.name } : {}),
      ...(validation.email ? { email: validation.email } : {}),
      ...(validation.phone ? { mobile: validation.phone } : {}),
    };
    if (!consent) next.consent = "Consent is required so a representative can contact you.";
    setErrors(next);
    setSubmitError("");
    if (Object.keys(next).length) return;

    setStatus("loading");
    track("form_submit", { form_location: location, intent, configuration, utm_source: utms.utm_source || "", utm_medium: utms.utm_medium || "", utm_campaign: utms.utm_campaign || "" });
    try {
      await submitSevenPeaksLpLead({ name, email, phone: mobile, configuration });
      sessionStorage.setItem(USER_FILLED_KEY, "true");
      setStatus("success");
      goToSevenPeaksLpThankYou(intent);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Could not save your enquiry. Please try again.");
      setStatus("idle");
    }
  }

  if (status === "success") return <div className="grid min-h-72 place-items-center text-center" role="status"><div><span className="mx-auto grid size-14 place-items-center rounded-full bg-[#dce7df]"><Check className="size-7" /></span><h3 className="mt-4 font-serif text-2xl font-bold">Thank you—your request is ready.</h3><p className="mt-2 text-sm text-[#5d7069]">Redirecting to the confirmation page…</p></div></div>;

  return (
    <form onSubmit={submit} onFocus={startForm} noValidate className={compact ? "grid gap-3" : "grid gap-4"}>
      <input type="hidden" name="intent" value={intent} /><input type="hidden" name="source" value={location} />
      <input type="hidden" name="utm_source" value={(utms.utm_source as string) || ""} readOnly /><input type="hidden" name="utm_medium" value={(utms.utm_medium as string) || ""} readOnly /><input type="hidden" name="utm_campaign" value={(utms.utm_campaign as string) || ""} readOnly />
      <label className="grid gap-1.5 text-sm font-bold text-[#15382f]">Name*<input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Your full name" aria-invalid={!!errors.name} disabled={busy} className="min-h-12 rounded-xl border bg-white px-4 font-normal outline-none focus:border-[#b76a47] focus:ring-4 focus:ring-[#b76a47]/10 disabled:opacity-70" />{errors.name && <span className="text-xs font-medium text-red-700">{errors.name}</span>}</label>
      <label className="grid gap-1.5 text-sm font-bold text-[#15382f]">Mobile*<span className="flex min-h-12 overflow-hidden rounded-xl border bg-white focus-within:border-[#b76a47] focus-within:ring-4 focus-within:ring-[#b76a47]/10"><span className="grid place-items-center border-r px-3 text-sm">+91</span><input value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" autoComplete="tel" placeholder="10-digit number" aria-invalid={!!errors.mobile} disabled={busy} className="min-w-0 flex-1 px-4 font-normal outline-none disabled:opacity-70" /></span>{errors.mobile && <span className="text-xs font-medium text-red-700">{errors.mobile}</span>}</label>
      <fieldset disabled={busy}><legend className="mb-2 text-sm font-bold">Configuration <span className="font-normal text-[#6b7c76]">(optional)</span></legend><div className="grid grid-cols-2 gap-2">{["3 BHK", "4 BHK"].map((option) => <label key={option} className={`flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm font-bold transition focus-within:ring-4 focus-within:ring-[#b76a47]/15 ${configuration === option ? "border-[#15382f] bg-[#e2e9e2]" : "bg-white"}`}><input type="radio" name={`configuration-${location}`} value={option} checked={configuration === option} onChange={() => setConfiguration(option)} className="size-4 accent-[#15382f]" />{option}</label>)}</div></fieldset>
      <label className="grid gap-1.5 text-sm font-bold text-[#15382f]">Email*<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" placeholder="you@example.com" aria-required="true" aria-invalid={!!errors.email} disabled={busy} className="min-h-12 rounded-xl border bg-white px-4 font-normal outline-none focus:border-[#b76a47] focus:ring-4 focus:ring-[#b76a47]/10 disabled:opacity-70" />{errors.email && <span className="text-xs font-medium text-red-700">{errors.email}</span>}</label>
      <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-5 text-[#5d7069]"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} disabled={busy} className="mt-0.5 size-5 shrink-0 rounded accent-[#15382f]" /><span>I agree to receive project information by call, SMS or WhatsApp. View the <a href="#privacy" className="font-bold text-[#15382f] underline underline-offset-2">Privacy Policy</a>.</span></label>{errors.consent && <span className="-mt-2 text-xs font-medium text-red-700">{errors.consent}</span>}
      {submitError && <span className="text-xs font-medium text-red-700">{submitError}</span>}
      <button type="submit" disabled={busy} className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#b76a47] px-5 font-bold text-white transition hover:bg-[#9f583a] disabled:cursor-not-allowed disabled:opacity-70">{status === "loading" ? "Submitting…" : "Get Instant Callback"}<ArrowRight className="size-4" /></button>
      <p className="flex flex-wrap items-center justify-center gap-x-2 text-center text-xs font-semibold text-[#61736c]"><span>RERA registered</span><span>·</span><span>Your details are safe</span><span>·</span><span>Quick callback</span></p>
    </form>
  );
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [intent, setIntent] = useState<Intent>("price_sheet");
  const [openFaq, setOpenFaq] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const hasSeenModal = useRef(false);

  function openLead(nextIntent: Intent, section: string, label?: string) {
    track("cta_click", { intent: nextIntent, section, label: label || intentTitles[nextIntent] });
    if (nextIntent === "call") track("click_call", { section });
    if (nextIntent === "whatsapp") track("click_whatsapp", { section });
    setIntent(nextIntent); setModalOpen(true); setMenuOpen(false);
  }

  useEffect(() => {
    if (modalOpen) {
      hasSeenModal.current = true;
      return;
    }
    if (hasFilledForm()) return;

    const delay = hasSeenModal.current ? REPEAT_OPEN_MS : FIRST_OPEN_MS;
    const timer = setTimeout(() => {
      if (hasFilledForm()) return;
      setIntent("price_sheet");
      setModalOpen(true);
      track("auto_popup_view", { delay });
    }, delay);

    return () => clearTimeout(timer);
  }, [modalOpen]);

  useEffect(() => {
    if (!modalOpen) return;
    const modal = modalRef.current;
    const previous = document.activeElement as HTMLElement | null;
    const focusable = () => Array.from(modal?.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') || []).filter((element) => !element.hasAttribute("disabled"));
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => focusable()[0]?.focus());
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setModalOpen(false); return; }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", handleKey);
    return () => { document.body.style.overflow = ""; document.removeEventListener("keydown", handleKey); previous?.focus(); };
  }, [modalOpen]);

  useEffect(() => {
    type WebMcpContext = { registerTool: (tool: Record<string, unknown>, options?: { signal?: AbortSignal }) => void | Promise<void> };
    const context = (document as Document & { modelContext?: WebMcpContext }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const allowed: Intent[] = ["price_sheet", "four_bhk_price", "cost_sheet", "floor_plans", "payment_plan", "location_map", "brochure", "site_visit", "amenities_brochure"];
    try {
      void Promise.resolve(context.registerTool({
        name: "start_eldeco_7_peaks_enquiry",
        title: "Start Eldeco 7 Peaks enquiry",
        description: "Open the visible enquiry form for a specific Eldeco 7 Peaks information request. The visitor still reviews and submits their own contact details and consent.",
        inputSchema: { type: "object", properties: { intent: { type: "string", enum: allowed } }, required: ["intent"], additionalProperties: false },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute(input: unknown) {
          const candidate = typeof input === "object" && input !== null ? (input as { intent?: unknown }).intent : undefined;
          if (typeof candidate !== "string" || !allowed.includes(candidate as Intent)) throw new Error("Unsupported enquiry intent.");
          setIntent(candidate as Intent); setModalOpen(true); track("cta_click", { intent: candidate, section: "webmcp" });
          return { status: "form_opened", intent: candidate };
        },
      }, { signal: lifecycle.signal })).catch(() => undefined);
    } catch {}
    return () => lifecycle.abort();
  }, []);

  return (
    <div className="eldeco-7-peaks-lp overflow-x-clip bg-[#f7f4ed] text-[#18372f]">
      <header className="sticky top-0 z-40 border-b border-[#15382f]/10 bg-[#f7f4ed]/95 backdrop-blur-xl">
        <div className="section-shell flex h-[72px] items-center gap-4">
          <a href="#top" className="focus-ring flex items-center rounded-lg" aria-label="Eldeco 7 Peaks home">
            <img src="/eldeco-7-peak-new/elde-logo.png" alt="Eldeco" width="180" height="40" className="h-8 w-auto sm:h-9" />
          </a>
          <nav className="ml-auto hidden items-center gap-5 lg:flex" aria-label="Primary navigation">
            {["Overview", "Price", "Floor Plans", "Amenities", "Site Plan", "Location", "FAQs"].map((item) => <a key={item} href={`#${item.toLowerCase().replace(" ", "-")}`} className="focus-ring rounded px-1 text-sm font-semibold hover:text-[#a85f3f]">{item}</a>)}
          </nav>
          <button type="button" onClick={() => openLead("call", "header")} className="focus-ring hidden min-h-11 items-center justify-center rounded-xl bg-[#b76a47] px-5 text-sm font-bold text-white transition hover:bg-[#9f583a] lg:flex">Enquiry Now</button>
          <button type="button" onClick={() => setMenuOpen(!menuOpen)} className="focus-ring ml-auto grid size-11 place-items-center rounded-xl border bg-white lg:hidden" aria-expanded={menuOpen} aria-label="Toggle navigation">{menuOpen ? <X /> : <Menu />}</button>
        </div>
        {menuOpen && <nav className="border-t bg-[#f7f4ed] p-4 lg:hidden">{["Overview", "Price", "Floor Plans", "Amenities", "Site Plan", "Location", "FAQs"].map((item) => <a key={item} href={`#${item.toLowerCase().replace(" ", "-")}`} onClick={() => setMenuOpen(false)} className="block min-h-11 border-b px-2 py-3 font-bold">{item}</a>)}</nav>}
      </header>

      <main id="top">
        <section className="relative isolate overflow-hidden bg-[#15382f] text-white">
          <FallbackImage src="/eldeco-7-peak-new/homebanner.webp" alt="Eldeco 7 Peaks Residences towers beside a green landscape in Omicron 1A" priority className="absolute inset-0 -z-20 h-full w-full" />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(10,37,29,.96),rgba(21,56,47,.80)_52%,rgba(21,56,47,.56))]" />
          <div className="section-shell grid min-h-[760px] items-center gap-10 py-16 lg:grid-cols-[1.15fr_.65fr] lg:py-20">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-2 text-xs font-bold"><MapPin className="size-4" /> Omicron 1A, Greater Noida</p>
              <h1 className="mt-6 font-serif text-5xl font-bold leading-[1.04] sm:text-6xl lg:text-7xl">Eldeco 7 Peaks Residences in Greater Noida</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/75">Premium 3 BHK and 4 BHK homes with three-side-open planning, wraparound balconies and a landscape built around four distinct pools.</p>
              <div className="mt-7 flex flex-wrap gap-3 text-sm font-bold"><span className="rounded-lg border border-white/20 bg-white/10 px-3 py-2">3 BHK + 2T · 1650 sq ft</span><span className="rounded-lg border border-white/20 bg-white/10 px-3 py-2">4 BHK + 3T · 1850 sq ft</span></div>
              <div className="mt-8 flex flex-wrap items-end gap-5"><div><span className="block text-xs uppercase tracking-[.16em] text-white/55">Starting price</span><strong className="font-serif text-4xl text-[#d9b29d]">₹2.37 Cr*</strong></div><div className="h-10 w-px bg-white/20" /><div><span className="block text-xs uppercase tracking-[.16em] text-white/55">Current offer</span><strong className="text-lg">Pay 10% now, nothing till 24 months**</strong></div></div>
              <div className="mt-7 flex flex-wrap items-center gap-3"><PrimaryButton onClick={() => openLead("price_sheet", "hero")}>Get Price Sheet</PrimaryButton><button type="button" onClick={() => openLead("site_visit", "hero")} className="focus-ring min-h-12 rounded-xl border border-white/45 px-5 font-bold hover:bg-white hover:text-[#15382f]">Book a Free Site Visit</button></div>
              <p className="mt-5 flex items-center gap-2 text-sm text-white/70"><ShieldCheck className="size-5 text-[#d9b29d]" /> UP RERA: {project.rera}</p>
            </div>
            <aside className="rounded-[1.75rem] border border-white/20 bg-[#f7f4ed] p-5 text-[#18372f] shadow-2xl sm:p-7">
              <p className="eyebrow">Priority callback</p><h2 className="mt-2 font-serif text-3xl font-bold">Get the complete price sheet</h2><p className="mb-5 mt-2 text-sm text-[#60716b]">Share your details and request current pricing. Configuration is optional.</p><LeadForm intent="price_sheet" location="hero" compact />
            </aside>
          </div>
        </section>

        <section className="border-b bg-white" aria-labelledby="key-facts-heading">
          <div className="section-shell py-12">
            <p className="eyebrow">Verified project summary</p><h2 id="key-facts-heading" className="mt-2 font-serif text-3xl font-bold">Eldeco 7 Peaks key facts</h2>
            <div className="mt-6 overflow-x-auto rounded-2xl border">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm"><caption className="sr-only">Key facts for Eldeco 7 Peaks Residences</caption><tbody>
                {[
                  ["Project", "Eldeco 7 Peaks Residences by Eldeco"], ["Location", project.location], ["Configurations", "3 BHK + 2T and 4 BHK + 3T"], ["Sizes", "1650 sq ft and 1850 sq ft"], ["Starting Price", "₹2.37 Cr*"], ["Towers", "7 towers + Club block + Commercial plaza"], ["Planning", "4 apartments per floor; three-side-open"], ["UP RERA", project.rera], ["Possession", "[TO BE CONFIRMED]"],
                ].map(([label, value], i) => <tr key={label} className={i % 2 ? "bg-[#f3efe7]" : "bg-white"}><th scope="row" className="w-[32%] border-r px-5 py-4 font-bold text-[#15382f]">{label}</th><td className="px-5 py-4 text-[#526760]">{value.includes("[TO") ? <ConfirmTag /> : value}</td></tr>)}
              </tbody></table>
            </div>
          </div>
        </section>

        <section id="overview" className="section-pad">
          <div className="section-shell grid items-center gap-12 lg:grid-cols-2">
            <div><SectionTitle eyebrow="Project overview" title="Open-sided residences shaped by landscape" summary="Eldeco 7 Peaks Greater Noida is a seven-tower residential development in Omicron 1A. Its stated planning combines four apartments per floor, three-side-open homes, wraparound balconies and recreation-led stilt areas." /><p className="mt-6 text-[#566a63]">The project edge is defined by a 100 m wide green belt, while access is planned from a 130 m wide main road. Internal movement uses 18 m and 12 m roads, with visitor parking, golf cart parking and a club courtyard drop-off identified in the site plan.</p><PrimaryButton className="mt-7" onClick={() => openLead("brochure", "overview")}>Download Brochure</PrimaryButton></div>
            <FallbackImage src="/eldeco-7-peak-new/gl10.webp" alt="Three-side-open Eldeco 7 Peaks residences with wraparound balconies" className="aspect-[4/3] rounded-[2rem] shadow-[0_25px_70px_rgba(21,56,47,.15)]" />
          </div>
        </section>

        <section id="highlights" className="section-pad bg-[#15382f] text-white">
          <div className="section-shell"><SectionTitle light eyebrow="Design differentiators" title="Planning details that matter every day" summary="The highlights focus on real residential experience: openness, balcony access, lift capacity, usable recreation and daylight brought into the basement through 28 cutouts." /><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{highlights.map(({ icon: Icon, title, text }) => <article key={title} className="rounded-2xl border border-white/12 bg-white/[.055] p-6"><span className="grid size-12 place-items-center rounded-xl bg-white/10 text-[#d9b29d]"><Icon className="size-6" /></span><h3 className="mt-5 font-serif text-lg font-bold text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-white/65">{text}</p></article>)}</div></div>
        </section>

        <section id="price" className="section-pad bg-[#e2e9e2]">
          <div className="section-shell"><SectionTitle eyebrow="Eldeco 7 Peaks price" title="Price list and configurations" summary="The confirmed entry price is ₹2.37 Cr* for the 1650 sq ft 3 BHK + 2T. The current 1850 sq ft 4 BHK + 3T price must be requested." /><div className="mt-10 grid gap-5 lg:grid-cols-2">
            <article className="rounded-[1.75rem] border bg-white p-6 shadow-sm sm:p-8"><p className="eyebrow">Residence 01</p><h3 className="mt-2 font-serif text-3xl font-bold">3 BHK + 2T</h3><p className="mt-1 text-[#60716b]">1650 sq ft · three-side-open</p><div className="my-6 h-px bg-[#15382f]/10" /><span className="text-sm font-semibold text-[#60716b]">Starting price</span><p className="font-serif text-4xl font-bold text-[#15382f]">₹2.37 Cr*</p><PrimaryButton className="mt-7 w-full" onClick={() => openLead("cost_sheet", "pricing_3bhk")}>Get Cost Sheet</PrimaryButton></article>
            <article className="rounded-[1.75rem] border bg-[#15382f] p-6 text-white shadow-sm sm:p-8"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#d9b29d]">Residence 02</p><h3 className="mt-2 font-serif text-3xl font-bold">4 BHK + 3T</h3><p className="mt-1 text-white/65">1850 sq ft · three-side-open</p><div className="my-6 h-px bg-white/15" /><span className="text-sm font-semibold text-white/60">Current price</span><p className="font-serif text-4xl font-bold">On Request</p><PrimaryButton className="mt-7 w-full" onClick={() => openLead("four_bhk_price", "pricing_4bhk")}>Check 4 BHK Price</PrimaryButton></article>
          </div><p className="mt-5 text-sm text-[#5d7069]">*Starting price only. Taxes, parking, PLC, IFMS, club charges, registration and other components: <ConfirmTag /></p></div>
        </section>

        <section id="payment-plan" className="section-pad">
          <div className="section-shell grid items-center gap-10 lg:grid-cols-[.85fr_1.15fr]">
            <div><SectionTitle eyebrow="Tata Capital scheme" title="Pay 10% now. Nothing till 24 months.**" summary="The stated offer is a financing-linked scheme with Tata Capital. Eligibility, approval and complete commercial terms apply." /><PrimaryButton className="mt-7" onClick={() => openLead("payment_plan", "payment_plan")}>Get Payment Plan Details</PrimaryButton></div>
            <div className="rounded-[2rem] bg-[#15382f] p-6 text-white sm:p-9"><div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center"><div><span className="text-sm text-white/55">At booking</span><strong className="block font-serif text-5xl text-[#d9b29d]">10%</strong></div><ArrowRight className="hidden text-white/40 sm:block" /><div><span className="text-sm text-white/55">Next stated payment</span><strong className="block font-serif text-4xl">After 24 months**</strong></div></div><div className="hairline my-6" /><p className="text-sm leading-6 text-white/65">**Tata Capital scheme is subject to borrower eligibility, credit approval, property approval, availability and lender terms. Interest servicing, disbursement schedule, validity, fees and detailed conditions are <span className="rounded bg-amber-100 px-1 font-bold text-amber-950">TO BE CONFIRMED</span>. This is not a loan approval or financial commitment.</p></div>
          </div>
        </section>

        <section id="floor-plans" className="section-pad bg-[#f0ece3]">
          <div className="section-shell"><SectionTitle eyebrow="Gated floor plans" title="Compare the 3 BHK and 4 BHK layouts" summary="Both available formats are presented as blurred previews. Unlock the detailed plans to review room placement, balcony extent and circulation." /><div className="mt-10 grid gap-5 lg:grid-cols-2">{[["3 BHK + 2T","1650 sq ft"],["4 BHK + 3T","1850 sq ft"]].map(([title,size]) => <article key={title} className="overflow-hidden rounded-[1.75rem] border bg-white"><div className="relative overflow-hidden"><FallbackImage src="/eldeco-7-peak-new/floor-plan.webp" alt={`Locked ${title} ${size} floor plan preview at Eldeco 7 Peaks`} className="pointer-events-none aspect-[4/3] select-none blur-md scale-105" /><div className="absolute inset-0 grid place-items-center bg-white/25"><span className="grid size-16 place-items-center rounded-full bg-[#15382f] text-white shadow-xl"><LockKeyhole className="size-7" /></span></div></div><div className="flex items-center justify-between gap-4 p-5"><div><h3 className="font-serif text-lg font-bold">{title}</h3><p className="text-sm text-[#60716b]">{size}</p></div><button type="button" onClick={() => openLead("floor_plans", `floor_plan_${title}`)} className="focus-ring min-h-11 rounded-xl bg-[#b76a47] px-4 text-sm font-bold text-white hover:bg-[#9f583a]">Unlock Floor Plan</button></div></article>)}</div><div className="mt-7 text-center"><PrimaryButton onClick={() => openLead("floor_plans", "floor_plans")}>Download Floor Plans</PrimaryButton></div></div>
        </section>

        <section id="amenities" className="section-pad">
          <div className="section-shell">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <SectionTitle eyebrow="18 amenities" title="Outdoor living across gardens, play and wellness" summary="The landscape includes a grand arrival, gardens, kids’ and seniors’ spaces, jogging and cycling tracks, a skating circuit, a party lawn, yoga, a bonfire pit and CCTV-secured common areas." />
              <div className="rounded-2xl bg-[#15382f] px-6 py-4 text-white"><strong className="block font-serif text-4xl text-[#d9b29d]">18</strong><span className="text-sm">Named amenities</span></div>
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {featureAmenities.map(({ icon: Icon, title }) => (
                <article key={title} className="flex min-h-16 items-center gap-3 rounded-2xl border bg-white px-4 py-3 shadow-sm">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#e2e9e2] text-[#a85f3f]"><Icon className="size-5" aria-hidden="true" /></span>
                  <h3 className="font-serif font-bold leading-snug">{title}</h3>
                </article>
              ))}
            </div>
            <div className="mt-8 text-center"><PrimaryButton onClick={() => openLead("amenities_brochure", "amenities")}>Download Amenities Brochure</PrimaryButton></div>
          </div>
        </section>

        <section id="site-plan" className="section-pad bg-[#15382f] text-white">
          <div className="section-shell">
            <SectionTitle light eyebrow="Site plan" title="Seven named towers around club, pools and gardens" summary="The site plan shows the seven residential towers, the Club block, the Commercial plaza and the main arrival zone." />
            <div className="mt-10 overflow-hidden rounded-[2rem] border border-white/15 bg-white">
              <FallbackImage src="/eldeco-7-peak-new/gl13.webp" alt="Site plan of Eldeco 7 Peaks Residences showing seven towers, club, pools and commercial plaza" className="min-h-[280px] w-full bg-white [&_img]:h-auto [&_img]:object-contain" />
            </div>
            <div className="mt-6 rounded-[2rem] border border-white/15 bg-white/[.055] p-6">
              <h3 className="font-serif font-bold text-white">All tower names</h3>
              <ol className="mt-3 grid gap-2 text-sm text-white/70 sm:grid-cols-2 lg:grid-cols-4">{project.towers.map((tower, i) => <li key={tower}>{i + 1}. {tower}</li>)}</ol>
            </div>
          </div>
        </section>

        <section id="location" className="section-pad">
          <div className="section-shell grid gap-10 lg:grid-cols-[.75fr_1.25fr]">
            <div>
              <SectionTitle eyebrow="Eldeco Omicron 1A" title="A Greater Noida address beside a 100 m green belt" summary="The project is located in Omicron 1A, Greater Noida, with access from a 130 m main road. Landmark names and exact measured distances remain to be verified." />
              <div className="mt-6 rounded-2xl border bg-white p-5">
                <p className="flex gap-3"><MapPin className="mt-1 size-5 shrink-0 text-[#a85f3f]" />Omicron 1A, Greater Noida, Uttar Pradesh 201310</p>
                <p className="mt-3 text-sm text-[#5d7069]">18 m and 12 m internal roads</p>
              </div>
              <PrimaryButton className="mt-6" onClick={() => openLead("call", "location")}>Enquiry Now</PrimaryButton>
            </div>
            <div className="min-h-[450px] overflow-hidden rounded-[1.75rem] border bg-white shadow-sm lg:h-full">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d69040.98016801506!2d77.43054054609067!3d28.48426128299582!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cbfc3d742294b%3A0x54eb8c3b5feb8305!2sEldeco%207%20Peaks%20Residences!5e1!3m2!1sen!2sin!4v1789726480666!5m2!1sen!2sin"
                title="Eldeco 7 Peaks Residences on Google Maps"
                width="600"
                height="450"
                loading="lazy"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                className="h-full min-h-[450px] w-full border-0"
              />
            </div>
          </div>
        </section>

        <section id="gallery" className="section-pad bg-[#efeae1]">
          <div className="section-shell">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <SectionTitle eyebrow="Project gallery" title="Architecture, landscape and shared spaces" summary="Review the residential architecture, wraparound balconies, water landscape, leisure spaces and the green-belt-facing environment." />
              <div className="flex gap-2">
                <button type="button" className="gallery-swiper-prev focus-ring grid size-11 place-items-center rounded-full border bg-white text-[#15382f] hover:bg-[#e2e9e2]" aria-label="Previous gallery images"><ChevronLeft className="size-5" /></button>
                <button type="button" className="gallery-swiper-next focus-ring grid size-11 place-items-center rounded-full border bg-white text-[#15382f] hover:bg-[#e2e9e2]" aria-label="Next gallery images"><ChevronRight className="size-5" /></button>
              </div>
            </div>
            <div className="gallery-swiper mt-10">
              <Swiper
                modules={[Autoplay, Navigation]}
                dir="ltr"
                loop
                speed={700}
                spaceBetween={16}
                slidesPerView={1.12}
                autoplay={{ delay: 2800, disableOnInteraction: false, pauseOnMouseEnter: true }}
                navigation={{ prevEl: ".gallery-swiper-prev", nextEl: ".gallery-swiper-next" }}
                breakpoints={{ 640: { slidesPerView: 2, spaceBetween: 16 }, 1024: { slidesPerView: 3, spaceBetween: 16 } }}
              >
                {gallery.map(([src, alt]) => (
                  <SwiperSlide key={src}>
                    <button type="button" onClick={() => openLead("call", "gallery", alt)} className="focus-ring w-full overflow-hidden rounded-2xl bg-white text-left">
                      <FallbackImage src={src} alt={alt} className="aspect-[4/3]" />
                      <span className="block px-4 py-3 text-sm font-semibold">{alt}</span>
                    </button>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </section>

     

        <section id="faqs" className="section-pad">
          <div className="section-shell grid gap-10 lg:grid-cols-[.62fr_1.38fr]"><div className="lg:sticky lg:top-28 lg:self-start"><SectionTitle eyebrow="Buyer questions" title="FAQs" summary="Direct answers covering price, RERA, sizes, towers, amenities, possession, metro access and site visits." /></div><div className="border-t">{faqItems.map((item,i)=><article key={item.question} className="border-b"><button type="button" onClick={()=>setOpenFaq(openFaq===i?-1:i)} className="focus-ring flex min-h-16 w-full items-center justify-between gap-4 rounded px-1 py-4 text-left font-bold" aria-expanded={openFaq===i}><span>{item.question}</span><ChevronDown className={`size-5 shrink-0 transition ${openFaq===i?"rotate-180":""}`} /></button>{openFaq===i&&<p className="pb-5 pr-8 text-sm leading-7 text-[#5b6e67]">{item.answer}</p>}</article>)}</div></div>
        </section>

        <section className="section-pad bg-[#15382f] text-white">
          <div className="section-shell grid items-center gap-10 lg:grid-cols-[1fr_.75fr]"><div><SectionTitle light eyebrow="Plan your next step" title="Get the exact information you need before you visit" summary="Request the latest price sheet, floor plans, payment-plan terms or a site visit. Name, email and mobile are required; configuration is optional." /><ul className="mt-7 grid gap-3 text-sm text-white/75 sm:grid-cols-2"><li className="flex gap-2"><BadgeCheck className="size-5 text-[#d9b29d]" />UP RERA registered</li><li className="flex gap-2"><ShieldCheck className="size-5 text-[#d9b29d]" />Consent-led contact</li><li className="flex gap-2"><LockKeyhole className="size-5 text-[#d9b29d]" />Secure enquiry form</li><li className="flex gap-2"><Users className="size-5 text-[#d9b29d]" />Configuration-specific callback</li></ul></div><aside className="rounded-[1.75rem] bg-[#f7f4ed] p-5 text-[#18372f] sm:p-7"><p className="eyebrow">Final enquiry</p><h2 className="mt-2 font-serif text-3xl font-bold">Request project details</h2><p className="mb-5 mt-2 text-sm text-[#60716b]">Choose 3 BHK or 4 BHK if you already know, then submit securely.</p><LeadForm intent="brochure" location="final_section" /></aside></div>
        </section>
      </main>

      <footer id="privacy" className="bg-[#0d2922] pb-24 pt-12 text-white/65 md:pb-12">
        <div className="section-shell"><div className="grid gap-10 lg:grid-cols-[1.2fr_.8fr]"><div><h2 className="font-serif text-2xl font-bold text-white">Eldeco 7 Peaks Residences</h2><p className="mt-3 max-w-3xl text-sm leading-6">The content on this website is for information purposes only and does not constitute an offer, invitation or recommendation to purchase property. Project images are artistic impressions. Buyers should verify all prices, plans, approvals, specifications and timelines through official documents.</p><p className="mt-4 text-xs leading-5">*₹2.37 Cr is the stated starting price for the 3 BHK + 2T, 1650 sq ft configuration. Taxes and additional charges are <ConfirmTag />.</p><p className="mt-2 text-xs leading-5">**Tata Capital scheme is subject to eligibility, credit approval, lender terms, availability and detailed conditions. This communication is not a loan sanction or financial advice.</p></div><div className="flex items-start gap-4 lg:justify-end"><FallbackImage src="/eldeco-7-peak-new/rera-qr.png" alt="UP RERA QR code for Eldeco 7 Peaks Residences" className="size-28 rounded-xl bg-white" /><div className="text-sm"><strong className="block text-white">UP RERA</strong><span>{project.rera}</span><a href="#privacy" className="mt-4 block font-bold text-white underline underline-offset-4">Privacy Policy</a></div></div></div><div className="mt-9 flex flex-col gap-2 border-t border-white/10 pt-5 text-xs sm:flex-row sm:justify-between"><span>© 2026 My Property Fact. All rights reserved.</span><span>Digital Media Planned By Ritz Media World</span></div></div>
      </footer>

      <button type="button" onClick={() => openLead("call", "desktop_floating")} className="focus-ring fixed bottom-6 right-6 z-30 hidden min-h-12 items-center gap-2 rounded-full bg-[#b76a47] px-5 font-bold text-white shadow-2xl hover:bg-[#9f583a] md:flex">Enquiry Now <ArrowRight className="size-4" /></button>
      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t bg-white p-2 shadow-[0_-12px_30px_rgba(21,56,47,.12)] md:hidden">
        <button type="button" onClick={() => openLead("call", "mobile_sticky")} className="flex min-h-12 items-center justify-center gap-1.5 border-r text-sm font-bold">Enquiry Now</button>
        <button type="button" onClick={() => openLead("price_sheet", "mobile_sticky")} className="flex min-h-12 items-center justify-center gap-1.5 rounded-lg bg-[#b76a47] text-sm font-bold text-white">Enquire<ArrowRight className="size-4" /></button>
      </div>

      {modalOpen && <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#071c16]/75 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false); }}><div ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="lead-modal-title" aria-describedby="lead-modal-description" className="relative max-h-[calc(100vh-2rem)] w-full max-w-[500px] overflow-y-auto rounded-[1.5rem] border border-[#15382f]/15 bg-[#f7f4ed] p-5 shadow-2xl sm:p-7"><button type="button" onClick={() => setModalOpen(false)} aria-label="Close enquiry form" className="focus-ring absolute right-4 top-4 grid size-11 place-items-center rounded-full border bg-white text-[#15382f] hover:bg-[#e2e9e2]"><X className="size-5" /></button><div className="mb-5 pr-12"><h2 id="lead-modal-title" className="font-serif text-3xl leading-tight text-[#15382f]">{intentTitles[intent]}</h2><p id="lead-modal-description" className="mt-2 text-sm text-[#60716b]">Submit your details for a quick, relevant callback. Configuration is optional.</p></div><LeadForm intent={intent} location="lead_modal" compact /></div></div>}
    </div>
  );
}
