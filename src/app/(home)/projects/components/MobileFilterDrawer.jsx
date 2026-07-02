"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter,
  faTimes,
  faChevronDown,
  faChevronUp,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";

const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mpf-mobile-filter-section">
      <button
        type="button"
        className="mpf-mobile-filter-section-header"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} />
      </button>
      {isOpen && (
        <div className="mpf-mobile-filter-section-content">{children}</div>
      )}
    </div>
  );
};

export default function MobileFilterDrawer({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onClearFilters,
  onApplyFilters,
  cities = [],
  propertyTypes = [],
  projectStatuses = [],
  budgetOptions = [],
  bhkOptions = [],
  configTypeOptions = [],
  hideBedroom = false,
  activeFiltersCount = 0,
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="mpf-mobile-drawer-overlay" onClick={onClose}>
      <div
        className="mpf-mobile-drawer"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mpf-mobile-drawer-header">
          <div className="mpf-mobile-drawer-title">
            <FontAwesomeIcon icon={faFilter} />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="mpf-mobile-filter-badge">{activeFiltersCount}</span>
            )}
          </div>
          <button
            type="button"
            className="mpf-mobile-drawer-close"
            onClick={onClose}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="mpf-mobile-drawer-body">
          <FilterSection title="Property Type">
            <div className="mpf-mobile-type-pills">
              {propertyTypes.map((type, idx) => {
                const value = type.projectTypeName;
                const isSelected = filters.propertyType === value;
                return (
                  <button
                    key={`m-type-${idx}`}
                    type="button"
                    className={`mpf-mobile-type-pill ${isSelected ? "selected" : ""}`}
                    onClick={() =>
                      onFilterChange("propertyType", isSelected ? "" : value)
                    }
                  >
                    {type.projectTypeName}
                  </button>
                );
              })}
            </div>
          </FilterSection>

          <FilterSection title="Location">
            <select
              value={filters.city}
              onChange={(e) => onFilterChange("city", e.target.value)}
              className="mpf-mobile-select"
            >
              <option value="">All Cities</option>
              {cities.map((city, idx) => (
                <option key={`m-city-${idx}`} value={city.cityName}>
                  {city.cityName}
                </option>
              ))}
            </select>
          </FilterSection>

          <FilterSection title="Budget Range">
            <div className="mpf-mobile-budget-grid">
              {budgetOptions.map((option, idx) => {
                const isSelected = filters.budget === option;
                return (
                  <button
                    key={`m-budget-${idx}`}
                    type="button"
                    className={`mpf-mobile-budget-btn ${isSelected ? "selected" : ""}`}
                    onClick={() =>
                      onFilterChange("budget", isSelected ? "" : option)
                    }
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </FilterSection>

          {!hideBedroom && (
            <FilterSection title="BHK Type">
              <div className="mpf-mobile-bhk-grid">
                {bhkOptions.map((bhk, idx) => {
                  const isSelected = filters.bhkType === bhk;
                  return (
                    <button
                      key={`m-bhk-${idx}`}
                      type="button"
                      className={`mpf-mobile-bhk-btn ${isSelected ? "selected" : ""}`}
                      onClick={() =>
                        onFilterChange("bhkType", isSelected ? "" : bhk)
                      }
                    >
                      {bhk}
                    </button>
                  );
                })}
              </div>
            </FilterSection>
          )}

          {configTypeOptions.length > 0 && (
            <FilterSection title="Commercial Type">
              <div className="mpf-mobile-bhk-grid">
                {configTypeOptions.map((opt) => {
                  const isSelected = filters.configType === opt.key;
                  return (
                    <button
                      key={`m-ctype-${opt.key}`}
                      type="button"
                      className={`mpf-mobile-bhk-btn ${isSelected ? "selected" : ""}`}
                      onClick={() => onFilterChange("configType", isSelected ? "" : opt.key)}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </FilterSection>
          )}
        </div>

        <div className="mpf-mobile-drawer-footer">
          <button
            type="button"
            className="mpf-mobile-reset-btn"
            onClick={onClearFilters}
          >
            Reset All
          </button>
          <button
            type="button"
            className="mpf-mobile-apply-btn"
            onClick={() => {
              onApplyFilters();
              onClose();
            }}
          >
            Show Results
          </button>
        </div>
      </div>
    </div>
  );
}
