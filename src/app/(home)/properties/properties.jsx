"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  Navigation,
  Pagination as SwiperPagination,
  Autoplay,
} from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronUp,
  faChevronDown,
  faXmark,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { Spinner } from "react-bootstrap";
import axios from "axios";
import "./properties.css";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Properties() {
  const [activeTab, setActiveTab] = useState("All Properties");
  const [sortBy, setSortBy] = useState("");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isMobileSortDropdownOpen, setIsMobileSortDropdownOpen] =
    useState(false);
  const sortDropdownRef = useRef(null);
  const mobileSortDropdownRef = useRef(null);
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [likedProperties, setLikedProperties] = useState([]);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState([]);
  const [selectedBedrooms, setSelectedBedrooms] = useState([]);
  const [selectedConstructionStatuses, setSelectedConstructionStatuses] =
    useState([]);
  const [selectedListingTypes, setSelectedListingTypes] = useState([]);
  const [selectedSubTypes, setSelectedSubTypes] = useState([]);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedLocalities, setSelectedLocalities] = useState([]);
  const [selectedBuilders, setSelectedBuilders] = useState([]);
  const [selectedBathrooms, setSelectedBathrooms] = useState([]);
  const [selectedFurnished, setSelectedFurnished] = useState([]);
  const [selectedParking, setSelectedParking] = useState([]);
  const [selectedFacing, setSelectedFacing] = useState([]);
  const [areaMin, setAreaMin] = useState("");
  const [areaMax, setAreaMax] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    budget: true,
    propertyType: true,
    bedrooms: true,
    constructionStatus: true,
    listingType: false,
    subType: false,
    transaction: false,
    location: false,
    area: false,
    additional: false,
    furnished: false,
    parking: false,
    facing: false,
  });
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Toggle mobile filter modal
  const toggleMobileFilter = () => {
    setIsMobileFilterOpen(!isMobileFilterOpen);
    // Prevent body scroll and hide chatbot when modal is open
    if (!isMobileFilterOpen) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("properties-filter-modal-open");
    } else {
      document.body.style.overflow = "unset";
      document.body.classList.remove("properties-filter-modal-open");
    }
  };

  // Close mobile filter modal
  const closeMobileFilter = () => {
    setIsMobileFilterOpen(false);
    document.body.style.overflow = "unset";
    document.body.classList.remove("properties-filter-modal-open");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = "unset";
      document.body.classList.remove("properties-filter-modal-open");
    };
  }, []);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Fetch properties from API
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_BASE_URL}public/properties`);

        if (response.data.success && Array.isArray(response.data.properties)) {
          const transformedProperties = response.data.properties.map(
            (property) => {
              const locationParts = [];
              if (property.address) locationParts.push(property.address);
              if (property.locality) locationParts.push(property.locality);
              if (property.city) locationParts.push(property.city);

              const formatPrice = (price) => {
                if (!price && price !== 0) return "Price on request";
                const numPrice =
                  typeof price === "string" ? parseFloat(price) : price;
                if (isNaN(numPrice)) return "Price on request";
                if (numPrice >= 10000000) {
                  return `₹${(numPrice / 10000000).toFixed(2)} Cr`;
                } else if (numPrice >= 100000) {
                  return `₹${(numPrice / 100000).toFixed(2)} L`;
                }
                return `₹${Math.round(numPrice).toLocaleString("en-IN")}`;
              };

              const formatPricePerSqft = (price) => {
                if (!price) return null;
                return `₹${Math.round(price).toLocaleString("en-IN")} per sqft`;
              };

              const getBedroomLabel = (bedrooms) => {
                if (!bedrooms) return null;
                if (bedrooms === 1) return "1 RK/1 BHK";
                return `${bedrooms} BHK`;
              };

              const mapStatus = (status) => {
                if (!status) return null;
                if (status.toLowerCase().includes("ready"))
                  return "Ready to move";
                if (status.toLowerCase().includes("construction"))
                  return "Under Construction";
                return "New Launch";
              };

              // Generate slug from title and ID
              const generateSlug = (title, id) => {
                if (!title) return id.toString();
                return (
                  title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, "") +
                  "-" +
                  id
                );
              };

              const propertyTitle =
                property.title ||
                `${getBedroomLabel(property.bedrooms) || ""} ${property.subType || "Property"}`.trim();

              return {
                id: property.id,
                slug: generateSlug(propertyTitle, property.id),
                title: propertyTitle,
                location:
                  locationParts.filter(Boolean).join(", ") ||
                  "Location not specified",
                price: formatPrice(property.totalPrice),
                pricePerSqft: formatPricePerSqft(property.pricePerSqft),
                area:
                  property.carpetArea ||
                  property.builtUpArea ||
                  property.superBuiltUpArea ||
                  property.plotArea,
                areaLabel: property.carpetArea
                  ? "Carpet Area"
                  : property.builtUpArea
                    ? "Built-up Area"
                    : property.superBuiltUpArea
                      ? "Super Built-up Area"
                      : "Plot Area",
                bedrooms: property.bedrooms,
                bedroom: getBedroomLabel(property.bedrooms),
                bathrooms: property.bathrooms,
                balconies: property.balconies,
                facing: property.facing,
                status: property.status,
                constructionStatus: mapStatus(property.status),
                transaction: property.transaction,
                listingType: property.listingType,
                subType: property.subType,
                propertyTypeCategory:
                  property.subType === "Apartment" ||
                  property.subType === "Flat"
                    ? "Residential Apartment"
                    : property.subType || "Residential Apartment",
                furnished: property.furnished,
                image:
                  property.imageUrls && property.imageUrls.length > 0
                    ? property.imageUrls[0]
                    : null,
                imageCount: property.imageUrls ? property.imageUrls.length : 0,
                postedDate: property.createdAt
                  ? new Date(property.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : null,
                verified: property.approvalStatus === "APPROVED",
                numericPrice: property.totalPrice || 0,
                raw: property,
              };
            },
          );
          setProperties(transformedProperties);
        } else {
          setError("Failed to load properties");
        }
      } catch (err) {
        console.error("Error fetching properties:", err);
        setError(err.message || "Failed to load properties");
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Helper function to parse price string to numeric value (in lakhs)
  const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    const str = priceStr.replace(/[₹,]/g, "").trim();
    if (str.includes("Cr")) {
      return parseFloat(str.replace("Cr", "").trim()) * 100; // Convert Cr to lakhs
    } else if (str.includes("L")) {
      return parseFloat(str.replace("L", "").trim());
    }
    return 0;
  };

  // Helper function to parse budget string to numeric value (in lakhs)
  const parseBudget = (budgetStr) => {
    if (!budgetStr || budgetStr.trim() === "") return null;
    return parsePrice(budgetStr);
  };

  // Helper function to get image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;

    // If already a full URL, return as is
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }

    // Handle absolute Windows paths (e.g., D:\path\to\file or D:/path/to/file)
    let cleanImageUrl = imageUrl;
    if (cleanImageUrl.match(/^[A-Za-z]:[\/\\]/)) {
      // Extract relative path from absolute path
      const propertyListingsIndex = cleanImageUrl
        .toLowerCase()
        .indexOf("property-listings");
      if (propertyListingsIndex !== -1) {
        cleanImageUrl = cleanImageUrl.substring(propertyListingsIndex);
      } else {
        console.warn(
          "Could not find property-listings in absolute path:",
          imageUrl,
        );
        return null;
      }
    }

    // Normalize path separators
    cleanImageUrl = cleanImageUrl.replace(/\\/g, "/");

    // Remove leading slash if present
    if (cleanImageUrl.startsWith("/")) {
      cleanImageUrl = cleanImageUrl.slice(1);
    }

    // Remove "uploads/" prefix if present
    if (cleanImageUrl.startsWith("uploads/")) {
      cleanImageUrl = cleanImageUrl.replace("uploads/", "");
    }

    // Split the path: property-listings/{id}/{filename}
    const pathParts = cleanImageUrl.split("/");
    if (pathParts.length >= 3 && pathParts[0] === "property-listings") {
      const listingId = pathParts[1];
      const filename = pathParts.slice(2).join("/");
      const finalUrl = `${API_BASE_URL}get/images/property-listings/${listingId}/${filename}`;
      return finalUrl;
    } else if (pathParts.length === 2) {
      return `${API_BASE_URL}get/images/${pathParts[0]}/${pathParts[1]}`;
    }

    console.warn("Could not parse image URL:", imageUrl);
    return null;
  };

  // Enhanced properties with computed fields
  const enhancedProperties = useMemo(
    () =>
      properties.map((property) => {
        // Get all image URLs for the slider
        const allImageUrls =
          property.raw?.imageUrls && property.raw.imageUrls.length > 0
            ? property.raw.imageUrls
                .map((img) => getImageUrl(img))
                .filter(Boolean)
            : [];

        return {
          ...property,
          numericPrice: property.numericPrice || parsePrice(property.price),
          imageUrl: property.image ? getImageUrl(property.image) : null,
          allImageUrls:
            allImageUrls.length > 0
              ? allImageUrls
              : property.image
                ? [getImageUrl(property.image)].filter(Boolean)
                : [],
        };
      }),
    [properties],
  );

  // Filter handlers
  const togglePropertyType = (type) => {
    setSelectedPropertyTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const toggleBedroom = (bedroom) => {
    setSelectedBedrooms((prev) =>
      prev.includes(bedroom)
        ? prev.filter((b) => b !== bedroom)
        : [...prev, bedroom],
    );
  };

  const toggleConstructionStatus = (status) => {
    setSelectedConstructionStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  const clearPropertyTypes = () => {
    setSelectedPropertyTypes([]);
  };

  const clearBedrooms = () => {
    setSelectedBedrooms([]);
  };

  const clearConstructionStatuses = () => {
    setSelectedConstructionStatuses([]);
  };

  const clearBudget = () => {
    setBudgetMin("");
    setBudgetMax("");
  };

  const toggleLike = (propertyId) => {
    setLikedProperties((prev) =>
      prev.includes(propertyId)
        ? prev.filter((id) => id !== propertyId)
        : [...prev, propertyId],
    );
  };

  const toggleListingType = (type) => {
    setSelectedListingTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const toggleSubType = (type) => {
    setSelectedSubTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const toggleTransaction = (trans) => {
    setSelectedTransactions((prev) =>
      prev.includes(trans) ? prev.filter((t) => t !== trans) : [...prev, trans],
    );
  };

  const toggleCity = (city) => {
    setSelectedCities((prev) => (prev.includes(city) ? [] : [city]));
  };

  const toggleLocality = (locality) => {
    setSelectedLocalities((prev) =>
      prev.includes(locality)
        ? prev.filter((l) => l !== locality)
        : [...prev, locality],
    );
  };

  const toggleBuilder = (builder) => {
    setSelectedBuilders((prev) =>
      prev.includes(builder)
        ? prev.filter((b) => b !== builder)
        : [...prev, builder],
    );
  };

  const toggleBathroom = (bath) => {
    setSelectedBathrooms((prev) => (prev.includes(bath) ? [] : [bath]));
  };

  const toggleFurnished = (furn) => {
    setSelectedFurnished((prev) =>
      prev.includes(furn) ? prev.filter((f) => f !== furn) : [...prev, furn],
    );
  };

  const toggleParking = (park) => {
    setSelectedParking((prev) =>
      prev.includes(park) ? prev.filter((p) => p !== park) : [...prev, park],
    );
  };

  const toggleFacing = (face) => {
    setSelectedFacing((prev) =>
      prev.includes(face)
        ? prev.filter((f) => f !== face)
        : [...prev, face].slice(-2),
    );
  };

  // Get unique values for filter options
  const uniqueValues = useMemo(() => {
    const values = {
      listingTypes: [],
      subTypes: [],
      transactions: [],
      cities: [],
      localities: [],
      builders: [],
      bathrooms: [],
      furnished: [],
      parking: [],
      facing: [],
    };

    enhancedProperties.forEach((property) => {
      if (property.raw) {
        const prop = property.raw;

        if (
          prop.listingType &&
          !values.listingTypes.includes(prop.listingType)
        ) {
          values.listingTypes.push(prop.listingType);
        }

        if (prop.subType && !values.subTypes.includes(prop.subType)) {
          values.subTypes.push(prop.subType);
        }

        if (
          prop.transaction &&
          !values.transactions.includes(prop.transaction)
        ) {
          values.transactions.push(prop.transaction);
        }

        if (prop.city && !values.cities.includes(prop.city)) {
          values.cities.push(prop.city);
        }

        if (prop.locality && !values.localities.includes(prop.locality)) {
          values.localities.push(prop.locality);
        }

        if (prop.builderName && !values.builders.includes(prop.builderName)) {
          values.builders.push(prop.builderName);
        }

        if (prop.bathrooms && !values.bathrooms.includes(prop.bathrooms)) {
          values.bathrooms.push(prop.bathrooms);
        }

        if (prop.furnished && !values.furnished.includes(prop.furnished)) {
          values.furnished.push(prop.furnished);
        }

        if (prop.parking && !values.parking.includes(prop.parking)) {
          values.parking.push(prop.parking);
        }

        if (prop.facing && !values.facing.includes(prop.facing)) {
          values.facing.push(prop.facing);
        }
      }
    });

    // Sort numeric arrays
    values.bathrooms.sort((a, b) => a - b);

    return values;
  }, [enhancedProperties]);

  // Filter and sort logic
  const filteredAndSortedProperties = useMemo(() => {
    let filtered = enhancedProperties.filter((property) => {
      // Budget filter
      // const minBudget = parseBudget(budgetMin);
      // const maxBudget = parseBudget(budgetMax);
      // if (minBudget !== null && property.numericPrice < minBudget) {
      //   return false;
      // }
      // if (maxBudget !== null && property.numericPrice > maxBudget) {
      //   return false;
      // }

      // Property type filter
      if (
        selectedPropertyTypes.length > 0 &&
        !selectedPropertyTypes.includes(property.propertyTypeCategory)
      ) {
        return false;
      }

      // Bedroom filter
      if (
        selectedBedrooms.length > 0 &&
        !selectedBedrooms.includes(property.bedroom)
      ) {
        return false;
      }

      // Construction status filter
      if (selectedConstructionStatuses.length > 0) {
        const propertyStatus = property.constructionStatus;
        if (
          !propertyStatus ||
          !selectedConstructionStatuses.includes(propertyStatus)
        ) {
          return false;
        }
      }

      // Listing type filter
      if (
        selectedListingTypes.length > 0 &&
        property.raw?.listingType &&
        !selectedListingTypes.includes(property.raw.listingType)
      ) {
        return false;
      }

      // Sub type filter
      if (
        selectedSubTypes.length > 0 &&
        property.raw?.subType &&
        !selectedSubTypes.includes(property.raw.subType)
      ) {
        return false;
      }

      // Transaction filter
      if (
        selectedTransactions.length > 0 &&
        property.raw?.transaction &&
        !selectedTransactions.includes(property.raw.transaction)
      ) {
        return false;
      }

      // City filter
      if (
        selectedCities.length > 0 &&
        property.raw?.city &&
        !selectedCities.includes(property.raw.city)
      ) {
        return false;
      }

      // Locality filter
      if (
        selectedLocalities.length > 0 &&
        property.raw?.locality &&
        !selectedLocalities.includes(property.raw.locality)
      ) {
        return false;
      }

      // Builder filter
      if (
        selectedBuilders.length > 0 &&
        property.raw?.builderName &&
        !selectedBuilders.includes(property.raw.builderName)
      ) {
        return false;
      }

      // Bathrooms filter
      if (
        selectedBathrooms.length > 0 &&
        property.bathrooms &&
        !selectedBathrooms.includes(property.bathrooms)
      ) {
        return false;
      }

      // Furnished filter
      if (
        selectedFurnished.length > 0 &&
        property.raw?.furnished &&
        !selectedFurnished.includes(property.raw.furnished)
      ) {
        return false;
      }

      // Parking filter
      if (
        selectedParking.length > 0 &&
        property.raw?.parking &&
        !selectedParking.includes(property.raw.parking)
      ) {
        return false;
      }

      // Facing filter
      if (
        selectedFacing.length > 0 &&
        property.facing &&
        !selectedFacing.includes(property.facing)
      ) {
        return false;
      }

      // Area range filter
      if (areaMin && property.area) {
        const numericArea =
          typeof property.area === "number"
            ? property.area
            : parseFloat(property.area);
        if (!isNaN(numericArea) && numericArea < parseFloat(areaMin)) {
          return false;
        }
      }
      if (areaMax && property.area) {
        const numericArea =
          typeof property.area === "number"
            ? property.area
            : parseFloat(property.area);
        if (!isNaN(numericArea) && numericArea > parseFloat(areaMax)) {
          return false;
        }
      }

      return true;
    });

    // Sort logic
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "Price: Low to High":
          return a.numericPrice - b.numericPrice;
        case "Price: High to Low":
          return b.numericPrice - a.numericPrice;
        case "Newest First":
          // Simple date comparison - you might want to enhance this
          return new Date(b.postedDate) - new Date(a.postedDate);
        default: // Relevance
          return 0;
      }
    });

    return sorted;
  }, [
    budgetMin,
    budgetMax,
    selectedPropertyTypes,
    selectedBedrooms,
    selectedConstructionStatuses,
    selectedListingTypes,
    selectedSubTypes,
    selectedTransactions,
    selectedCities,
    selectedLocalities,
    selectedBuilders,
    selectedBathrooms,
    selectedFurnished,
    selectedParking,
    selectedFacing,
    areaMin,
    areaMax,
    sortBy,
    enhancedProperties,
  ]);

  // Compute applied filters for display
  const appliedFilters = useMemo(() => {
    const filters = [];
    selectedBedrooms.forEach((bedroom) => filters.push(bedroom));
    selectedPropertyTypes.forEach((type) => filters.push(type));
    selectedConstructionStatuses.forEach((status) => filters.push(status));
    selectedListingTypes.forEach((type) => filters.push(type));
    selectedSubTypes.forEach((type) => filters.push(type));
    selectedTransactions.forEach((trans) => filters.push(trans));
    selectedCities.forEach((city) => filters.push(city));
    selectedLocalities.forEach((locality) => filters.push(locality));
    selectedBuilders.forEach((builder) => filters.push(builder));
    selectedBathrooms.forEach((bath) => filters.push(`${bath} Bath`));
    selectedFurnished.forEach((furn) => filters.push(furn));
    selectedParking.forEach((park) => filters.push(park));
    selectedFacing.forEach((face) => filters.push(face));
    if (budgetMin && budgetMin.trim() !== "") filters.push(`Min: ${budgetMin}`);
    if (budgetMax && budgetMax.trim() !== "") filters.push(`Max: ${budgetMax}`);
    if (areaMin) filters.push(`Min Area: ${areaMin} sq ft`);
    if (areaMax) filters.push(`Max Area: ${areaMax} sq ft`);
    return filters;
  }, [
    budgetMin,
    budgetMax,
    areaMin,
    areaMax,
    selectedPropertyTypes,
    selectedBedrooms,
    selectedConstructionStatuses,
    selectedListingTypes,
    selectedSubTypes,
    selectedTransactions,
    selectedCities,
    selectedLocalities,
    selectedBuilders,
    selectedBathrooms,
    selectedFurnished,
    selectedParking,
    selectedFacing,
  ]);

  const removeFilter = (filter) => {
    if (filter.startsWith("Min: ")) {
      setBudgetMin("");
    } else if (filter.startsWith("Max: ")) {
      setBudgetMax("");
    } else if (filter.startsWith("Min Area: ")) {
      setAreaMin("");
    } else if (filter.startsWith("Max Area: ")) {
      setAreaMax("");
    } else if (selectedPropertyTypes.includes(filter)) {
      setSelectedPropertyTypes((prev) => prev.filter((t) => t !== filter));
    } else if (selectedBedrooms.includes(filter)) {
      setSelectedBedrooms((prev) => prev.filter((b) => b !== filter));
    } else if (selectedConstructionStatuses.includes(filter)) {
      setSelectedConstructionStatuses((prev) =>
        prev.filter((s) => s !== filter),
      );
    } else if (selectedListingTypes.includes(filter)) {
      setSelectedListingTypes((prev) => prev.filter((t) => t !== filter));
    } else if (selectedSubTypes.includes(filter)) {
      setSelectedSubTypes((prev) => prev.filter((t) => t !== filter));
    } else if (selectedTransactions.includes(filter)) {
      setSelectedTransactions((prev) => prev.filter((t) => t !== filter));
    } else if (selectedCities.includes(filter)) {
      setSelectedCities((prev) => prev.filter((c) => c !== filter));
    } else if (selectedLocalities.includes(filter)) {
      setSelectedLocalities((prev) => prev.filter((l) => l !== filter));
    } else if (selectedBuilders.includes(filter)) {
      setSelectedBuilders((prev) => prev.filter((b) => b !== filter));
    } else if (
      filter.endsWith(" Bath") &&
      selectedBathrooms.includes(parseInt(filter.replace(" Bath", "")))
    ) {
      setSelectedBathrooms((prev) =>
        prev.filter((b) => b !== parseInt(filter.replace(" Bath", ""))),
      );
    } else if (selectedFurnished.includes(filter)) {
      setSelectedFurnished((prev) => prev.filter((f) => f !== filter));
    } else if (selectedParking.includes(filter)) {
      setSelectedParking((prev) => prev.filter((p) => p !== filter));
    } else if (selectedFacing.includes(filter)) {
      setSelectedFacing((prev) => prev.filter((f) => f !== filter));
    }
  };

  const clearAllFilters = () => {
    setBudgetMin("");
    setBudgetMax("");
    setAreaMin("");
    setAreaMax("");
    setSelectedPropertyTypes([]);
    setSelectedBedrooms([]);
    setSelectedConstructionStatuses([]);
    setSelectedListingTypes([]);
    setSelectedSubTypes([]);
    setSelectedTransactions([]);
    setSelectedCities([]);
    setSelectedLocalities([]);
    setSelectedBuilders([]);
    setSelectedBathrooms([]);
    setSelectedFurnished([]);
    setSelectedParking([]);
    setSelectedFacing([]);
  };

  const propertyTypes = [
    "Residential Apartment",
    "Independent/Builder Floor",
    "Independent House/Villa",
    "Farm House",
    "Serviced Apartments",
  ];

  const bedroomOptions = ["1 RK/1 BHK", "2 BHK", "3 BHK", "4 BHK", "5 BHK"];
  const constructionStatuses = [
    "New Launched",
    "Under Construction",
    "Ready to move",
  ];

  const sortOptions = [
    { value: "Relevance", label: "Relevance" },
    { value: "Price: Low to High", label: "Price: Low to High" },
    { value: "Price: High to Low", label: "Price: High to Low" },
    { value: "Newest First", label: "Newest First" },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target)
      ) {
        setIsSortDropdownOpen(false);
      }
      if (
        mobileSortDropdownRef.current &&
        !mobileSortDropdownRef.current.contains(event.target)
      ) {
        setIsMobileSortDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSortSelect = (value) => {
    setSortBy(value);
    setIsSortDropdownOpen(false);
    setIsMobileSortDropdownOpen(false);
  };

  const generatePrice = (price) => {
    return `₹${price}`;
  };
  const dynamicHeading = useMemo(() => {
    const formatBedroom = (b) => (b === 1 ? "1 RK/1 BHK" : `${b} BHK`);
    const bedroomText =
      selectedBedrooms.length === 1
        ? formatBedroom(selectedBedrooms[0])
        : selectedBedrooms.length > 1
          ? selectedBedrooms
              .slice()
              .sort((a, b) => a - b)
              .map((b) => formatBedroom(b))
              .join(", ")
          : "";
    let typeText = "Properties";
    if (selectedPropertyTypes.length === 1) {
      typeText =
        selectedPropertyTypes[0] === "Residential Apartment"
          ? "Flats"
          : selectedPropertyTypes[0];
    } else if (selectedPropertyTypes.includes("Residential Apartment")) {
      typeText = "Flats";
    }
    const cityText =
      selectedCities.length >= 1 ? `in ${selectedCities[0]}` : "";
    return `${[bedroomText, typeText].filter(Boolean).join(" ")} ${cityText}`.trim();
  }, [selectedBedrooms, selectedPropertyTypes, selectedCities]);

  return (
    <div className="properties-page">
      {/* Breadcrumbs and Tabs Section */}
      <div className="container-fluid bg-white properties-header-section">
        <div className="container">
          {/* Breadcrumbs Row with Title */}
          <div className="properties-header-row">
            <div className="properties-breadcrumb">
              <nav aria-label="breadcrumb">
                <div className="d-flex align-items-center gap-2">
                  <Link href="/" className="breadcrumb-link">
                    Home
                  </Link>
                  <span className="breadcrumb-separator">/</span>
                  <span className="breadcrumb-active">Properties</span>
                </div>
              </nav>
            </div>
            <h1 className="properties-page-title">
              {dynamicHeading || "Properties"}
            </h1>
          </div>

          {/* Property Category Tabs */}
          <div className="properties-category-tabs">
            <button
              className={`category-tab ${activeTab === "All Properties" ? "active" : ""}`}
              onClick={() => setActiveTab("All Properties")}
              aria-label="View All Properties"
            >
              All Properties{" "}
              <span className="tab-count">
                ({filteredAndSortedProperties.length})
              </span>
            </button>
            <button
              className={`category-tab ${activeTab === "Residences" ? "active" : ""}`}
              onClick={() => setActiveTab("Residences")}
              aria-label="View Residences"
            >
              Residences
            </button>
            <button
              className={`category-tab ${activeTab === "Commercial" ? "active" : ""}`}
              onClick={() => setActiveTab("Commercial")}
              aria-label="View Commercial"
            >
              Commercial
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-fluid py-4">
        <div className="container">
          <div className="row properties-content-row">
            {/* Mobile Filter & Sort Row - Only visible on mobile/tablet */}
            <div className="col-12 properties-mobile-controls-wrapper">
              <div className="properties-mobile-controls">
                <button
                  className="properties-mobile-filter-btn"
                  onClick={toggleMobileFilter}
                >
                  <Image
                    src="/icon/filter_icon.svg"
                    alt="Filter"
                    width={18}
                    height={18}
                  />
                  <span className="properties-mobile-filter-text">Filters</span>
                  {appliedFilters.length > 0 && (
                    <span className="properties-mobile-filter-count">
                      {appliedFilters.length}
                    </span>
                  )}
                </button>
                <div
                  className="properties-mobile-sort"
                  ref={mobileSortDropdownRef}
                >
                  <label className="sort-label">Sort by:</label>
                  <div className="custom-sort-dropdown">
                    <button
                      className={`custom-sort-trigger ${isMobileSortDropdownOpen ? "active" : ""}`}
                      onClick={() =>
                        setIsMobileSortDropdownOpen(!isMobileSortDropdownOpen)
                      }
                    >
                      <span className="custom-sort-value">
                        {sortBy || "Select"}
                      </span>
                      <svg
                        className={`custom-sort-arrow ${isMobileSortDropdownOpen ? "rotated" : ""}`}
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M6 9L12 15L18 9"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    {isMobileSortDropdownOpen && (
                      <div className="custom-sort-options">
                        {sortOptions.map((option) => (
                          <button
                            key={option.value}
                            className={`custom-sort-option ${sortBy === option.value ? "selected" : ""}`}
                            onClick={() => handleSortSelect(option.value)}
                          >
                            {option.label}
                            {sortBy === option.value && (
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <path
                                  d="M20 6L9 17L4 12"
                                  stroke="#0d5834"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Filter Modal Overlay */}
            {isMobileFilterOpen && (
              <div
                className="properties-mobile-filter-overlay"
                onClick={closeMobileFilter}
              >
                <div
                  className="properties-mobile-filter-modal"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className="properties-mobile-filter-header">
                    <div className="properties-mobile-filter-title">
                      <Image
                        src="/icon/filter_icon.svg"
                        alt="Filter"
                        width={20}
                        height={20}
                      />
                      <span>Filters</span>
                    </div>
                    <button
                      className="properties-mobile-filter-close"
                      onClick={closeMobileFilter}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>

                  {/* Modal Body - Scrollable Filter Content */}
                  <div className="properties-mobile-filter-body">
                    {/* Applied Filters */}
                    {appliedFilters.length > 0 && (
                      <div className="filter-section">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <p className="mb-0 fw-bold">Applied Filters</p>
                          <button
                            className="clear-all-btn"
                            onClick={clearAllFilters}
                          >
                            Clear All
                          </button>
                        </div>
                        <div className="d-flex flex-wrap gap-2">
                          {appliedFilters.map((filter, index) => (
                            <span key={index} className="filter-pill">
                              {filter}
                              <button
                                className="filter-remove"
                                onClick={() => removeFilter(filter)}
                              >
                                <FontAwesomeIcon icon={faXmark} />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Budget */}
                    <div className="filter-section">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <p className="budget-title">Budget</p>
                        <button
                          className="btn-link border-0 bg-transparent p-0 toggle-btn"
                          onClick={() => toggleSection("budget")}
                        >
                          <FontAwesomeIcon
                            icon={
                              expandedSections.budget
                                ? faChevronUp
                                : faChevronDown
                            }
                          />
                        </button>
                      </div>
                      {expandedSections.budget && (
                        <div className="budget-inputs">
                          <div className="budget-input-group">
                            <label className="budget-label">Min Budget</label>
                            <input
                              type="text"
                              className="budget-input"
                              onChange={(e) => setBudgetMin(e.target.value)}
                            />
                          </div>
                          <div className="budget-input-group">
                            <label className="budget-label">Max Budget</label>
                            <input
                              type="text"
                              className="budget-input"
                              onChange={(e) => setBudgetMax(e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Type of property */}
                    <div className="filter-section">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <p className="property-type-title">
                            Type of Property
                          </p>
                          {selectedPropertyTypes.length > 0 && (
                            <button
                              className="clear-btn"
                              onClick={clearPropertyTypes}
                            >
                              Clear
                            </button>
                          )}
                        </div>
                        <button
                          className="btn-link border-0 bg-transparent p-0 toggle-btn"
                          onClick={() => toggleSection("propertyType")}
                        >
                          <FontAwesomeIcon
                            icon={
                              expandedSections.propertyType
                                ? faChevronUp
                                : faChevronDown
                            }
                          />
                        </button>
                      </div>
                      {expandedSections.propertyType && (
                        <div className="property-type-list">
                          {propertyTypes.map((type, index) => (
                            <label
                              key={index}
                              className="property-type-checkbox"
                            >
                              <input
                                type="checkbox"
                                checked={selectedPropertyTypes.includes(type)}
                                onChange={() => togglePropertyType(type)}
                                className="property-checkbox-input"
                              />
                              <span className="property-checkbox-label">
                                + {type}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bedrooms */}
                    <div className="filter-section">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <p className="bedrooms-title">Bedrooms</p>
                        <button
                          className="btn-link border-0 bg-transparent p-0 toggle-btn"
                          onClick={() => toggleSection("bedrooms")}
                        >
                          <FontAwesomeIcon
                            icon={
                              expandedSections.bedrooms
                                ? faChevronUp
                                : faChevronDown
                            }
                          />
                        </button>
                      </div>
                      {expandedSections.bedrooms && (
                        <div className="bedrooms-list">
                          {bedroomOptions.map((bedroom, index) => (
                            <button
                              key={index}
                              className={`bedroom-pill-btn ${selectedBedrooms.includes(bedroom) ? "active" : ""}`}
                              onClick={() => toggleBedroom(bedroom)}
                            >
                              {bedroom}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Construction Status */}
                    <div className="filter-section">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <p className="filter-section-title">
                          Construction Status
                        </p>
                        <button
                          className="btn-link border-0 bg-transparent p-0 toggle-btn"
                          onClick={() => toggleSection("constructionStatus")}
                        >
                          <FontAwesomeIcon
                            icon={
                              expandedSections.constructionStatus
                                ? faChevronUp
                                : faChevronDown
                            }
                          />
                        </button>
                      </div>
                      {expandedSections.constructionStatus && (
                        <div className="property-type-list">
                          {constructionStatuses.map((status, index) => (
                            <label
                              key={index}
                              className="property-type-checkbox"
                            >
                              <input
                                type="checkbox"
                                checked={selectedConstructionStatuses.includes(
                                  status,
                                )}
                                onChange={() =>
                                  toggleConstructionStatus(status)
                                }
                                className="property-checkbox-input"
                              />
                              <span className="property-checkbox-label">
                                + {status}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Listing Type */}
                    <div className="filter-section">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <p className="filter-section-title">Listing Type</p>
                        <button
                          className="btn-link border-0 bg-transparent p-0 toggle-btn"
                          onClick={() => toggleSection("listingType")}
                        >
                          <FontAwesomeIcon
                            icon={
                              expandedSections.listingType
                                ? faChevronUp
                                : faChevronDown
                            }
                          />
                        </button>
                      </div>
                      {expandedSections.listingType && (
                        <div className="bedrooms-list">
                          {uniqueValues.listingTypes.map((type, index) => (
                            <button
                              key={index}
                              className={`bedroom-pill-btn ${selectedListingTypes.includes(type) ? "active" : ""}`}
                              onClick={() => toggleListingType(type)}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Location */}
                    <div className="filter-section">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <p className="filter-section-title">Location</p>
                        <button
                          className="btn-link border-0 bg-transparent p-0 toggle-btn"
                          onClick={() => toggleSection("location")}
                        >
                          <FontAwesomeIcon
                            icon={
                              expandedSections.location
                                ? faChevronUp
                                : faChevronDown
                            }
                          />
                        </button>
                      </div>
                      {expandedSections.location && (
                        <>
                          <div className="mb-3">
                            <label className="location-sublabel">City</label>
                            <div className="bedrooms-list">
                              {uniqueValues.cities
                                .slice(0, 10)
                                .map((city, index) => (
                                  <button
                                    key={index}
                                    className={`bedroom-pill-btn ${selectedCities.includes(city) ? "active" : ""}`}
                                    onClick={() => toggleCity(city)}
                                  >
                                    {city}
                                  </button>
                                ))}
                            </div>
                          </div>
                          <div className="mb-3">
                            <label className="location-sublabel">
                              Locality
                            </label>
                            <div className="bedrooms-list">
                              {uniqueValues.localities
                                .slice(0, 10)
                                .map((locality, index) => (
                                  <button
                                    key={index}
                                    className={`bedroom-pill-btn ${selectedLocalities.includes(locality) ? "active" : ""}`}
                                    onClick={() => toggleLocality(locality)}
                                  >
                                    {locality}
                                  </button>
                                ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Area Range */}
                    <div className="filter-section">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <p className="filter-section-title">Area (sq ft)</p>
                        <button
                          className="btn-link border-0 bg-transparent p-0 toggle-btn"
                          onClick={() => toggleSection("area")}
                        >
                          <FontAwesomeIcon
                            icon={
                              expandedSections.area
                                ? faChevronUp
                                : faChevronDown
                            }
                          />
                        </button>
                      </div>
                      {expandedSections.area && (
                        <div className="budget-inputs">
                          <div className="budget-input-group">
                            <label className="budget-label">Min Area</label>
                            <input
                              type="text"
                              className="budget-input"
                              value={areaMin}
                              onChange={(e) => setAreaMin(e.target.value)}
                            />
                          </div>
                          <div className="budget-input-group">
                            <label className="budget-label">Max Area</label>
                            <input
                              type="text"
                              className="budget-input"
                              value={areaMax}
                              onChange={(e) => setAreaMax(e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bathrooms */}
                    <div className="filter-section">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <p className="filter-section-title">Bathrooms</p>
                        <button
                          className="btn-link border-0 bg-transparent p-0 toggle-btn"
                          onClick={() => toggleSection("additional")}
                        >
                          <FontAwesomeIcon
                            icon={
                              expandedSections.additional
                                ? faChevronUp
                                : faChevronDown
                            }
                          />
                        </button>
                      </div>
                      {expandedSections.additional && (
                        <div className="bedrooms-list">
                          {uniqueValues.bathrooms.map((bath, index) => (
                            <button
                              key={index}
                              className={`bedroom-pill-btn ${selectedBathrooms.includes(bath) ? "active" : ""}`}
                              onClick={() => toggleBathroom(bath)}
                            >
                              {bath} Bath
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Furnished */}
                    <div className="filter-section">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <p className="filter-section-title">Furnished</p>
                        <button
                          className="btn-link border-0 bg-transparent p-0 toggle-btn"
                          onClick={() => toggleSection("furnished")}
                        >
                          <FontAwesomeIcon
                            icon={
                              expandedSections.furnished
                                ? faChevronUp
                                : faChevronDown
                            }
                          />
                        </button>
                      </div>
                      {expandedSections.furnished && (
                        <div className="bedrooms-list">
                          {uniqueValues.furnished.map((furn, index) => (
                            <button
                              key={index}
                              className={`bedroom-pill-btn ${selectedFurnished.includes(furn) ? "active" : ""}`}
                              onClick={() => toggleFurnished(furn)}
                            >
                              {furn}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="properties-mobile-filter-footer">
                    <button
                      className="properties-mobile-filter-reset"
                      onClick={clearAllFilters}
                    >
                      Reset All
                    </button>
                    <button
                      className="properties-mobile-filter-apply"
                      onClick={closeMobileFilter}
                    >
                      Apply Filters ({filteredAndSortedProperties.length})
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Left Sidebar - Filters (Desktop) */}
            <div className="col-lg-3 mb-4 mb-lg-0 properties-desktop-filters properties-filter-col">
              <div className="filters-sidebar">
                {/* Filters Header - Fixed */}
                <div className="filters-header">
                  <div className="filters-title">
                    <Image
                      src="/icon/filter_icon.svg"
                      alt="Filter"
                      width={20}
                      height={20}
                      className="filter-icon"
                    />
                    <span>Filters</span>
                  </div>
                  <button
                    className="reset-filters-btn"
                    onClick={clearAllFilters}
                  >
                    Reset
                  </button>
                </div>

                {/* Scrollable Filter Sections */}
                <div className="filters-body">
                  {/* Applied Filters */}
                  {appliedFilters.length > 0 && (
                    <div className="filter-section">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <p className="mb-0 fw-bold">Applied Filters</p>
                        <button
                          className="clear-all-btn"
                          onClick={clearAllFilters}
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="d-flex flex-wrap gap-2">
                        {appliedFilters.map((filter, index) => (
                          <span key={index} className="filter-pill">
                            {filter}
                            <button
                              className="filter-remove"
                              onClick={() => removeFilter(filter)}
                            >
                              <FontAwesomeIcon icon={faXmark} />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Budget */}
                  <div className="filter-section">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <p className="budget-title">Budget</p>
                      <button
                        className="btn-link border-0 bg-transparent p-0 toggle-btn"
                        onClick={() => toggleSection("budget")}
                      >
                        <FontAwesomeIcon
                          icon={
                            expandedSections.budget
                              ? faChevronUp
                              : faChevronDown
                          }
                        />
                      </button>
                    </div>
                    {expandedSections.budget && (
                      <div className="budget-inputs">
                        <div className="budget-input-group">
                          <label className="budget-label">Min Budget</label>
                          <input
                            type="text"
                            className="budget-input"
                            // value={budgetMin}
                            onChange={(e) => setBudgetMin(e.target.value)}
                          />
                        </div>
                        <div className="budget-input-group">
                          <label className="budget-label">Max Budget</label>
                          <input
                            type="text"
                            className="budget-input"
                            // value={budgetMax}
                            onChange={(e) => setBudgetMax(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Type of property */}
                  <div className="filter-section">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <p className="property-type-title">
                          Type of Property
                        </p>
                        {selectedPropertyTypes.length > 0 && (
                          <button
                            className="clear-btn"
                            onClick={clearPropertyTypes}
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <button
                        className="btn-link border-0 bg-transparent p-0 toggle-btn"
                        onClick={() => toggleSection("propertyType")}
                      >
                        <FontAwesomeIcon
                          icon={
                            expandedSections.propertyType
                              ? faChevronUp
                              : faChevronDown
                          }
                        />
                      </button>
                    </div>
                    {expandedSections.propertyType && (
                      <div className="property-type-list">
                        {propertyTypes.map((type, index) => (
                          <label key={index} className="property-type-checkbox">
                            <input
                              type="checkbox"
                              checked={selectedPropertyTypes.includes(type)}
                              onChange={() => togglePropertyType(type)}
                              className="property-checkbox-input"
                            />
                            <span className="property-checkbox-label">
                              + {type}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bedrooms */}
                  <div className="filter-section">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <p className="bedrooms-title">Bedrooms</p>
                      <button
                        className="btn-link border-0 bg-transparent p-0 toggle-btn"
                        onClick={() => toggleSection("bedrooms")}
                      >
                        <FontAwesomeIcon
                          icon={
                            expandedSections.bedrooms
                              ? faChevronUp
                              : faChevronDown
                          }
                        />
                      </button>
                    </div>
                    {expandedSections.bedrooms && (
                      <div className="bedrooms-list">
                        {bedroomOptions.map((bedroom, index) => (
                          <button
                            key={index}
                            className={`bedroom-pill-btn ${selectedBedrooms.includes(bedroom) ? "active" : ""}`}
                            onClick={() => toggleBedroom(bedroom)}
                          >
                            {bedroom}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Construction Status */}
                  <div className="filter-section">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <p className="filter-section-title">
                        Construction Status
                      </p>
                      <button
                        className="btn-link border-0 bg-transparent p-0 toggle-btn"
                        onClick={() => toggleSection("constructionStatus")}
                      >
                        <FontAwesomeIcon
                          icon={
                            expandedSections.constructionStatus
                              ? faChevronUp
                              : faChevronDown
                          }
                        />
                      </button>
                    </div>
                    {expandedSections.constructionStatus && (
                      <div className="property-type-list">
                        {constructionStatuses.map((status, index) => (
                          <label key={index} className="property-type-checkbox">
                            <input
                              type="checkbox"
                              checked={selectedConstructionStatuses.includes(
                                status,
                              )}
                              onChange={() => toggleConstructionStatus(status)}
                              className="property-checkbox-input"
                            />
                            <span className="property-checkbox-label">
                              + {status}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Listing Type */}
                  <div className="filter-section">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <p className="filter-section-title">Listing Type</p>
                      <button
                        className="btn-link border-0 bg-transparent p-0 toggle-btn"
                        onClick={() => toggleSection("listingType")}
                      >
                        <FontAwesomeIcon
                          icon={
                            expandedSections.listingType
                              ? faChevronUp
                              : faChevronDown
                          }
                        />
                      </button>
                    </div>
                    {expandedSections.listingType && (
                      <div className="bedrooms-list">
                        {uniqueValues.listingTypes.map((type, index) => (
                          <button
                            key={index}
                            className={`bedroom-pill-btn ${selectedListingTypes.includes(type) ? "active" : ""}`}
                            onClick={() => toggleListingType(type)}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Sub Type */}
                  <div className="filter-section">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <p className="filter-section-title">Sub Type</p>
                      <button
                        className="btn-link border-0 bg-transparent p-0 toggle-btn"
                        onClick={() => toggleSection("subType")}
                      >
                        <FontAwesomeIcon
                          icon={
                            expandedSections.subType
                              ? faChevronUp
                              : faChevronDown
                          }
                        />
                      </button>
                    </div>
                    {expandedSections.subType && (
                      <div className="property-type-list">
                        {uniqueValues.subTypes.map((type, index) => (
                          <label key={index} className="property-type-checkbox">
                            <input
                              type="checkbox"
                              checked={selectedSubTypes.includes(type)}
                              onChange={() => toggleSubType(type)}
                              className="property-checkbox-input"
                            />
                            <span className="property-checkbox-label">
                              + {type}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Transaction */}
                  <div className="filter-section">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <p className="filter-section-title">Transaction</p>
                      <button
                        className="btn-link border-0 bg-transparent p-0 toggle-btn"
                        onClick={() => toggleSection("transaction")}
                      >
                        <FontAwesomeIcon
                          icon={
                            expandedSections.transaction
                              ? faChevronUp
                              : faChevronDown
                          }
                        />
                      </button>
                    </div>
                    {expandedSections.transaction && (
                      <div className="bedrooms-list">
                        {uniqueValues.transactions.map((trans, index) => (
                          <button
                            key={index}
                            className={`bedroom-pill-btn ${selectedTransactions.includes(trans) ? "active" : ""}`}
                            onClick={() => toggleTransaction(trans)}
                          >
                            {trans}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Location */}
                  <div className="filter-section">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <p className="filter-section-title">Location</p>
                      <button
                        className="btn-link border-0 bg-transparent p-0 toggle-btn"
                        onClick={() => toggleSection("location")}
                      >
                        <FontAwesomeIcon
                          icon={
                            expandedSections.location
                              ? faChevronUp
                              : faChevronDown
                          }
                        />
                      </button>
                    </div>
                    {expandedSections.location && (
                      <>
                        <div className="mb-3">
                          <label className="location-sublabel">City</label>
                          <div className="bedrooms-list">
                            {uniqueValues.cities
                              .slice(0, 10)
                              .map((city, index) => (
                                <button
                                  key={index}
                                  className={`bedroom-pill-btn ${selectedCities.includes(city) ? "active" : ""}`}
                                  onClick={() => toggleCity(city)}
                                >
                                  {city}
                                </button>
                              ))}
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="location-sublabel">Locality</label>
                          <div className="bedrooms-list">
                            {uniqueValues.localities
                              .slice(0, 10)
                              .map((locality, index) => (
                                <button
                                  key={index}
                                  className={`bedroom-pill-btn ${selectedLocalities.includes(locality) ? "active" : ""}`}
                                  onClick={() => toggleLocality(locality)}
                                >
                                  {locality}
                                </button>
                              ))}
                          </div>
                        </div>
                        <div>
                          <label className="location-sublabel">Builder</label>
                          <div className="bedrooms-list">
                            {uniqueValues.builders
                              .slice(0, 10)
                              .map((builder, index) => (
                                <button
                                  key={index}
                                  className={`bedroom-pill-btn ${selectedBuilders.includes(builder) ? "active" : ""}`}
                                  onClick={() => toggleBuilder(builder)}
                                >
                                  {builder}
                                </button>
                              ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Area Range */}
                  <div className="filter-section">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <p className="filter-section-title">Area (sq ft)</p>
                      <button
                        className="btn-link border-0 bg-transparent p-0 toggle-btn"
                        onClick={() => toggleSection("area")}
                      >
                        <FontAwesomeIcon
                          icon={
                            expandedSections.area ? faChevronUp : faChevronDown
                          }
                        />
                      </button>
                    </div>
                    {expandedSections.area && (
                      <div className="budget-inputs">
                        <div className="budget-input-group">
                          <label className="budget-label">Min Area</label>
                          <input
                            type="text"
                            className="budget-input"
                            value={areaMin}
                            onChange={(e) => setAreaMin(e.target.value)}
                          />
                        </div>
                        <div className="budget-input-group">
                          <label className="budget-label">Max Area</label>
                          <input
                            type="text"
                            className="budget-input"
                            value={areaMax}
                            onChange={(e) => setAreaMax(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Additional Filters */}
                  <div className="filter-section">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <p className="filter-section-title">Bathrooms</p>
                      <button
                        className="btn-link border-0 bg-transparent p-0 toggle-btn"
                        onClick={() => toggleSection("additional")}
                      >
                        <FontAwesomeIcon
                          icon={
                            expandedSections.additional
                              ? faChevronUp
                              : faChevronDown
                          }
                        />
                      </button>
                    </div>
                    {expandedSections.additional && (
                      <div className="bedrooms-list">
                        {uniqueValues.bathrooms.map((bath, index) => (
                          <button
                            key={index}
                            className={`bedroom-pill-btn ${selectedBathrooms.includes(bath) ? "active" : ""}`}
                            onClick={() => toggleBathroom(bath)}
                          >
                            {bath} Bath
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Furnished */}
                  <div className="filter-section">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <p className="filter-section-title">Furnished</p>
                      <button
                        className="btn-link border-0 bg-transparent p-0 toggle-btn"
                        onClick={() => toggleSection("furnished")}
                      >
                        <FontAwesomeIcon
                          icon={
                            expandedSections.furnished
                              ? faChevronUp
                              : faChevronDown
                          }
                        />
                      </button>
                    </div>
                    {expandedSections.furnished && (
                      <div className="bedrooms-list">
                        {uniqueValues.furnished.map((furn, index) => (
                          <button
                            key={index}
                            className={`bedroom-pill-btn ${selectedFurnished.includes(furn) ? "active" : ""}`}
                            onClick={() => toggleFurnished(furn)}
                          >
                            {furn}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Parking */}
                  <div className="filter-section">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <p className="filter-section-title">Parking</p>
                      <button
                        className="btn-link border-0 bg-transparent p-0 toggle-btn"
                        onClick={() => toggleSection("parking")}
                      >
                        <FontAwesomeIcon
                          icon={
                            expandedSections.parking
                              ? faChevronUp
                              : faChevronDown
                          }
                        />
                      </button>
                    </div>
                    {expandedSections.parking && (
                      <div className="bedrooms-list">
                        {uniqueValues.parking.map((park, index) => (
                          <button
                            key={index}
                            className={`bedroom-pill-btn ${selectedParking.includes(park) ? "active" : ""}`}
                            onClick={() => toggleParking(park)}
                          >
                            {park}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Facing */}
                  <div className="filter-section">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <p className="filter-section-title">Facing</p>
                      <button
                        className="btn-link border-0 bg-transparent p-0 toggle-btn"
                        onClick={() => toggleSection("facing")}
                      >
                        <FontAwesomeIcon
                          icon={
                            expandedSections.facing
                              ? faChevronUp
                              : faChevronDown
                          }
                        />
                      </button>
                    </div>
                    {expandedSections.facing && (
                      <div className="bedrooms-list">
                        {uniqueValues.facing.map((face, index) => (
                          <button
                            key={index}
                            className={`bedroom-pill-btn ${selectedFacing.includes(face) ? "active" : ""}`}
                            onClick={() => toggleFacing(face)}
                          >
                            {face}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content - Property Listings */}
            <div className="col-lg-9">
              {/* Properties Header */}
              <div className="properties-list-header">
                <div className="properties-list-header-left">
                  <h2 className="properties-list-title">
                    {filteredAndSortedProperties.length} results |{" "}
                    {dynamicHeading || "Properties"}
                  </h2>
                  <p className="properties-list-subtitle">
                    Find your perfect property from our curated listings
                  </p>
                </div>
                <div
                  className="properties-list-header-right"
                  ref={sortDropdownRef}
                >
                  <label className="sort-label">Sort by:</label>
                  <div className="custom-sort-dropdown custom-sort-dropdown-desktop">
                    <button
                      className={`custom-sort-trigger ${isSortDropdownOpen ? "active" : ""}`}
                      onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                    >
                      <span className="custom-sort-value">
                        {sortBy || "Select"}
                      </span>
                      <svg
                        className={`custom-sort-arrow ${isSortDropdownOpen ? "rotated" : ""}`}
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M6 9L12 15L18 9"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    {isSortDropdownOpen && (
                      <div className="custom-sort-options">
                        {sortOptions.map((option) => (
                          <button
                            key={option.value}
                            className={`custom-sort-option ${sortBy === option.value ? "selected" : ""}`}
                            onClick={() => handleSortSelect(option.value)}
                          >
                            {option.label}
                            {sortBy === option.value && (
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <path
                                  d="M20 6L9 17L4 12"
                                  stroke="#0d5834"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="properties-list">
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    <p className="mt-3 text-muted">Loading properties...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-5">
                    <p className="text-danger">{error}</p>
                    <button
                      className="btn btn-primary mt-3"
                      onClick={() => window.location.reload()}
                    >
                      Retry
                    </button>
                  </div>
                ) : filteredAndSortedProperties.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-muted">
                      No properties found matching your filters.
                    </p>
                    <button
                      className="btn btn-primary mt-3"
                      onClick={clearAllFilters}
                    >
                      Clear All Filters
                    </button>
                  </div>
                ) : (
                  filteredAndSortedProperties.map((property) => (
                    <div key={property.id} className="new-property-card">
                      {/* Property Image */}
                      <Link
                        href={`/properties/${property.slug || property.id}`}
                        className="property-card-image-link"
                      >
                        <div className="property-card-image">
                          {property.allImageUrls &&
                          property.allImageUrls.length > 0 ? (
                            <Swiper
                              modules={[Navigation, SwiperPagination, Autoplay]}
                              spaceBetween={0}
                              slidesPerView={1}
                              navigation={false}
                              pagination={{
                                clickable: true,
                                bulletClass:
                                  "swiper-pagination-bullet property-slider-bullet",
                                bulletActiveClass:
                                  "swiper-pagination-bullet-active property-slider-bullet-active",
                              }}
                              autoplay={{
                                delay: 3000,
                                disableOnInteraction: false,
                                pauseOnMouseEnter: true,
                              }}
                              loop={property.allImageUrls.length > 1}
                              className="property-image-swiper"
                            >
                              {property.allImageUrls.map((imageUrl, index) => (
                                <SwiperSlide key={index}>
                                  <div className="property-card-image-wrapper">
                                    <Image
                                      src={imageUrl}
                                      alt={`${property.title} - Image ${index + 1}`}
                                      fill
                                      className="property-card-img"
                                      style={{ objectFit: "cover" }}
                                      unoptimized
                                      onError={(e) => {
                                        console.error(
                                          "Image load error:",
                                          imageUrl,
                                        );
                                        e.target.style.display = "none";
                                      }}
                                    />
                                  </div>
                                </SwiperSlide>
                              ))}
                            </Swiper>
                          ) : (
                            <div className="property-card-image-wrapper placeholder-image">
                              No Image
                            </div>
                          )}

                          {/* Image Overlays */}
                          {property.verified && (
                            <div className="new-verified-badge">
                              <Image
                                src="/icon/verify.svg"
                                alt="Verified"
                                width={16}
                                height={16}
                              />
                              <span>Verified</span>
                            </div>
                          )}
                          <div className="property-top-right-badges">
                            <button
                              className={`property-like-btn ${likedProperties.includes(property.id) ? "liked" : ""}`}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleLike(property.id);
                              }}
                            >
                              {likedProperties.includes(property.id) ? (
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="#E5484D"
                                  className="like-icon"
                                >
                                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                              ) : (
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="#6B7280"
                                  strokeWidth="2"
                                  className="like-icon"
                                >
                                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                              )}
                            </button>
                            {property.imageCount > 0 && (
                              <div className="new-photo-count">
                                {property.imageCount}+ Photos
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>

                      {/* Property Info */}
                      <div className="property-card-content">
                        {/* Posted Date - Below Image */}
                        {property.postedDate && (
                          <div className="new-posted-date-below">
                            <Image
                              src="/icon/calendar.svg"
                              alt="Posted"
                              width={14}
                              height={14}
                            />
                            <span>Posted: {property.postedDate}</span>
                          </div>
                        )}

                        {/* Title */}
                        <Link
                          href={`/properties/${property.slug || property.id}`}
                          className="property-card-title-link"
                        >
                          <h5 className="property-card-title">
                            {property.title}
                          </h5>
                        </Link>

                        {/* Location */}
                        <div className="property-card-location">
                          <Image
                            src="/icon/location.svg"
                            alt="Location"
                            width={14}
                            height={14}
                          />
                          <span>{property.location}</span>
                        </div>

                        {/* Property Stats */}
                        <div className="property-stats">
                          <div className="property-stat-item">
                            <Image
                              src="/icon/carpet_area.svg"
                              alt="Area"
                              width={18}
                              height={18}
                            />
                            <div className="stat-info">
                              <div className="stat-label">CARPET AREA</div>
                              <div className="stat-value">
                                {property.area
                                  ? `${property.area.toLocaleString("en-IN")} sq ft`
                                  : "-"}
                              </div>
                            </div>
                          </div>
                          {property.bedrooms && (
                            <div className="property-stat-item">
                              <Image
                                src="/icon/bedroom.svg"
                                alt="Bedrooms"
                                width={18}
                                height={18}
                              />
                              <div className="stat-info">
                                <div className="stat-label">Bedrooms</div>
                                <div className="stat-value">
                                  {property.bedrooms || "-"}
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="property-stat-item">
                            <Image
                              src="/icon/bathrooms.svg"
                              alt="Bathrooms"
                              width={18}
                              height={18}
                            />
                            <div className="stat-info">
                              <div className="stat-label">Bathrooms</div>
                              <div className="stat-value">
                                {property.bathrooms || "-"}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Property Details and Price */}
                        <div className="property-details-footer">
                          <div className="property-detail-items-inline">
                            <div className="detail-item-inline">
                              <span className="detail-label-inline">
                                STATUS:
                              </span>
                              <span
                                className={`status-badge ${property.status === "Ready to Move" || property.status === "Ready" ? "status-ready-badge" : ""} ${property.status === "Under-Construction" || property.status === "Under Construction" ? "status-under-construction-badge" : ""}`}
                              >
                                {property.status || "-"}
                              </span>
                            </div>
                            <div className="detail-item-inline">
                              <span className="detail-label-inline">
                                TRANSACTION:
                              </span>
                              <span className="detail-value-inline">
                                {property.transaction || "-"}
                              </span>
                            </div>
                            <div className="detail-item-inline">
                              <span className="detail-label-inline">TYPE:</span>
                              <span className="detail-value-inline">
                                {property.listingType || "-"}
                              </span>
                            </div>
                            {property.facing && (
                              <div className="detail-item-inline">
                                <span className="detail-label-inline">
                                  FACING:
                                </span>
                                <span className="detail-value-inline">
                                  {property.facing || "-"}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Price on Right */}
                          <div className="property-card-price">
                            <div className="price-main">{property.price}</div>
                            {property.pricePerSqft && (
                              <div className="price-per-sqft">
                                {property.pricePerSqft}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Enquire Button */}
                        <div className="property-card-actions">
                          <button
                            className="enquire-btn"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            Enquire Now
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
