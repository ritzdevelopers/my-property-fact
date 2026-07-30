"use client";
import { exportTOExcel } from "../common-model/exporttoexcel";
import { toast } from "../../_lib/adminToast";
import DashboardHeader from "../common-model/dashboardHeader";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CommonModal from "../common-model/common-model";
import {
  Button,
  Form,
  FormControl,
  InputGroup,
} from "react-bootstrap";
import { useAdminRole } from "../../_contexts/AdminRoleContext";
import { ADMIN_PERMISSIONS } from "../../adminPermissions";
import { getPublicApiBase } from "@/lib/publicApiBase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faMagnifyingGlass, faFilter, faEnvelope, faPhone, faLocationDot, faArrowUpRightFromSquare, faInbox } from "@fortawesome/free-solid-svg-icons";
import { AdminTableDeleteIcon } from "../common-model/admin-table-icons";
import { parsePriceToCrore } from "@/app/_global_components/projectFilterUtils";
import { AdminLoader } from "@/components/admin/admin-loader";
import "./enquiries-unlock.css";

function enquirySource(row) {
  const from = String(row.enquiryFrom || "").trim().toUpperCase();
  if (from === "APP") return "App";
  // Existing frontend flow should be treated as Website by default.
  return "Website";
}

function formatEnquiryDate(row) {
  const raw = row.createdAt ?? row.updatedAt ?? row.date;
  if (raw == null || raw === "") return "—";
  try {
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return String(raw);
    return d.toLocaleString(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

/** Newest first; missing/invalid dates sort last. */
function enquirySortTimeMs(row) {
  const raw = row.createdAt ?? row.updatedAt ?? row.date;
  if (raw == null || raw === "") return 0;
  const t = new Date(raw).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function truncate(text, max) {
  if (text == null || text === "") return "—";
  const s = String(text);
  if (s.length <= max) return s;
  return `${s.slice(0, max)}…`;
}


function getSourcePageLink(row) {
  const direct = String(row?.projectLink || "").trim();
  if (direct) return direct;

  const pageName = String(row?.pageName || "").trim();
  if (!pageName) return "";
  if (/^https?:\/\//i.test(pageName)) return pageName;
  if (pageName.startsWith("/")) {
    if (typeof window !== "undefined" && window.location?.origin) {
      return `${window.location.origin}${pageName}`;
    }
    return pageName;
  }
  return "";
}

function extractSlugFromProjectLink(link) {
  const direct = String(link || "").trim();
  if (!direct) return "";
  try {
    const uri = direct.includes("://")
      ? new URL(direct)
      : new URL(direct.replace(/^\//, ""), "https://placeholder.local/");
    const parts = String(uri.pathname || "")
      .split("/")
      .filter(Boolean);
    return parts.length ? parts[parts.length - 1] : "";
  } catch {
    const fallback = direct.replace(/^\/+/, "");
    const slash = fallback.lastIndexOf("/");
    return slash >= 0 ? fallback.slice(slash + 1) : fallback;
  }
}

function buildProjectLookups(projects) {
  const bySlug = new Map();
  const byId = new Map();
  (projects || []).forEach((project) => {
    const slug = String(project?.slugURL || "").trim().toLowerCase();
    if (slug) bySlug.set(slug, project);
    const id = Number(project?.id);
    if (Number.isFinite(id)) byId.set(id, project);
  });
  return { bySlug, byId };
}

function buildCityStateMap(cities) {
  const map = new Map();
  (cities || []).forEach((city) => {
    const cityName = String(city?.cityName || city?.name || "").trim();
    const stateName = String(city?.stateName || "").trim();
    if (cityName && stateName) map.set(cityName, stateName);
  });
  return map;
}

function resolveProjectForEnquiry(row, lookups) {
  if (!lookups) return null;
  const propertyId = Number(row?.propertyId);
  if (Number.isFinite(propertyId) && lookups.byId.has(propertyId)) {
    return lookups.byId.get(propertyId);
  }
  const slug = extractSlugFromProjectLink(row?.projectLink).toLowerCase();
  if (slug && lookups.bySlug.has(slug)) {
    return lookups.bySlug.get(slug);
  }
  return null;
}

function enrichEnquiryWithProject(row, lookups, cityStateMap) {
  const project = resolveProjectForEnquiry(row, lookups);
  if (!project) {
    return {
      ...row,
      projectLocation: row.projectLocation || "",
      projectPrice: row.projectPrice || "",
      projectCity: row.projectCity || "",
      projectState: row.projectState || "",
    };
  }

  const cityName = String(project.cityName || "").trim();
  return {
    ...row,
    projectLocation:
      project.projectLocality ||
      project.projectAddress ||
      project.projectName ||
      "",
    projectPrice: project.projectPrice || "",
    projectCity: cityName,
    projectState: cityName ? cityStateMap.get(cityName) || "" : "",
  };
}

const PAGE_SIZE = 10;

const PRICE_FILTER_OPTIONS = [
  { value: "", label: "All prices" },
  { value: "0-5000000", label: "Under 50L", min: 0, max: 5000000 },
  { value: "5000000-10000000", label: "50L - 1Cr", min: 5000000, max: 10000000 },
  { value: "10000000-20000000", label: "1Cr - 2Cr", min: 10000000, max: 20000000 },
  { value: "20000000-50000000", label: "2Cr - 5Cr", min: 20000000, max: 50000000 },
  { value: "50000000+", label: "5Cr+", min: 50000000, max: Infinity },
];

const LEAD_TYPE_FILTER_OPTIONS = [
  { value: "exclude_test", label: "Hide test leads" },
  { value: "all", label: "All leads" },
  { value: "test_only", label: "Test leads only" },
];

function enquiryMonthKey(row) {
  const raw = row?.createdAt ?? row?.updatedAt ?? row?.date;
  if (raw == null || raw === "") return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function formatMonthLabel(yyyyMm) {
  const [y, m] = String(yyyyMm).split("-").map(Number);
  if (!y || !m) return yyyyMm;
  const d = new Date(y, m - 1, 1);
  return d.toLocaleString(undefined, { month: "short", year: "numeric" });
}

function buildMonthFilterOptions(rows) {
  const now = new Date();
  const thisKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const lastDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastKey = `${lastDate.getFullYear()}-${String(lastDate.getMonth() + 1).padStart(2, "0")}`;

  const fromData = new Set();
  (rows || []).forEach((row) => {
    const key = enquiryMonthKey(row);
    if (key) fromData.add(key);
  });

  // Always include last 12 calendar months so the filter stays usable
  for (let i = 0; i < 12; i += 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    fromData.add(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
    );
  }

  const sorted = Array.from(fromData).sort((a, b) => b.localeCompare(a));
  const options = [
    { value: "", label: "All months" },
    { value: thisKey, label: "This month" },
    { value: lastKey, label: "Last month" },
  ];

  sorted.forEach((key) => {
    if (key === thisKey || key === lastKey) return;
    options.push({ value: key, label: formatMonthLabel(key) });
  });

  return options;
}

function isTestLead(row) {
  return String(row?.status || "").trim().toLowerCase() === "test";
}

function trimTrailingZeros(numStr) {
  return String(numStr).replace(/(\.\d*?[1-9])0+$/u, "$1").replace(/\.0+$/u, "");
}

/** MPF price display: .53 → 53 Lakhs, 1.23 → 1.23 Crore */
function formatMpfProjectPrice(rawPrice) {
  if (rawPrice == null || String(rawPrice).trim() === "") return "—";

  const priceInCr = parsePriceToCrore(rawPrice);
  if (!Number.isFinite(priceInCr) || priceInCr <= 0) {
    return String(rawPrice).trim();
  }

  if (priceInCr < 1) {
    const lakhs = Math.round(priceInCr * 100);
    if (lakhs <= 0) return "—";
    return `${lakhs} Lakh${lakhs === 1 ? "" : "s"}`;
  }

  return `${trimTrailingZeros(priceInCr.toFixed(2))} Crore`;
}

function matchesPriceFilter(row, filterValue) {
  if (!filterValue) return true;
  const option = PRICE_FILTER_OPTIONS.find((opt) => opt.value === filterValue);
  if (!option || option.min == null) return true;
  const priceInCr = parsePriceToCrore(row.projectPrice);
  if (!Number.isFinite(priceInCr) || priceInCr <= 0) return false;
  const priceInRupees = priceInCr * 10000000;
  return priceInRupees >= option.min && priceInRupees < option.max;
}

function FilterDropdown({ label, value, options, onChange, ariaLabel }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption?.label || label;

  return (
    <div className="enquiries-filter-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className={`enquiries-filter-dropdown__trigger${value ? " has-value" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="enquiries-filter-dropdown__label">{displayLabel}</span>
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          className={`enquiries-filter-dropdown__arrow${isOpen ? " is-open" : ""}`}
          aria-hidden
        >
          <path
            d="M1 1L5 5L9 1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="enquiries-filter-dropdown__menu" role="listbox" aria-label={ariaLabel}>
          {options.map((opt) => (
            <button
              key={opt.value || "all"}
              type="button"
              role="option"
              aria-selected={opt.value === value}
              className={`enquiries-filter-dropdown__item${opt.value === value ? " is-active" : ""}`}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusDropdown({ currentStatus, options, onSelect, getStatusColor, getStatusTextColor }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="status-custom-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className="status-custom-trigger"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          backgroundColor: getStatusColor(currentStatus),
          color: getStatusTextColor(currentStatus),
          borderColor: `${getStatusTextColor(currentStatus)}44`
        }}
      >
        <span>{currentStatus}</span>
        <svg 
          width="10" 
          height="6" 
          viewBox="0 0 10 6" 
          fill="none" 
          className={`status-custom-arrow ${isOpen ? 'is-open' : ''}`}
        >
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {isOpen && (
        <div className="status-custom-menu">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              className={`status-custom-item ${opt === currentStatus ? 'is-active' : ''}`}
              onClick={() => {
                onSelect(opt);
                setIsOpen(false);
              }}
            >
              <span 
                className="status-custom-dot" 
                style={{ backgroundColor: getStatusTextColor(opt) }} 
              />
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Enquiries() {
  const { isSuperAdmin, hasPermission, loading: roleLoading } = useAdminRole();
  const canUseEnquiries =
    isSuperAdmin || hasPermission(ADMIN_PERMISSIONS.MANAGE_ENQUIRIES);

  const [list, setList] = useState([]);
  const [projects, setProjects] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmBox, setConfirmBox] = useState(false);
  const [id, setId] = useState(0);
  const [search, setSearch] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterPrice, setFilterPrice] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterLeadType, setFilterLeadType] = useState("exclude_test");
  const [page, setPage] = useState(0);
  const [accessStatus, setAccessStatus] = useState(null);
  const [unlockCells, setUnlockCells] = useState(["", "", "", ""]);
  const [unlockBusy, setUnlockBusy] = useState(false);
  const unlockInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const apiBase = getPublicApiBase();

  const fetchAccessStatus = useCallback(async () => {
    if (!apiBase) return null;
    try {
      const res = await fetch(`${apiBase}admin-portal/auth/enquiry-access-status`, {
        credentials: "include",
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }, [apiBase]);

  const loadList = async () => {
    if (!apiBase) {
      toast.error("API URL is not configured (NEXT_PUBLIC_API_URL).");
      setList([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [enquiryRes, projectsRes, citiesRes] = await Promise.all([
        fetch(`${apiBase}enquiry/get-all`, { credentials: "include" }),
        fetch(`${apiBase}projects`),
        fetch(`${apiBase}city/all`),
      ]);

      if (enquiryRes.status === 403) {
        toast.error(
          "Enquiries access denied. Enter your 4-digit code or contact a Super Admin.",
        );
        setList([]);
        setProjects([]);
        setCities([]);
        return;
      }
      if (!enquiryRes.ok) {
        toast.error("Failed to load enquiries.");
        setList([]);
        setProjects([]);
        setCities([]);
        return;
      }

      const data = await enquiryRes.json();
      const rows = Array.isArray(data) ? data : [];
      const projectsData = projectsRes.ok ? await projectsRes.json() : [];
      const citiesData = citiesRes.ok ? await citiesRes.json() : [];

      setList(rows);
      setProjects(Array.isArray(projectsData) ? projectsData : []);
      setCities(Array.isArray(citiesData) ? citiesData : []);
      setPage(0);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load enquiries.");
      setList([]);
      setProjects([]);
      setCities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roleLoading) return;
    if (!canUseEnquiries) {
      setList([]);
      setLoading(false);
      setAccessStatus(null);
      return;
    }
    if (isSuperAdmin) {
      setAccessStatus({ unlocked: true, needsCode: false, hasPermission: true });
      loadList();
      return;
    }
    let cancelled = false;
    (async () => {
      const st = await fetchAccessStatus();
      if (cancelled) return;
      if (!st) {
        toast.error("Could not verify enquiries access. Try refreshing the page.");
        setAccessStatus({ fetchFailed: true });
        setLoading(false);
        setList([]);
        return;
      }
      setAccessStatus(st);
      if (st.unlocked) {
        await loadList();
      } else {
        setLoading(false);
        setList([]);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- gate on role + permission
  }, [roleLoading, canUseEnquiries, isSuperAdmin, fetchAccessStatus]);

  const handleUnlock = async (e) => {
    e.preventDefault();
    const code = unlockCells.join("").replace(/\D/g, "");
    if (!apiBase || code.length !== 4) {
      toast.error("Enter the 4-digit code.");
      return;
    }
    setUnlockBusy(true);
    try {
      const res = await fetch(`${apiBase}admin-portal/auth/unlock-enquiries`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      let data = {};
      try {
        data = await res.json();
      } catch {
        /* ignore */
      }
      if (!res.ok) {
        toast.error(data.message || "Could not unlock enquiries.");
        return;
      }
      toast.success("Unlocked. You can manage enquiries until the session expires.");
      setUnlockCells(["", "", "", ""]);
      setAccessStatus((prev) =>
        prev ? { ...prev, unlocked: true } : { unlocked: true },
      );
      await loadList();
    } catch (err) {
      console.error(err);
      toast.error("Unlock request failed.");
    } finally {
      setUnlockBusy(false);
    }
  };

  const handleUnlockDigitChange = (index, raw) => {
    const digit = String(raw).replace(/\D/g, "").slice(-1);
    setUnlockCells((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < 3) {
      unlockInputRefs[index + 1].current?.focus();
    }
  };

  const handleUnlockDigitKeyDown = (index, e) => {
    if (e.key !== "Backspace") return;
    if (unlockCells[index]) {
      setUnlockCells((prev) => {
        const next = [...prev];
        next[index] = "";
        return next;
      });
      e.preventDefault();
      return;
    }
    if (index > 0) {
      unlockInputRefs[index - 1].current?.focus();
      setUnlockCells((prev) => {
        const next = [...prev];
        next[index - 1] = "";
        return next;
      });
      e.preventDefault();
    }
  };

  const handleUnlockPaste = (e) => {
    e.preventDefault();
    const t = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    const next = ["", "", "", ""];
    for (let i = 0; i < t.length; i++) next[i] = t[i];
    setUnlockCells(next);
    const focusAt = Math.min(t.length, 3);
    requestAnimationFrame(() => unlockInputRefs[focusAt].current?.focus());
  };

  const projectLookups = useMemo(() => buildProjectLookups(projects), [projects]);
  const cityStateMap = useMemo(() => buildCityStateMap(cities), [cities]);

  const enrichedList = useMemo(
    () => list.map((row) => enrichEnquiryWithProject(row, projectLookups, cityStateMap)),
    [list, projectLookups, cityStateMap],
  );

  const filterOptions = useMemo(() => {
    const citySet = new Set();
    const stateSet = new Set();
    enrichedList.forEach((row) => {
      if (row.projectCity) citySet.add(String(row.projectCity).trim());
      if (row.projectState) stateSet.add(String(row.projectState).trim());
    });
    return {
      cities: Array.from(citySet).sort((a, b) => a.localeCompare(b)),
      states: Array.from(stateSet).sort((a, b) => a.localeCompare(b)),
      months: buildMonthFilterOptions(enrichedList),
    };
  }, [enrichedList]);

  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matched = enrichedList.filter((row) => {
      if (filterCity && String(row.projectCity || "").trim() !== filterCity) {
        return false;
      }
      if (filterState && String(row.projectState || "").trim() !== filterState) {
        return false;
      }
      if (!matchesPriceFilter(row, filterPrice)) {
        return false;
      }
      if (filterMonth && enquiryMonthKey(row) !== filterMonth) {
        return false;
      }
      if (filterLeadType === "exclude_test" && isTestLead(row)) {
        return false;
      }
      if (filterLeadType === "test_only" && !isTestLead(row)) {
        return false;
      }
      if (!q) return true;
      const blob = [
        row.name,
        row.email,
        row.phone,
        row.message,
        row.enquiryFrom,
        row.pageName,
        row.projectLink,
        row.projectLocation,
        row.projectPrice,
        row.projectCity,
        row.projectState,
        row.status,
        enquirySource(row),
        String(row.id ?? ""),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
    return [...matched].sort(
      (a, b) => enquirySortTimeMs(b) - enquirySortTimeMs(a),
    );
  }, [enrichedList, search, filterCity, filterState, filterPrice, filterMonth, filterLeadType]);

  useEffect(() => {
    setPage(0);
  }, [search, filterCity, filterState, filterPrice, filterMonth, filterLeadType]);

  const pageCount = Math.max(1, Math.ceil(filteredList.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageSlice = useMemo(() => {
    const start = safePage * PAGE_SIZE;
    return filteredList.slice(start, start + PAGE_SIZE);
  }, [filteredList, safePage]);

  const activeFilterCount = [
    filterCity,
    filterState,
    filterPrice,
    filterMonth,
    search.trim(),
    filterLeadType !== "exclude_test" ? filterLeadType : "",
  ].filter(Boolean).length;

  const enquiryStats = useMemo(() => {
    const withProject = enrichedList.filter((row) => row.projectLocation || row.projectCity).length;
    const testLeads = enrichedList.filter(isTestLead).length;
    return {
      total: list.length,
      filtered: filteredList.length,
      withProject,
      cities: filterOptions.cities.length,
      testLeads,
    };
  }, [list.length, filteredList.length, enrichedList, filterOptions.cities.length]);

  const openConfirmationDialog = (rowId) => {
    setConfirmBox(true);
    setId(rowId);
  };

  const exportToExcel = async () => {
    const exportRows = filteredList.map((row, i) => ({
      index: i + 1,
      name: row.name,
      email: row.email,
      phone: row.phone,
      message: row.message,
      enquiryFrom: enquirySource(row),
      projectLocation: row.projectLocation,
      projectPrice: formatMpfProjectPrice(row.projectPrice),
      projectCity: row.projectCity,
      projectState: row.projectState,
      projectLink: row.projectLink,
      pageName: row.pageName,
      date: formatEnquiryDate(row),
      status: row.status,
    }));
    exportTOExcel(exportRows, "Enquiries");
    toast.success("Enquiries exported successfully...");
  };

  const handleStatusChange = async (newStatus, enquiryId) => {
    if (!apiBase) return;
    try {
      const response = await fetch(
        `${apiBase}enquiry/update-status/${enquiryId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (response.ok) {
        toast.success(`Status updated to ${newStatus} successfully`);
        await loadList();
      } else if (response.status === 403) {
        toast.error(
          "Enquiries access denied. Unlock again with your 4-digit code if needed.",
        );
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error updating status");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Shared: "#e3f2fd",
      Test: "#fff3e0",
      New: "#e8f5e8",
      Pending: "#fff8e1",
      Rejected: "#ffebee",
      Duplicate: "#f5f5f5",
      Irrelevant: "#f3e5f5",
    };
    return colors[status] || "#f8f9fa";
  };

  const getStatusTextColor = (status) => {
    const colors = {
      Shared: "#1565c0",
      Test: "#ef6c00",
      New: "#2e7d32",
      Pending: "#f57f17",
      Rejected: "#c62828",
      Duplicate: "#616161",
      Irrelevant: "#7b1fa2",
    };
    return colors[status] || "#424242";
  };

  const statusOptions = [
    "New",
    "Shared",
    "Test",
    "Pending",
    "Rejected",
    "Duplicate",
    "Irrelevant",
  ];

  const showUnlockGate =
    canUseEnquiries &&
    !isSuperAdmin &&
    accessStatus &&
    !accessStatus.fetchFailed &&
    accessStatus.hasPermission &&
    !accessStatus.unlocked;

  const showTable =
    canUseEnquiries &&
    (isSuperAdmin || (accessStatus && accessStatus.unlocked));

  useEffect(() => {
    if (!showUnlockGate) return;
    const t = setTimeout(() => unlockInputRefs[0].current?.focus(), 120);
    return () => clearTimeout(t);
  }, [showUnlockGate]);

  if (roleLoading || (canUseEnquiries && !isSuperAdmin && accessStatus === null)) {
    return <AdminLoader fullPage label="Loading enquiries…" size="lg" />;
  }

  return (
    <div className="admin-page-surface enquiries-page">
      <DashboardHeader
        heading="Manage Enquiries"
        pageStyle="executivePlain"
        exportExcel={showTable && !loading ? "Export to Excel" : undefined}
        exportFunction={exportToExcel}
      />
      {!canUseEnquiries ? (
        <div className="alert alert-warning mt-3">
          You do not have permission to manage enquiries. Ask a Super Admin to
          assign &quot;Manage enquiries&quot; in Manage Users.
        </div>
      ) : null}

      {canUseEnquiries && !isSuperAdmin && accessStatus?.fetchFailed ? (
        <div className="alert alert-danger mt-3">
          Could not verify enquiries access. Check your connection and refresh
          the page.
        </div>
      ) : null}

      {showUnlockGate ? (
        <div className="enquiries-unlock-shell">
          <div className="enquiries-unlock-card">
            <div className="enquiries-unlock-icon-ring" aria-hidden>
              <FontAwesomeIcon icon={faLock} />
            </div>
            <h2 className="enquiries-unlock-title">Unlock enquiries</h2>
            <p className="enquiries-unlock-lead">
              Enter the 4-digit code your Super Admin shared with you. After
              unlocking, you can view and update leads until the session expires
              or you log out.
            </p>
            <Form onSubmit={handleUnlock} className="text-start">
              <span className="enquiries-unlock-pin-label" id="enquiries-pin-label">
                Access code
              </span>
              <div
                className="enquiries-unlock-pin-row"
                onPaste={handleUnlockPaste}
                role="group"
                aria-labelledby="enquiries-pin-label"
              >
                {[0, 1, 2, 3].map((i) => (
                  <input
                    key={i}
                    ref={unlockInputRefs[i]}
                    type="password"
                    inputMode="numeric"
                    autoComplete={i === 0 ? "one-time-code" : "off"}
                    name={i === 0 ? "enquiry-pin-0" : undefined}
                    maxLength={1}
                    className="enquiries-unlock-digit"
                    value={unlockCells[i]}
                    disabled={unlockBusy}
                    onChange={(e) => handleUnlockDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleUnlockDigitKeyDown(i, e)}
                    onFocus={(e) => e.target.select()}
                    aria-label={`Digit ${i + 1} of 4`}
                  />
                ))}
              </div>
              <button
                type="submit"
                className="enquiries-unlock-submit"
                disabled={unlockBusy || unlockCells.join("").length !== 4}
              >
                {unlockBusy ? "Verifying…" : "Unlock enquiries"}
              </button>
              <p className="enquiries-unlock-foot mb-0">
                Tip: you can paste the full code at once into any box.
              </p>
            </Form>
          </div>
        </div>
      ) : null}

      {loading && showTable ? (
        <AdminLoader fullPage label="Loading enquiries…" size="lg" />
      ) : null}

      {!loading && showTable ? (
        <div className="enquiries-content mt-2">
          <div className="enquiries-metrics" aria-label="Enquiry summary">
            <div className="enquiries-metrics__item">
              <span className="enquiries-metrics__value">{enquiryStats.total}</span>
              <span className="enquiries-metrics__label">Total</span>
            </div>
            <div className="enquiries-metrics__item">
              <span className="enquiries-metrics__value">{enquiryStats.filtered}</span>
              <span className="enquiries-metrics__label">Matching</span>
            </div>
            <div className="enquiries-metrics__item">
              <span className="enquiries-metrics__value">{enquiryStats.withProject}</span>
              <span className="enquiries-metrics__label">With project</span>
            </div>
            <div className="enquiries-metrics__item">
              <span className="enquiries-metrics__value">{enquiryStats.testLeads}</span>
              <span className="enquiries-metrics__label">Test leads</span>
            </div>
          </div>

          <div className="enquiries-filter-panel">
            <div className="enquiries-filter-panel__top">
              <InputGroup className="enquiries-search">
                <InputGroup.Text className="enquiries-search__icon">
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                </InputGroup.Text>
                <Form.Control
                  type="search"
                  placeholder="Search name, email, phone, location, city, state, price…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search enquiries"
                  className="enquiries-search__input"
                />
              </InputGroup>
              <div className="enquiries-filter-panel__meta">
                <span className="enquiries-result-count">
                  Showing <strong>{filteredList.length}</strong> of <strong>{list.length}</strong>
                  {filteredList.length > PAGE_SIZE ? (
                    <> · Page <strong>{safePage + 1}</strong> of <strong>{pageCount}</strong></>
                  ) : null}
                </span>
              </div>
            </div>

            <div className="enquiries-filter-panel__filters">
              <div className="enquiries-filter-chip-group">
                <span className="enquiries-filter-chip-group__label">
                  <FontAwesomeIcon icon={faFilter} /> Filters
                </span>
                <FilterDropdown
                  label="All cities"
                  value={filterCity}
                  onChange={setFilterCity}
                  ariaLabel="Filter by city"
                  options={[
                    { value: "", label: "All cities" },
                    ...filterOptions.cities.map((city) => ({ value: city, label: city })),
                  ]}
                />
                <FilterDropdown
                  label="All states"
                  value={filterState}
                  onChange={setFilterState}
                  ariaLabel="Filter by state"
                  options={[
                    { value: "", label: "All states" },
                    ...filterOptions.states.map((state) => ({ value: state, label: state })),
                  ]}
                />
                <FilterDropdown
                  label="All prices"
                  value={filterPrice}
                  onChange={setFilterPrice}
                  ariaLabel="Filter by price"
                  options={PRICE_FILTER_OPTIONS}
                />
                <FilterDropdown
                  label="All months"
                  value={filterMonth}
                  onChange={setFilterMonth}
                  ariaLabel="Filter by month"
                  options={filterOptions.months}
                />
                <FilterDropdown
                  label="Hide test leads"
                  value={filterLeadType}
                  onChange={setFilterLeadType}
                  ariaLabel="Filter test leads"
                  options={LEAD_TYPE_FILTER_OPTIONS}
                />
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    className="enquiries-clear-filters"
                    onClick={() => {
                      setFilterCity("");
                      setFilterState("");
                      setFilterPrice("");
                      setFilterMonth("");
                      setFilterLeadType("exclude_test");
                      setSearch("");
                    }}
                  >
                    Clear {activeFilterCount} filter{activeFilterCount === 1 ? "" : "s"}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="manage-users-table-scroll enquiries-table-wrap">
            <table className="table manage-users-compact-table enquiries-table mb-0">
              <thead>
                <tr>
                  <th style={{ width: 44 }}>#</th>
                  <th style={{ minWidth: 160 }}>Lead</th>
                  <th style={{ minWidth: 220 }}>Property</th>
                  <th style={{ minWidth: 140 }}>Message</th>
                  <th style={{ width: 90 }}>Source</th>
                  <th style={{ minWidth: 180 }}>Source Page</th>
                  <th style={{ width: 120 }}>When</th>
                  <th style={{ width: 130 }}>Status</th>
                  <th style={{ width: 52 }} className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {pageSlice.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="enquiries-empty">
                      <FontAwesomeIcon icon={faInbox} className="enquiries-empty__icon" />
                      <p>No enquiries match your search.</p>
                    </td>
                  </tr>
                ) : (
                  pageSlice.map((row, idx) => {
                    const src = enquirySource(row);
                    const when = formatEnquiryDate(row);
                    const st = row.status || "New";
                    const rowNum = safePage * PAGE_SIZE + idx + 1;
                    const sourcePageLink = getSourcePageLink(row);
                    const priceLabel = formatMpfProjectPrice(row.projectPrice);
                    const locationLine = [row.projectCity, row.projectState].filter(Boolean).join(" · ");
                    return (
                      <tr key={row.id} className="enquiries-row">
                        <td className="enquiries-row__num">{rowNum}</td>
                        <td>
                          <div className="enquiries-lead">
                            <div className="enquiries-lead__name">{row.name || "—"}</div>
                            {row.email ? (
                              <a href={`mailto:${row.email}`} className="enquiries-lead__line">
                                <FontAwesomeIcon icon={faEnvelope} />
                                <span>{row.email}</span>
                              </a>
                            ) : null}
                            {row.phone ? (
                              <a href={`tel:${row.phone}`} className="enquiries-lead__line enquiries-lead__line--phone">
                                <FontAwesomeIcon icon={faPhone} />
                                <span>{row.phone}</span>
                              </a>
                            ) : null}
                          </div>
                        </td>
                        <td>
                          <div className="enquiries-property">
                            <div className="enquiries-property__location" title={row.projectLocation || ""}>
                              <FontAwesomeIcon icon={faLocationDot} />
                              <span>{row.projectLocation || "—"}</span>
                            </div>
                            {locationLine ? (
                              <div className="enquiries-property__meta">{locationLine}</div>
                            ) : null}
                            {priceLabel !== "—" ? (
                              <span className="enquiries-price-badge">{priceLabel}</span>
                            ) : null}
                          </div>
                        </td>
                        <td>
                          <div className="enquiries-message" title={row.message || ""}>
                            {row.message ? truncate(row.message, 90) : "—"}
                          </div>
                        </td>
                        <td>
                          <span className={`enquiries-source-pill ${src === "App" ? "is-app" : "is-web"}`}>
                            {src}
                          </span>
                        </td>
                        <td>
                          {sourcePageLink ? (
                            <a
                              href={sourcePageLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="enquiries-page-url"
                              title={sourcePageLink}
                            >
                              <span className="enquiries-page-url__text">
                                {truncate(sourcePageLink.replace(/^https?:\/\//i, ""), 42)}
                              </span>
                              <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                            </a>
                          ) : row.pageName ? (
                            <span className="enquiries-source-page" title={row.pageName}>
                              {truncate(row.pageName, 28)}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>
                          <div className="enquiries-when">{when}</div>
                        </td>
                        <td>
                          <StatusDropdown
                            currentStatus={st}
                            options={statusOptions}
                            onSelect={(newStatus) => handleStatusChange(newStatus, row.id)}
                            getStatusColor={getStatusColor}
                            getStatusTextColor={getStatusTextColor}
                          />
                        </td>
                        <td className="text-center">
                          <button
                            type="button"
                            className="admin-grid-action admin-grid-action--delete enquiries-delete-btn"
                            onClick={() => openConfirmationDialog(row.id)}
                            aria-label="Delete enquiry"
                          >
                            <img src="/images/admin/delete.svg" alt="" width={12} height={14} style={{ filter: "brightness(10)" }} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {filteredList.length > PAGE_SIZE ? (
            <div className="enquiries-pagination">
              <Button
                variant="outline-secondary"
                size="sm"
                disabled={safePage <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <span className="enquiries-pagination__label">
                Page {safePage + 1} of {pageCount}
              </span>
              <Button
                variant="outline-secondary"
                size="sm"
                disabled={safePage >= pageCount - 1}
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              >
                Next
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      <CommonModal
        api={`${apiBase}enquiry/delete/${id}`}
        setConfirmBox={setConfirmBox}
        confirmBox={confirmBox}
        fetchAllHeadersList={loadList}
      />
    </div>
  );
}

