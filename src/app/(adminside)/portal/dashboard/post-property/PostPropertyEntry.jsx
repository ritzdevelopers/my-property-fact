"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  LayoutDashboard,
  Plus,
  Sparkles,
} from "lucide-react";
import { useUser } from "../../_contexts/UserContext";
import { getUserDisplayName, getUserRoleLabel } from "../../_utils/userDisplay";
import PortalUserAvatar from "../../_components/PortalUserAvatar";
import "../../_components/PortalUI.css";

export default function PostPropertyEntry() {
  const router = useRouter();
  const { userData, loading } = useUser();

  if (loading) {
    return (
      <div className="brk-page brk-page--center">
        <span className="brk-spinner" aria-label="Loading" />
      </div>
    );
  }

  const displayName = getUserDisplayName(userData);
  const personaLabel = getUserRoleLabel(userData);

  return (
    <div className="brk-page">
      <header className="brk-page-head">
        <div className="brk-page-head__main">
          <span className="brk-page-head__icon">
            <Plus size={20} />
          </span>
          <div>
            <h1 className="brk-page-head__title">Add a Property</h1>
            <p className="brk-page-head__sub">
              List sell or rent inventory for free and reach verified buyers
            </p>
          </div>
        </div>
        <div className="brk-page-head__actions">
          <Link href="/portal/dashboard" className="brk-btn brk-btn--ghost">
            <LayoutDashboard size={15} />
            Dashboard
          </Link>
        </div>
      </header>

      <div className="brk-process" aria-label="How adding a property works">
        <div className="brk-process__item">
          <span className="brk-process__num">1</span>
          <div>
            <p className="brk-process__title">Basic details</p>
            <p className="brk-process__text">Type, location, price and photos — about 5 minutes.</p>
          </div>
        </div>
        <div className="brk-process__item">
          <span className="brk-process__num">2</span>
          <div>
            <p className="brk-process__title">Submit for review</p>
            <p className="brk-process__text">Save a draft anytime, or send it to admin for approval.</p>
          </div>
        </div>
        <div className="brk-process__item">
          <span className="brk-process__num">3</span>
          <div>
            <p className="brk-process__title">Go live</p>
            <p className="brk-process__text">Approved listings appear on /properties for buyer enquiries.</p>
          </div>
        </div>
      </div>

      <section className="brk-panel">
        <div className="brk-panel__head">
          <div className="ppe-user">
            <PortalUserAvatar userData={userData} size="md" />
            <div>
              <h2 className="brk-panel__title">Welcome back, {displayName}</h2>
              <p className="brk-panel__sub">{personaLabel} · Advertise for free, get unlimited enquiries</p>
            </div>
          </div>
        </div>
        <div className="brk-panel__body">
          <div className="ppe-actions">
            <button
              type="button"
              className="ppe-card ppe-card--primary"
              onClick={() => router.push("/portal/dashboard/listings?action=add")}
            >
              <span className="ppe-card__icon">
                <Plus size={20} />
              </span>
              <span className="ppe-card__copy">
                <strong>Start a new listing</strong>
                <span>Sell or rent a property. The wizard saves drafts as you go.</span>
              </span>
              <ArrowRight size={18} className="ppe-card__arrow" />
            </button>

            <button
              type="button"
              className="ppe-card"
              onClick={() => router.push("/portal/dashboard/listings")}
            >
              <span className="ppe-card__icon">
                <Building2 size={18} />
              </span>
              <span className="ppe-card__copy">
                <strong>Manage existing listings</strong>
                <span>Edit drafts, track approvals, and see what’s live.</span>
              </span>
              <ArrowRight size={18} className="ppe-card__arrow" />
            </button>
          </div>

          <ul className="ppe-perks">
            <li>
              <CheckCircle2 size={15} /> Advertise for free
            </li>
            <li>
              <CheckCircle2 size={15} /> Unlimited buyer enquiries
            </li>
            <li>
              <Sparkles size={15} /> Verified buyer traffic
            </li>
          </ul>
        </div>
      </section>

      <style jsx>{`
        .ppe-user {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .ppe-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.85rem;
        }

        .ppe-card {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          width: 100%;
          padding: 1.1rem 1.15rem;
          border-radius: 14px;
          border: 1px solid #e6ebe9;
          background: #fff;
          text-align: left;
          cursor: pointer;
          transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
        }

        .ppe-card:hover {
          border-color: #cfe0d6;
          box-shadow: 0 8px 22px rgba(15, 23, 42, 0.06);
          transform: translateY(-1px);
        }

        .ppe-card--primary {
          background: linear-gradient(180deg, #f3fbf6 0%, #fff 70%);
          border-color: #cfead9;
        }

        .ppe-card__icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: rgba(13, 88, 52, 0.09);
          color: #0d5834;
          flex-shrink: 0;
        }

        .ppe-card--primary .ppe-card__icon {
          background: #0d5834;
          color: #fff;
        }

        .ppe-card__copy {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          min-width: 0;
          flex: 1;
        }

        .ppe-card__copy strong {
          font-size: 0.95rem;
          color: #0f172a;
        }

        .ppe-card__copy span {
          font-size: 0.8rem;
          color: #64748b;
          line-height: 1.45;
        }

        .ppe-card__arrow {
          color: #94a3b8;
          flex-shrink: 0;
        }

        .ppe-perks {
          display: flex;
          flex-wrap: wrap;
          gap: 0.55rem 1.1rem;
          margin: 1.1rem 0 0;
          padding: 0;
          list-style: none;
          font-size: 0.8rem;
          font-weight: 600;
          color: #14532d;
        }

        .ppe-perks li {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }

        :global(.brk-page--center) {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
        }

        @media (max-width: 720px) {
          .ppe-actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
