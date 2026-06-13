"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRocket,
  faPalette,
  faBolt,
  faShieldHalved,
  faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";

const ADMIN_VERSION = "2.0";
const STORAGE_KEY = "mpf_admin_seen_version";

const FEATURES = [
  {
    icon: faPalette,
    text: "Modern, premium UI with enhanced visual design",
  },
  {
    icon: faBolt,
    text: "Faster navigation and improved performance",
  },
  {
    icon: faShieldHalved,
    text: "Enhanced security and better error handling",
  },
  {
    icon: faWandMagicSparkles,
    text: "New toast notifications and smoother animations",
  },
];

export default function VersionUpgradeModal() {
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const hasSeenVersion = localStorage.getItem(STORAGE_KEY);
    if (hasSeenVersion !== ADMIN_VERSION) {
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, ADMIN_VERSION);
    setShowModal(false);
  }, []);

  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      handleDismiss();
    }
  }, [handleDismiss]);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showModal]);

  if (!mounted || !showModal) return null;

  return createPortal(
    <div
      className="admin-upgrade-modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-modal-title"
    >
      <div className="admin-upgrade-modal">
        <div className="admin-upgrade-modal__header">
          <div className="admin-upgrade-modal__version-tag">
            <FontAwesomeIcon icon={faRocket} />
            <span>Version {ADMIN_VERSION}</span>
          </div>
          <h2 className="admin-upgrade-modal__title" id="upgrade-modal-title">
            Welcome to the New Admin
          </h2>
          <p className="admin-upgrade-modal__subtitle">
            Your admin experience has been completely redesigned
          </p>
        </div>

        <div className="admin-upgrade-modal__body">
          <p className="admin-upgrade-modal__message">
            We&apos;ve upgraded your admin panel to Version 2.0 with a fresh new look
            and powerful improvements. Here&apos;s what&apos;s new:
          </p>

          <ul className="admin-upgrade-modal__features">
            {FEATURES.map((feature, idx) => (
              <li key={idx} className="admin-upgrade-modal__feature">
                <span className="admin-upgrade-modal__feature-icon">
                  <FontAwesomeIcon icon={feature.icon} />
                </span>
                <span>{feature.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="admin-upgrade-modal__footer">
          <button
            type="button"
            className="admin-upgrade-modal__btn"
            onClick={handleDismiss}
          >
            Start Exploring
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export { ADMIN_VERSION };
