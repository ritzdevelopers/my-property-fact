"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faMagnifyingGlass,
  faSliders,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

function FilterGroup({ title, count, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`city-filters__group${open ? " is-open" : ""}`}>
      <button
        type="button"
        className="city-filters__group-head"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span className="city-filters__group-title">
          {title}
          {count > 0 ? (
            <span className="city-filters__group-count">{count}</span>
          ) : null}
        </span>
        <FontAwesomeIcon icon={faChevronDown} className="city-filters__chevron" />
      </button>
      {open ? <div className="city-filters__group-body">{children}</div> : null}
    </div>
  );
}

function OptionList({ options, selected, onToggle, scrollable = false }) {
  if (!options.length) {
    return <p className="city-filters__empty">No options available</p>;
  }

  return (
    <ul
      className={`city-filters__options${
        scrollable ? " city-filters__options--scroll" : ""
      }`}
    >
      {options.map((option) => {
        const isChecked = selected.includes(option.value);
        return (
          <li key={option.value}>
            <label className="city-filters__option">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => onToggle(option.value)}
              />
              <span className="city-filters__option-label">{option.label}</span>
              {typeof option.count === "number" ? (
                <span className="city-filters__option-count">{option.count}</span>
              ) : null}
            </label>
          </li>
        );
      })}
    </ul>
  );
}

export default function CityFilterSidebar({
  cityName,
  filters,
  options,
  activeCount,
  resultCount,
  sheetOpen,
  onSheetOpenChange,
  onSearchChange,
  onToggleValue,
  onReset,
}) {
  useEffect(() => {
    if (!sheetOpen) return undefined;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") onSheetOpenChange(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [sheetOpen, onSheetOpenChange]);

  const groups = [
    { key: "propertyType", title: "Property type", options: options.propertyTypes },
    { key: "locality", title: "Locality", options: options.localities, scrollable: true },
    { key: "configuration", title: "Configuration", options: options.configurations, scrollable: true },
    { key: "budget", title: "Budget", options: options.budgets },
    { key: "status", title: "Project status", options: options.statuses },
    { key: "builder", title: "Builder", options: options.builders, scrollable: true },
  ].filter((group) => group.options.length > 0);

  return (
    <aside className="city-filters" aria-label={`Filter projects in ${cityName}`}>
      <button
        type="button"
        className="city-filters__mobile-toggle"
        onClick={() => onSheetOpenChange(true)}
        aria-expanded={sheetOpen}
      >
        <FontAwesomeIcon icon={faSliders} />
        Filters
        {activeCount > 0 ? (
          <span className="city-filters__mobile-count">{activeCount}</span>
        ) : null}
      </button>

      <div
        className={`city-filters__overlay${sheetOpen ? " is-open" : ""}`}
        onClick={() => onSheetOpenChange(false)}
        aria-hidden="true"
      />

      <div
        className={`city-filters__panel${sheetOpen ? " is-open" : ""}`}
        role="group"
        aria-label="Project filters"
      >
        <div className="city-filters__grabber" aria-hidden="true">
          <span />
        </div>

        <div className="city-filters__head">
          <p className="city-filters__title">Filters</p>
          <div className="city-filters__head-actions">
            {activeCount > 0 ? (
              <button type="button" className="city-filters__reset" onClick={onReset}>
                Reset
              </button>
            ) : null}
            <button
              type="button"
              className="city-filters__sheet-close"
              onClick={() => onSheetOpenChange(false)}
              aria-label="Close filters"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        </div>

        <div className="city-filters__body">
          <div className="city-filters__search">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="city-filters__search-icon"
            />
            <input
              type="search"
              value={filters.search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search project or builder"
              aria-label="Search projects"
            />
          </div>

          {groups.map((group) => (
            <FilterGroup
              key={group.key}
              title={group.title}
              count={filters[group.key].length}
              defaultOpen={group.key === "propertyType" || group.key === "locality"}
            >
              <OptionList
                options={group.options}
                selected={filters[group.key]}
                onToggle={(value) => onToggleValue(group.key, value)}
                scrollable={group.scrollable}
              />
            </FilterGroup>
          ))}
        </div>

        <div className="city-filters__sheet-footer">
          <button
            type="button"
            className="city-filters__sheet-apply"
            onClick={() => onSheetOpenChange(false)}
          >
            Show {resultCount} project{resultCount === 1 ? "" : "s"}
          </button>
        </div>
      </div>
    </aside>
  );
}
