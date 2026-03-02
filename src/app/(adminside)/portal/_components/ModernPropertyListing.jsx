"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Row,
  Col,
  Button,
  Form,
  ProgressBar,
  Alert,
  Badge,
  Modal,
  Spinner,
} from "react-bootstrap";
import Cookies from "js-cookie";
import "./EnhancedFormStyles.css";
import {
  cilHome,
  cilLocationPin,
  cilMoney,
  cilStar,
  cilCamera,
  cilCheck,
  cilWarning,
  cilArrowLeft,
  cilArrowRight,
  cilSave,
  cilBuilding,
  cilUser,
  cilMap,
  cilFlagAlt,
  cilEnvelopeOpen,
  cilX,
  cilChevronTop,
  cilChevronBottom,
  cilCalendar,
} from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import {
  fetchAllProjects,
  fetchBuilderData,
  fetchProjectStatus,
  fetchProjectTypes,
} from "@/app/_global_components/masterFunction";
import axios from "axios";
import NextImage from "next/image";

// Helper function to determine which fields should be shown based on property type, subtype, and status
const getFieldVisibility = (listingType, subType, status) => {
  const isResidential = listingType === "Residential";
  const isCommercial = listingType === "Commercial";
  const isUnderConstruction =
    status &&
    (status.toLowerCase().includes("under") ||
      status.toLowerCase().includes("construction") ||
      status.toLowerCase().includes("upcoming"));
  const isReadyToMove =
    status &&
    (status.toLowerCase().includes("ready") ||
      status.toLowerCase().includes("move") ||
      status.toLowerCase().includes("possession"));

  // Subtype checks
  const isVilla = subType === "Villa";
  const isApartment = subType === "Apartment";
  const isPlot = subType === "Plot" || subType === "Land";
  const isOffice = subType === "Office";
  const isRetail = subType === "Retail";
  const isWarehouse = subType === "Warehouse";
  const isIndependentHouse = subType === "Independent House";
  const isFarmhouse = subType === "Farmhouse";
  const isPenthouse = subType === "Penthouse";

  return {
    // Basic Information fields
    showPossession: isUnderConstruction && isResidential,
    showOccupancy: isReadyToMove && isResidential,
    showNoticePeriod: isReadyToMove && (isResidential || isCommercial),

    // Location & Area fields
    showPlotArea: isPlot || isVilla || isFarmhouse || isIndependentHouse,
    showCarpetArea: !isPlot && (isResidential || isCommercial),
    showBuiltUpArea: !isPlot && (isResidential || isCommercial),
    showSuperBuiltUpArea: isApartment || isOffice || isRetail,

    // Pricing fields
    showBookingAmount: isUnderConstruction,
    showMaintenanceCharges: (isApartment || isOffice || isRetail) && !isPlot,
    showPricePerSqFt: !isPlot,
    showAgeOfConstruction: isReadyToMove && !isPlot,

    // Floor details
    showFloor: !isPlot && !isWarehouse && !isFarmhouse,
    showTotalFloors: !isPlot && !isWarehouse && !isFarmhouse,
    showFacing:
      isResidential &&
      !isPlot &&
      (isApartment || isVilla || isIndependentHouse || isPenthouse),

    // Features & Amenities
    showBedrooms: isResidential && !isPlot,
    showBathrooms: !isPlot,
    showBalconies: isResidential && (isApartment || isVilla || isPenthouse),
    showFurnishing: isResidential && !isPlot && isReadyToMove,
    showParking: !isPlot,

    // Commercial specific
    showWashrooms: isCommercial && !isPlot,
    showFloorsLevels: isCommercial && (isOffice || isRetail),
  };
};

export default function ModernPropertyListing({ listingId: propListingId }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdProperty, setCreatedProperty] = useState(null);
  const [draftSaved, setDraftSaved] = useState(false);
  const [savedListingId, setSavedListingId] = useState(propListingId || null);

  // Use savedListingId if available, otherwise use propListingId
  const listingId = savedListingId || propListingId;
  const [propertyStatus, setPropertyStatus] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [builders, setBuilders] = useState([]);
  const [projects, setProjects] = useState([]);
  const [cities, setCities] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [features, setFeatures] = useState([]);
  const [nearbyBenefits, setNearbyBenefits] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingBuilders, setLoadingBuilders] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingAmenities, setLoadingAmenities] = useState(false);
  const [loadingFeatures, setLoadingFeatures] = useState(false);
  const [loadingNearbyBenefits, setLoadingNearbyBenefits] = useState(false);
  const getInitialFormState = () => ({
    // Step 1: Basic Information
    listingType: "",
    transaction: "",
    subType: "",
    title: "",
    description: "",
    status: "",
    possession: "",
    occupancy: "",
    noticePeriod: "",

    // Step 2: Location & Area
    projectName: "",
    projectId: null,
    builderName: "",
    builderId: null,
    address: "",
    locality: "",
    city: "",
    cityId: null,
    pincode: "",
    carpetArea: "",
    builtUpArea: "",
    superBuiltUpArea: "",
    plotArea: "",

    // Step 3: Pricing & Floor Details
    totalPrice: "",
    pricePerSqFt: "",
    maintenanceCharges: "",
    bookingAmount: "",
    floor: "",
    totalFloors: "",
    facing: "",
    ageOfConstruction: "",

    // Step 4: Features & Amenities
    bedrooms: "",
    bathrooms: "",
    balconies: "",
    parking: "",
    furnished: "",
    amenityIds: [], // Array of amenity IDs
    featureIds: [], // Array of feature IDs
    nearbyBenefits: [], // Array of {id, distance} objects

    // Step 5: Media & Contact
    images: [],
    imagePreviews: [],
    videos: [],
    virtualTour: "",
    ownershipType: "",
    reraId: "",
    reraState: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    contactPreference: "Phone",
    preferredTime: "",
    additionalNotes: "",
    truthfulDeclaration: false,
    dpdpConsent: false,
  });

  const [formData, setFormData] = useState(() => getInitialFormState());
  const [loadingProperty, setLoadingProperty] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const steps = [
    {
      id: 1,
      title: "Basic Information",
      icon: cilHome,
      description: "Property type and basic details",
    },
    {
      id: 2,
      title: "Location & Area",
      icon: cilLocationPin,
      description: "Address and area specifications",
    },
    {
      id: 3,
      title: "Pricing & Details",
      icon: cilMoney,
      description: "Price and property specifications",
    },
    {
      id: 4,
      title: "Features & Amenities",
      icon: cilStar,
      description: "Property features and amenities",
    },
    {
      id: 5,
      title: "Media & Contact",
      icon: cilCamera,
      description: "Images, videos and contact information",
    },
  ];

  const validationRules = {
    // Step 1 validations
    listingType: { required: true, message: "Please select listing type" },
    transaction: { required: true, message: "Please select transaction type" },
    subType: { required: true, message: "Please select property sub-type" },
    description: {
      required: true,
      minLength: 50,
      maxLength: 1200,
      message: "Description must be between 50 and 1200 characters",
    },
    status: { required: true, message: "Please select property status" },

    // Step 2 validations
    projectName: {
      required: true,
      message: "Project/Building name is required",
    },
    address: { required: true, message: "Address is required" },
    locality: { required: true, message: "Locality is required" },
    city: { required: true, message: "City is required" },
    pincode: {
      required: true,
      pattern: /^\d{6}$/,
      message: "PIN code must be 6 digits",
    },
    carpetArea: {
      required: true,
      min: 50,
      message: "Carpet area must be at least 50 sq ft",
    },

    // Step 3 validations
    totalPrice: {
      required: true,
      min: 50000,
      message: "Price must be realistic (minimum ₹50,000)",
    },
    floor: { required: true, message: "Floor number is required" },
    totalFloors: { required: true, message: "Total floors is required" },

    // Step 4 validations (conditional based on listing type)
    bedrooms: {
      required: true,
      message: "Number of bedrooms is required",
      conditional: (data) => data.listingType === "Residential",
    },
    bathrooms: {
      required: true,
      message: "Number of bathrooms is required",
      conditional: (data) =>
        data.listingType === "Residential" || data.listingType === "Commercial",
    },

    // Step 5 validations
    contactName: { required: true, message: "Contact name is required" },
    contactPhone: {
      required: true,
      pattern: /^[6-9]\d{9}$/,
      message: "Valid 10-digit phone number required",
    },
    contactEmail: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Valid email address required",
    },
    truthfulDeclaration: {
      required: true,
      message: "You must confirm the information is truthful",
    },
    dpdpConsent: {
      required: true,
      message: "You must consent to data processing",
    },
    images: {
      required: true,
      minCount: 1,
      message: "At least one property image is required",
    },
  };

  const validateStep = (step) => {
    const stepErrors = {};

    // Define which fields belong to which step (with conditional logic)
    const stepFields = {
      1: ["listingType", "transaction", "subType", "description", "status"],
      2: [
        "projectName",
        "address",
        "locality",
        "city",
        "pincode",
        "carpetArea",
      ],
      3: ["totalPrice", "floor", "totalFloors"],
      4: [], // Will be populated conditionally
      5: [
        "contactName",
        "contactPhone",
        "contactEmail",
        "truthfulDeclaration",
        "dpdpConsent",
        "images",
      ],
    };

    // Conditionally add Step 4 fields based on listing type
    if (step === 4) {
      if (formData.listingType === "Residential") {
        stepFields[4] = ["bedrooms", "bathrooms"];
      } else if (formData.listingType === "Commercial") {
        stepFields[4] = ["bathrooms"]; // Only bathrooms required for commercial
      }
    }

    const fieldsToValidate = stepFields[step] || [];

    fieldsToValidate.forEach((field) => {
      const rule = validationRules[field];
      if (!rule) return; // Skip if rule doesn't exist

      // Check conditional requirement
      if (rule.conditional && !rule.conditional(formData)) {
        return; // Skip validation if condition not met
      }

      const value = formData[field];

      if (rule.required) {
        // Handle checkbox fields
        if (field === "truthfulDeclaration" || field === "dpdpConsent") {
          if (!value || value === false) {
            stepErrors[field] = rule.message;
          }
        }
        // Handle image array
        else if (field === "images") {
          if (
            !formData.imagePreviews ||
            formData.imagePreviews.length < (rule.minCount || 1)
          ) {
            stepErrors[field] = rule.message;
          }
        }
        // Handle string/number fields
        else if (!value || value.toString().trim() === "") {
          stepErrors[field] = rule.message;
        }
      }

      // Additional validations for non-empty values
      if (value && value.toString().trim() !== "") {
        if (rule.minLength && value.length < rule.minLength) {
          stepErrors[field] = rule.message;
        } else if (rule.maxLength && value.length > rule.maxLength) {
          stepErrors[field] = rule.message;
        } else if (rule.min && Number(value) < rule.min) {
          stepErrors[field] = rule.message;
        } else if (rule.pattern && !rule.pattern.test(value)) {
          stepErrors[field] = rule.message;
        }
      }
    });

    // Cross-field validation for Step 3
    if (step === 3) {
      const floor = Number(formData.floor);
      const totalFloors = Number(formData.totalFloors);

      // Check for negative values
      if (formData.floor && floor < 0) {
        stepErrors.floor = "Floor number cannot be negative";
      }
      if (formData.totalFloors && totalFloors < 0) {
        stepErrors.totalFloors = "Total floors cannot be negative";
      }

      // Check if floor is greater than total floors
      if (floor && totalFloors && floor > totalFloors) {
        stepErrors.floor = `Floor number cannot be greater than total floors (${totalFloors})`;
      }
    }

    // Virtual tour URL validation (if provided)
    if (
      step === 5 &&
      formData.virtualTour &&
      formData.virtualTour.trim() !== ""
    ) {
      const urlPattern =
        /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlPattern.test(formData.virtualTour)) {
        stepErrors.virtualTour =
          "Please enter a valid URL (e.g., https://example.com)";
      }
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      };

      // Reset dependent fields when listing type changes
      if (field === "listingType") {
        // Reset subType when listing type changes
        newData.subType = "";
        // Reset residential-specific fields if switching to commercial
        if (value === "Commercial") {
          newData.bedrooms = "";
          newData.balconies = "";
        }
        // Reset commercial-specific fields if switching to residential
        if (value === "Residential") {
          // Keep bathrooms as it's common
        }
      }

      // Auto-calculate pricing when carpet area changes
      if (field === "carpetArea" && value && prev.totalPrice) {
        const carpetArea = parseInt(value);
        const totalPrice = parseInt(prev.totalPrice);
        if (carpetArea > 0 && totalPrice > 0) {
          const calculatedPricePerSqFt = Math.round(totalPrice / carpetArea);
          newData.pricePerSqFt = calculatedPricePerSqFt.toString();
        }
      }

      // Auto-calculate pricing when carpet area changes and price per sq ft exists
      if (field === "carpetArea" && value && prev.pricePerSqFt) {
        const carpetArea = parseInt(value);
        const pricePerSqFt = parseInt(prev.pricePerSqFt);
        if (carpetArea > 0 && pricePerSqFt > 0) {
          const calculatedTotalPrice = Math.round(pricePerSqFt * carpetArea);
          newData.totalPrice = calculatedTotalPrice.toString();
        }
      }

      // Format price fields for display
      if (
        [
          "totalPrice",
          "pricePerSqFt",
          "maintenanceCharges",
          "bookingAmount",
        ].includes(field)
      ) {
        // Store the clean numeric value
        const cleanValue = value.toString().replace(/,/g, "");
        newData[field] = cleanValue;
      }

      return newData;
    });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  // Validate image aspect ratio (must be rectangular, not square or extreme)
  const validateImageRatio = (file) => {
    return new Promise((resolve) => {
      // Use window.Image to explicitly use browser's native Image constructor
      const img = new window.Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;
        const aspectRatio = width / height;

        // Check if image is square (aspect ratio close to 1:1)
        const isSquare = Math.abs(aspectRatio - 1) < 0.1;

        // Check if image is too extreme (more than 3:1 or less than 1:3)
        const isTooExtreme = aspectRatio > 3 || aspectRatio < 1 / 3;

        // Valid rectangular ratio: not square and not too extreme
        const isValid = !isSquare && !isTooExtreme;

        resolve({
          isValid,
          width,
          height,
          aspectRatio,
          error: isSquare
            ? "Image must be rectangular, not square"
            : isTooExtreme
              ? "Image aspect ratio is too extreme. Please use rectangular images (between 3:1 and 1:3)"
              : null,
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({
          isValid: false,
          error:
            "Failed to load image. Please ensure the file is a valid image.",
        });
      };

      img.src = url;
    });
  };

  // Handle image selection
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    const invalidFiles = [];

    // First filter by type and size
    const typeAndSizeValidFiles = files.filter((file) => {
      const isValidType = file.type.startsWith("image/");
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      return isValidType && isValidSize;
    });

    if (typeAndSizeValidFiles.length !== files.length) {
      alert(
        "Some files were skipped. Please select only image files under 5MB.",
      );
    }

    // Validate aspect ratio for each file
    for (const file of typeAndSizeValidFiles) {
      const validation = await validateImageRatio(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        invalidFiles.push({ file, error: validation.error });
      }
    }

    // Show error for invalid aspect ratio files
    if (invalidFiles.length > 0) {
      const errorMessages = invalidFiles.map(({ error }) => error).join("\n");
      alert(
        `Some images were rejected due to invalid aspect ratio:\n${errorMessages}`,
      );
    }

    if (validFiles.length === 0) {
      return;
    }

    setFormData((prev) => {
      const newImages = [...prev.images, ...validFiles];
      const newPreviews = [...prev.imagePreviews];

      // Create preview URLs for new images
      validFiles.forEach((file) => {
        const previewUrl = URL.createObjectURL(file);
        newPreviews.push({
          file,
          preview: previewUrl,
          id: Date.now() + Math.random(),
        });
      });

      return {
        ...prev,
        images: newImages,
        imagePreviews: newPreviews,
      };
    });
  };

  // Handle image removal
  const handleImageRemove = (imageId) => {
    setFormData((prev) => {
      const imageToRemove = prev.imagePreviews.find(
        (img) => img.id === imageId,
      );
      if (imageToRemove) {
        // Only revoke object URLs (not HTTP URLs for existing images)
        // Object URLs start with 'blob:' or are created via URL.createObjectURL
        if (
          imageToRemove.preview &&
          imageToRemove.preview.startsWith("blob:")
        ) {
          URL.revokeObjectURL(imageToRemove.preview);
        }
      }

      return {
        ...prev,
        imagePreviews: prev.imagePreviews.filter((img) => img.id !== imageId),
        images: prev.images.filter((_, index) => {
          const previewIndex = prev.imagePreviews.findIndex(
            (img) => img.id === imageId,
          );
          return index !== previewIndex;
        }),
      };
    });
  };

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      formData.imagePreviews.forEach((imageData) => {
        // Only revoke object URLs (blob URLs), not HTTP URLs for existing images
        if (imageData.preview && imageData.preview.startsWith("blob:")) {
          URL.revokeObjectURL(imageData.preview);
        }
      });
    };
  }, [formData.imagePreviews]);

  // Load project status, types, cities, builders, and states on component mount
  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    const loadProjectStatus = async () => {
      try {
        const response = await fetchProjectStatus();
        setPropertyStatus(response.data || []);
      } catch (error) {
        console.error("Error loading project status:", error);
        setPropertyStatus([]);
      }
    };

    const loadProjectTypes = async () => {
      try {
        const response = await fetchProjectTypes();
        setPropertyTypes(response.data || []);
      } catch (error) {
        console.error("Error loading project types:", error);
        setPropertyTypes([]);
      }
    };

    const loadCities = async () => {
      setLoadingCities(true);
      try {
        const response = await axios.get(`${baseUrl}city/all`);
        // Handle different response formats
        const cityData = response.data?.data || response.data || [];
        setCities(Array.isArray(cityData) ? cityData : []);
      } catch (error) {
        console.error("Error loading cities:", error);
        setCities([]);
      } finally {
        setLoadingCities(false);
      }
    };

    const loadBuilders = async () => {
      setLoadingBuilders(true);
      try {
        const response = await axios.get(`${baseUrl}builder/get-all-builders`);
        // Handle different response formats
        const builderData = response.data?.data || response.data || [];
        setBuilders(Array.isArray(builderData) ? builderData : []);
      } catch (error) {
        console.error("Error loading builders:", error);
        // Fallback to existing function
        try {
          const builderData = await fetchBuilderData();
          setBuilders(builderData?.data || builderData?.builders || []);
        } catch (fallbackError) {
          console.error("Error loading builders (fallback):", fallbackError);
          setBuilders([]);
        }
      } finally {
        setLoadingBuilders(false);
      }
    };

    const loadProjects = async () => {
      setLoadingProjects(true);
      try {
        const response = await fetchAllProjects();
        // Handle different response formats
        const projectData = response || [];
        setProjects(Array.isArray(projectData) ? projectData : []);
      } catch (error) {
        console.error("Error loading projects:", error);
        setProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    };

    const loadAmenities = async () => {
      setLoadingAmenities(true);
      try {
        const response = await axios.get(`${baseUrl}amenity/get-all`);
        const amenityData = response.data || [];
        setAmenities(Array.isArray(amenityData) ? amenityData : []);
      } catch (error) {
        console.error("Error loading amenities:", error);
        setAmenities([]);
      } finally {
        setLoadingAmenities(false);
      }
    };

    const loadFeatures = async () => {
      setLoadingFeatures(true);
      try {
        const response = await axios.get(`${baseUrl}feature/get-all`);
        const featureData = response.data || [];
        setFeatures(Array.isArray(featureData) ? featureData : []);
      } catch (error) {
        console.error("Error loading features:", error);
        setFeatures([]);
      } finally {
        setLoadingFeatures(false);
      }
    };

    const loadNearbyBenefits = async () => {
      setLoadingNearbyBenefits(true);
      try {
        const response = await axios.get(`${baseUrl}nearby-benefit/get-all`);
        const benefitData = response.data || [];
        setNearbyBenefits(Array.isArray(benefitData) ? benefitData : []);
      } catch (error) {
        console.error("Error loading nearby benefits:", error);
        setNearbyBenefits([]);
      } finally {
        setLoadingNearbyBenefits(false);
      }
    };

    // Load all data in parallel (amenities/features/nearby-benefits APIs disabled for frontend dev)
    loadProjectStatus();
    loadProjectTypes();
    loadCities();
    loadBuilders();
    loadProjects();
    loadAmenities();
    loadFeatures();
    loadNearbyBenefits();
  }, []);

  // Load existing property data when listingId is provided (edit mode)
  useEffect(() => {
   
    // Update savedListingId when propListingId changes
    if (propListingId && propListingId !== savedListingId) {
      setSavedListingId(propListingId);
    }
  }, [propListingId]);

  useEffect(() => {
    if (!listingId) {
      setIsEditMode(false);
      return;
    }

    const fetchPropertyData = async () => {
      setLoadingProperty(true);
      setIsEditMode(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      try {
        const token = Cookies.get("token");
        if (!token) {
          console.error("No authentication token found");
          setLoadingProperty(false);
          return;
        }

        const response = await axios.get(
          `${baseUrl}user/property-listings/${listingId}`,
          {
            withCredentials: true,
          },
        );

        if (!response.status === 200) {
          throw new Error(`Failed to fetch property: ${response.status}`);
        }
        const result = response.data;
        if (result.success && result.property) {
          const property = result.property;
          // Get initial form state first, then override with property data
          const initialFormState = getInitialFormState();

          // Populate form with existing property data
          setFormData({
            ...initialFormState, // Start with all initial fields (checkboxes default to false)
            // Basic Information
            listingType: property.listingType || "",
            transaction: property.transaction || property.transactionType || "",
            subType: property.subType || "",
            title: property.title || "",
            description: property.description || "",
            status: property.status || "",
            possession: property.possession || "",
            occupancy: property.occupancy || "",
            noticePeriod: property.noticePeriod || "",

            // Location & Area
            projectName: property.projectName || "",
            projectId: property.projectId || null,
            builderName: property.builderName || "",
            builderId: property.builderId || null,
            address: property.address || "",
            locality: property.locality || "",
            city: property.city || "",
            cityId: property.cityId || null,
            pincode: property.pincode || property.pinCode || "",
            carpetArea:
              property.carpetArea !== null && property.carpetArea !== undefined
                ? property.carpetArea.toString()
                : "",
            builtUpArea:
              property.builtUpArea !== null &&
              property.builtUpArea !== undefined
                ? property.builtUpArea.toString()
                : "",
            superBuiltUpArea:
              property.superBuiltUpArea !== null &&
              property.superBuiltUpArea !== undefined
                ? property.superBuiltUpArea.toString()
                : "",
            plotArea:
              property.plotArea !== null && property.plotArea !== undefined
                ? property.plotArea.toString()
                : "",
            latitude:
              property.latitude !== null && property.latitude !== undefined
                ? property.latitude.toString()
                : "",
            longitude:
              property.longitude !== null && property.longitude !== undefined
                ? property.longitude.toString()
                : "",

            // Pricing & Floor Details
            totalPrice:
              property.totalPrice !== null && property.totalPrice !== undefined
                ? property.totalPrice.toString()
                : "",
            pricePerSqFt:
              property.pricePerSqft !== null &&
              property.pricePerSqft !== undefined
                ? property.pricePerSqft.toString()
                : property.pricePerSqFt !== null &&
                    property.pricePerSqFt !== undefined
                  ? property.pricePerSqFt.toString()
                  : "",
            maintenanceCharges:
              property.maintenanceCharges !== null &&
              property.maintenanceCharges !== undefined
                ? property.maintenanceCharges.toString()
                : property.maintenanceCam !== null &&
                    property.maintenanceCam !== undefined
                  ? property.maintenanceCam.toString()
                  : "",
            bookingAmount:
              property.bookingAmount !== null &&
              property.bookingAmount !== undefined
                ? property.bookingAmount.toString()
                : "",
            floor:
              property.floorNumber !== null &&
              property.floorNumber !== undefined
                ? property.floorNumber.toString()
                : property.floorNo !== null && property.floorNo !== undefined
                  ? property.floorNo.toString()
                  : "",
            totalFloors:
              property.totalFloors !== null &&
              property.totalFloors !== undefined
                ? property.totalFloors.toString()
                : "",
            facing: property.facing || property.unitFacing || "",
            ageOfConstruction:
              property.ageOfConstruction !== null &&
              property.ageOfConstruction !== undefined
                ? property.ageOfConstruction.toString()
                : property.ageOfProperty !== null &&
                    property.ageOfProperty !== undefined
                  ? property.ageOfProperty.toString()
                  : "",

            // Features & Amenities (Studio with 1 room -> 1 RK)
            bedrooms:
              property.bedrooms !== null && property.bedrooms !== undefined
                ? (property.subType === "Studio" &&
                  (property.bedrooms === 1 || property.bedrooms === "1")
                    ? "1RK"
                    : property.bedrooms.toString())
                : "",
            bathrooms:
              property.bathrooms !== null && property.bathrooms !== undefined
                ? property.bathrooms.toString()
                : "",
            balconies:
              property.balconies !== null && property.balconies !== undefined
                ? property.balconies.toString()
                : "",
            parking: property.parking || property.parkingType || "",
            furnished: property.furnished || property.furnishingLevel || "",
            amenityIds: Array.isArray(property.amenityIds)
              ? property.amenityIds
              : Array.isArray(property.amenities)
                ? property.amenities.map((a) =>
                    typeof a === "object" ? a.id : a,
                  )
                : [],
            featureIds: Array.isArray(property.featureIds)
              ? property.featureIds
              : Array.isArray(property.features)
                ? property.features.map((f) =>
                    typeof f === "object" ? f.id : f,
                  )
                : [],
            nearbyBenefits: Array.isArray(property.nearbyBenefits)
              ? property.nearbyBenefits
              : [],

            // Media & Contact
            images: [],
            imagePreviews: property.imageUrls
              ? property.imageUrls.map((url, index) => {
                  // Format image URL properly
                  let imageUrl = url;
                  if (
                    !url.startsWith("http://") &&
                    !url.startsWith("https://")
                  ) {
                    // Handle different URL formats
                    if (url.includes("property-listings")) {
                      // Extract listing ID and filename from path
                      const pathParts = url.replace(/\\/g, "/").split("/");
                      const propertyListingsIndex = pathParts.findIndex(
                        (p) => p.toLowerCase() === "property-listings",
                      );
                      if (
                        propertyListingsIndex !== -1 &&
                        pathParts.length > propertyListingsIndex + 2
                      ) {
                        const listingId = pathParts[propertyListingsIndex + 1];
                        const filename = pathParts
                          .slice(propertyListingsIndex + 2)
                          .join("/");
                        imageUrl = `${process.env.NEXT_PUBLIC_API_URL}get/images/property-listings/${listingId}/${filename}`;
                      } else {
                        imageUrl = `${process.env.NEXT_PUBLIC_API_URL}get/images/${url.replace(/\\/g, "/")}`;
                      }
                    } else {
                      imageUrl = `${process.env.NEXT_PUBLIC_API_URL}get/images/${url.replace(/\\/g, "/")}`;
                    }
                  }
                  return {
                    id: `existing-${index}`,
                    preview: imageUrl,
                    isExisting: true,
                    url: url,
                  };
                })
              : [],
            videos: Array.isArray(property.videoUrls) ? property.videoUrls : [],
            virtualTour: property.videoUrl || property.virtualTour || "",
            ownershipType: property.ownershipType || "",
            reraId: property.reraId || "",
            reraState: property.reraState || "",
            contactName: property.contactName || "",
            contactPhone:
              property.contactPhone || property.primaryContact || "",
            contactEmail: property.contactEmail || property.primaryEmail || "",
            contactPreference: property.contactPreference || "Phone",
            preferredTime: property.preferredTime || "",
            additionalNotes:
              property.additionalNotes || property.renovationHistory || "",
            truthfulDeclaration:
              property.truthfulDeclaration !== undefined
                ? property.truthfulDeclaration
                : false,
            dpdpConsent:
              property.dpdpConsent !== undefined ? property.dpdpConsent : false,
            // Additional fields that might be in the API response
            waterSupply: property.waterSupply || "",
            towerBlock: property.towerBlock || "",
            powerBackup: property.powerBackup || "",
            restrictions: property.restrictions || "",
            taxesCharges: Array.isArray(property.taxesCharges)
              ? property.taxesCharges
              : [],
            pointsOfInterest: Array.isArray(property.pointsOfInterest)
              ? property.pointsOfInterest
              : [],
            state: property.state || "",
            localityId: property.localityId || null,
          });
        } else {
          console.error("Property data not found in API response:", result);
        }
      } catch (error) {
        console.error("Error fetching property data:", error);
        alert("Failed to load property data. Please try again.");
      } finally {
        setLoadingProperty(false);
      }
    };

    fetchPropertyData();
  }, [listingId]);

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for file upload
      const formDataObj = new FormData();

      // Add images to form data
      formData.imagePreviews.forEach((imagePreview) => {
        if (imagePreview.file) {
          formDataObj.append("images", imagePreview.file);
        }
      });

      // Prepare property data using shared function
      const propertyData = preparePropertyData();

      // Set approval status to PENDING when submitting (not draft)
      // When user clicks "Submit Property", it should be submitted for approval
      propertyData.approvalStatus = "PENDING";
      propertyData.isUserSubmitted = true;

      // Add property data as JSON string (backend will parse it)
      formDataObj.append("property", JSON.stringify(propertyData));

      // Use PUT for updates, POST for new listings
      const url =
        isEditMode && listingId
          ? `${process.env.NEXT_PUBLIC_API_URL}user/property-listings/${listingId}`
          : `${process.env.NEXT_PUBLIC_API_URL}user/property-listings`;

      const method = isEditMode && listingId ? "PUT" : "POST";

      const response = await axios.post(url, formDataObj, {
        withCredentials: true,
      });

      const result = response.data;
      if (!(result && result.success)) {
        const message =
          result?.message ||
          `Failed to ${isEditMode ? "update" : "create"} property (status ${response.status})`;
        throw new Error(message);
      }

      setCreatedProperty(result.property || null);

      // Update savedListingId if property was created
      if (result.property && result.property.id) {
        setSavedListingId(result.property.id);
      }

      if (isEditMode) {
        // For edit mode, show success and redirect or refresh
        alert("Property updated successfully!");
        // Optionally redirect back to listings page
        if (typeof window !== "undefined") {
          window.location.href = "/portal/dashboard/listings";
        }
      } else {
        // For new listings, reset form and show success modal
        setFormData(getInitialFormState());
        setErrors({});
        setCurrentStep(1);
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error("Error submitting property:", error);
      alert(error.message || "Error submitting property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

 
  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setCreatedProperty(null);
    
  };

  // Helper function to prepare property data (shared between draft and submit)
  const preparePropertyData = () => {
    const toNumber = (value, parser = parseFloat) => {
      if (value === undefined || value === null || value === "") {
        return null;
      }
      const num = parser(value);
      return Number.isNaN(num) ? null : num;
    };

    const toInteger = (value) => toNumber(value, (val) => parseInt(val, 10));
    const emptyToNull = (value) =>
      value === undefined || value === null || value === "" ? null : value;

    const extractParkingSlots = (value) => {
      if (!value) return null;
      const match = value.match(/(\d+)/);
      return match ? parseInt(match[0], 10) : null;
    };

    // Generate title from property details if not provided
    const generateTitle = () => {
      const parts = [];

      if (formData.listingType === "Commercial") {
        // Commercial property title format: "1200 sq ft Office Space in Sector 45, Gurgaon" (space first, then type)
        if (formData.carpetArea) {
          // Add area first for commercial properties
          parts.push(`${formData.carpetArea} sq ft`);
        }
        if (formData.subType) parts.push(formData.subType);
        if (formData.locality) parts.push(`in ${formData.locality}`);
        if (formData.city) parts.push(formData.city);
      } else {
        // Residential property title format: "3 BHK Apartment" or "1 RK Studio"
        if (formData.bedrooms) {
          parts.push(formData.bedrooms === "1RK" ? "1 RK" : `${formData.bedrooms} BHK`);
        }
        if (formData.subType) parts.push(formData.subType);
        if (formData.locality) parts.push(`in ${formData.locality}`);
        if (formData.city) parts.push(formData.city);
      }

      return parts.length > 0 ? parts.join(" ") : "Property Listing";
    };

    return {
      // Basic Information
      listingType: emptyToNull(formData.listingType),
      transaction: emptyToNull(formData.transaction),
      subType: emptyToNull(formData.subType),
      title: generateTitle(),
      description: emptyToNull(formData.description),
      status: emptyToNull(formData.status),
      possession: emptyToNull(formData.possession),
      occupancy: emptyToNull(formData.occupancy),
      noticePeriod: toInteger(formData.noticePeriod),

      // Location
      projectName: emptyToNull(formData.projectName),
      projectId: formData.projectId || null,
      builderName: emptyToNull(formData.builderName),
      address: emptyToNull(formData.address),
      locality: emptyToNull(formData.locality),
      city: emptyToNull(formData.city),
      pinCode: emptyToNull(formData.pincode),
      latitude: toNumber(formData.latitude),
      longitude: toNumber(formData.longitude),

      // Area
      carpetArea: toNumber(formData.carpetArea),
      builtUpArea: toNumber(formData.builtUpArea),
      superBuiltUpArea: toNumber(formData.superBuiltUpArea),
      plotArea: toNumber(formData.plotArea),

      // Pricing
      totalPrice: toNumber(formData.totalPrice),
      pricePerSqft: toNumber(formData.pricePerSqFt),
      maintenanceCam: toNumber(formData.maintenanceCharges),
      bookingAmount: toNumber(formData.bookingAmount),
      waterSupply: emptyToNull(formData.waterSupply),
      towerBlock: emptyToNull(formData.towerBlock),

      // Property Details
      floorNo: toInteger(formData.floor),
      totalFloors: toInteger(formData.totalFloors),
      // Facing is only for residential properties
      facing:
        formData.listingType === "Residential"
          ? emptyToNull(formData.facing)
          : null,
      unitFacing:
        formData.listingType === "Residential"
          ? emptyToNull(formData.facing)
          : null,
      ageOfConstruction: toInteger(formData.ageOfConstruction),
      // Remove duplicate ageOfProperty field
      carParkingSlots: extractParkingSlots(formData.parking),
      parkingType: emptyToNull(formData.parking),
      powerBackup: emptyToNull(formData.powerBackup),

      // Configuration - residential-specific fields set to null for commercial (1RK sent as 1 for Studio)
      bedrooms:
        formData.listingType === "Residential"
          ? (formData.bedrooms === "1RK" ? 1 : toInteger(formData.bedrooms))
          : null,
      bathrooms: toInteger(formData.bathrooms),
      balconies:
        formData.listingType === "Residential"
          ? toInteger(formData.balconies)
          : null,
      furnishingLevel: emptyToNull(formData.furnished),
      additionalRooms:
        formData.features && formData.features.length
          ? formData.features.join(", ")
          : null,
      includedItems: formData.features || [],
      societyFeatures: formData.amenities || [],
      pointsOfInterest: formData.pointsOfInterest || [],
      taxesCharges: formData.taxesCharges || [],
      restrictions: emptyToNull(formData.restrictions),
      renovationHistory: emptyToNull(formData.additionalNotes),

      // Amenities, Features, and Nearby Benefits
      amenityIds: formData.amenityIds || [],
      featureIds: formData.featureIds || [],
      nearbyBenefits: formData.nearbyBenefits || [], // Array of {id, distance}

      // Contact Information
      videoUrl: emptyToNull(formData.virtualTour),
      ownershipType: emptyToNull(formData.ownershipType),
      reraId: emptyToNull(formData.reraId),
      reraState: emptyToNull(formData.reraState),
      contactPreference: emptyToNull(formData.contactPreference) || "Phone",
      contactName: emptyToNull(formData.contactName),
      contactPhone: emptyToNull(formData.contactPhone),
      contactEmail: emptyToNull(formData.contactEmail),
      // Remove duplicate primaryContact and primaryEmail fields
      preferredTime: emptyToNull(formData.preferredTime),
      truthfulDeclaration:
        formData.truthfulDeclaration !== undefined
          ? formData.truthfulDeclaration
          : false,
      dpdpConsent:
        formData.dpdpConsent !== undefined ? formData.dpdpConsent : false,

      // Legacy/contact
      additionalNotes: emptyToNull(formData.additionalNotes),

      // Relationship placeholders
      cityId: formData.cityId || null,
      localityId: formData.localityId || null,
      builderId: formData.builderId || null,
    };
  };

  // Handle save draft (saves without validation)
  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    setDraftSaved(false);

    try {
      

     

      // Create FormData for file upload
      const formDataObj = new FormData();

      // Add images to form data (optional for draft)
      formData.imagePreviews.forEach((imagePreview) => {
        if (imagePreview.file) {
          formDataObj.append("images", imagePreview.file);
        }
      });

      // Prepare property data
      const propertyData = preparePropertyData();

      // Set approval status to DRAFT when saving as draft
      propertyData.approvalStatus = "DRAFT";
      propertyData.isUserSubmitted = false; // Draft is not yet submitted for approval

      // Add property data as JSON string
      formDataObj.append("property", JSON.stringify(propertyData));
      const baseUrl = (
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8005"
      ).replace(/\/$/, "");

      // Use PUT for updates, POST for new drafts
      const url =
        isEditMode && listingId
          ? `${process.env.NEXT_PUBLIC_API_URL}user/property-listings/${listingId}`
          : `${process.env.NEXT_PUBLIC_API_URL}user/property-listings`;

      const method = isEditMode && listingId ? "PUT" : "POST";

      const response = await axios.post(url, formDataObj, {
        withCredentials: true,
      });

      const result = response.data;
      if (!(result && result.success)) {
        const message =
          result?.message ||
          `Failed to ${isEditMode ? "update" : "save draft"} (status ${response.status})`;
        throw new Error(message);
      }

      // Show success message
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 3000);

      // If property was created/updated, update listingId and isEditMode for future saves
      if (result.property && result.property.id) {
        const savedId = result.property.id;
        // Update savedListingId state so future saves use PUT instead of POST
        setSavedListingId(savedId);

        // If this was a new draft (not edit mode), update URL and edit mode
        if (!isEditMode && !propListingId) {
          // Update the URL to include the ID for future edits
          if (typeof window !== "undefined") {
            const newUrl = `/portal/dashboard/listings/${savedId}?action=edit`;
            window.history.replaceState({}, "", newUrl);
          }
          // Update state so future saves use PUT instead of POST
          setIsEditMode(true);
        }
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      alert(error.message || "Error saving draft. Please try again.");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInformationStep
            data={formData}
            onChange={handleInputChange}
            errors={errors}
            propertyTypes={propertyTypes}
            propertyStatus={propertyStatus}
          />
        );
      case 2:
        return (
          <LocationAreaStep
            data={formData}
            builderList={builders}
            projectList={projects}
            cities={cities}
            loadingCities={loadingCities}
            loadingBuilders={loadingBuilders}
            loadingProjects={loadingProjects}
            onChange={handleInputChange}
            errors={errors}
          />
        );
      case 3:
        return (
          <PricingDetailsStep
            data={formData}
            onChange={handleInputChange}
            errors={errors}
          />
        );
      case 4:
        return (
          <FeaturesAmenitiesStep
            data={formData}
            onChange={handleInputChange}
            errors={errors}
            amenities={amenities}
            features={features}
            nearbyBenefits={nearbyBenefits}
            loadingAmenities={loadingAmenities}
            loadingFeatures={loadingFeatures}
            loadingNearbyBenefits={loadingNearbyBenefits}
            apiBaseUrl={process.env.NEXT_PUBLIC_API_URL}
          />
        );
      case 5:
        return (
          <MediaContactStep
            data={formData}
            onChange={handleInputChange}
            onImageChange={handleImageChange}
            onImageRemove={handleImageRemove}
            errors={errors}
          />
        );
      default:
        return null;
    }
  };

  const progressPercentage = (currentStep / steps.length) * 100;

  // Show loading state while fetching property data in edit mode
  if (loadingProperty) {
    return (
      <div className="modern-property-listing portal-content">
        <div className="text-center py-5">
          <Spinner
            animation="border"
            role="status"
            style={{ color: "var(--portal-primary, #68ac78)" }}
          >
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3 text-muted">Loading property data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-property-listing portal-content">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-title">
            <h2>{isEditMode ? "Edit Property" : "Add New Property"}</h2>
            <p>
              {isEditMode
                ? "Update your property listing information"
                : "Create a comprehensive property listing in 5 simple steps"}
            </p>
          </div>
          <div className="header-actions">
            <Button
              variant="light"
              onClick={handleSaveDraft}
              disabled={isSavingDraft}
            >
              <CIcon icon={cilSave} className="me-1" />
              {isSavingDraft ? "Saving..." : "Save Draft"}
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <Card className="dashboard-card progress-card">
        <Card.Body>
          <div className="progress-header">
            <h5>
              Step {currentStep} of {steps.length}:{" "}
              {steps[currentStep - 1].title}
            </h5>
            <p className="text-muted">{steps[currentStep - 1].description}</p>
          </div>
          <ProgressBar
            now={progressPercentage}
            variant="success"
            className="progress-bar-custom"
            style={{ height: "10px", borderRadius: "5px" }}
          />
          <div className="step-indicators">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`step-indicator ${
                  currentStep > step.id
                    ? "completed"
                    : currentStep === step.id
                      ? "active"
                      : ""
                }`}
              >
                <div className="step-icon">
                  {currentStep > step.id ? (
                    <CIcon icon={cilCheck} />
                  ) : (
                    <CIcon icon={step.icon} />
                  )}
                </div>
                <span className="step-label">{step.title}</span>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Form Content */}
      <Card className="dashboard-card form-card">
        <Card.Body>
          {draftSaved && (
            <Alert
              variant="success"
              className="mb-4"
              dismissible
              onClose={() => setDraftSaved(false)}
            >
              <CIcon icon={cilCheck} className="me-2" />
              <strong>Draft saved successfully!</strong> You can continue
              editing and submit when ready.
            </Alert>
          )}

          {Object.keys(errors).length > 0 && (
            <Alert variant="danger" className="mb-4">
              <CIcon icon={cilWarning} className="me-2" />
              Please fix the following errors:
              <ul className="mb-0 mt-2">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}

          {renderStepContent()}
        </Card.Body>
      </Card>

      {/* Navigation */}
      <Card className="dashboard-card navigation-card">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <Button
              variant="outline-secondary"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <CIcon icon={cilArrowLeft} className="me-1" />
              Previous
            </Button>

            <div className="step-info">
              Step {currentStep} of {steps.length}
            </div>

            {currentStep < steps.length ? (
              <Button variant="primary" onClick={handleNext}>
                Next
                <CIcon icon={cilArrowRight} className="ms-1" />
              </Button>
            ) : (
              <Button
                variant="success"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Property
                    <CIcon icon={cilCheck} className="ms-1" />
                  </>
                )}
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Success Modal */}
      <Modal show={showSuccessModal} onHide={handleCloseSuccessModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <CIcon icon={cilCheck} className="me-2 text-success" />
            Property Listed Successfully!
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Your property has been submitted successfully and is pending
            approval. Our team will review the details and notify you once
            it&apos;s published.
          </p>
          {createdProperty && (
            <div className="mb-3">
              <strong>Reference ID:</strong> #{createdProperty.id}
            </div>
          )}
          <div className="d-flex gap-2">
            <Button
              variant="primary"
              onClick={() => router.push("/portal/dashboard/listings")}
            >
              View All Listings
            </Button>
            <Button
              variant="outline-secondary"
              onClick={handleCloseSuccessModal}
            >
              Close
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      <style jsx>{`
        /* Common styles are now in PortalCommonStyles.css */
        /* Only component-specific styles below */

        .modern-property-listing {
          /* Uses common portal-page-container styles */
        }

        .progress-card,
        .form-card,
        .navigation-card {
          margin-bottom: 2rem;
        }

        .progress-header h5 {
          color: var(--portal-gray-800, #212529);
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .progress-header p {
          color: var(--portal-gray-600, #6c757d);
          margin-bottom: 1.5rem;
        }

        .progress-bar-custom {
          background-color: var(--portal-gray-200, #e9ecef);
        }

        .progress-bar-custom .progress-bar {
          background: linear-gradient(
            135deg,
            var(--portal-primary, #68ac78) 0%,
            var(--portal-primary-dark, #0d5834) 100%
          );
        }

        .step-indicators {
          display: flex;
          justify-content: space-between;
          margin-top: 1.5rem;
          padding: 0 1rem;
        }

        .step-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
          position: relative;
        }

        .step-indicator:not(:last-child)::after {
          content: "";
          position: absolute;
          top: 20px;
          left: 60%;
          width: 80%;
          height: 3px;
          background: var(--portal-gray-200, #e9ecef);
          z-index: 1;
          border-radius: 2px;
        }

        .step-indicator.completed:not(:last-child)::after {
          background: linear-gradient(
            90deg,
            var(--portal-success, #28a745) 0%,
            var(--portal-primary, #68ac78) 100%
          );
        }

        .step-indicator.active:not(:last-child)::after {
          background: linear-gradient(
            90deg,
            var(--portal-success, #28a745) 0%,
            var(--portal-gray-200, #e9ecef) 50%
          );
        }

        .step-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--portal-gray-200, #e9ecef);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--portal-gray-600, #6c757d);
          font-size: 1rem;
          position: relative;
          z-index: 2;
          transition: all 0.3s ease;
          border: 3px solid var(--portal-white, #ffffff);
        }

        .step-indicator.active .step-icon {
          background: linear-gradient(
            135deg,
            var(--portal-primary, #68ac78) 0%,
            var(--portal-primary-dark, #0d5834) 100%
          );
          color: white;
          box-shadow: 0 4px 12px rgba(104, 172, 120, 0.3);
          transform: scale(1.1);
        }

        .step-indicator.completed .step-icon {
          background: linear-gradient(
            135deg,
            var(--portal-success, #28a745) 0%,
            #1e7e34 100%
          );
          color: white;
          box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
        }

        .step-label {
          font-size: 0.8rem;
          color: var(--portal-gray-600, #6c757d);
          text-align: center;
          font-weight: 500;
          margin-top: 0.5rem;
        }

        .step-indicator.active .step-label {
          color: var(--portal-primary, #68ac78);
          font-weight: 600;
        }

        .step-indicator.completed .step-label {
          color: var(--portal-success, #28a745);
          font-weight: 600;
        }

        .step-info {
          color: var(--portal-gray-600, #6c757d);
          font-weight: 600;
          font-size: 0.95rem;
        }

        @media (max-width: 768px) {
          .modern-property-listing {
            padding: 1rem;
          }

          .header-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .step-indicators {
            flex-direction: column;
            gap: 1rem;
          }

          .step-indicator:not(:last-child)::after {
            display: none;
          }

          .step-indicator {
            flex-direction: row;
            justify-content: flex-start;
            text-align: left;
          }

          .step-label {
            text-align: left;
          }
        }

        /* Image Gallery Styles */
        .image-gallery-container {
          margin-top: 1.5rem;
          background: var(--portal-white, #ffffff);
          border: 1px solid var(--portal-gray-200, #e9ecef);
          border-radius: 16px;
          overflow: hidden;
          box-shadow:
            0 4px 12px rgba(0, 0, 0, 0.1),
            0 2px 4px rgba(0, 0, 0, 0.06);
          transition: box-shadow 0.3s ease;
        }

        .image-gallery-container:hover {
          box-shadow:
            0 6px 16px rgba(0, 0, 0, 0.12),
            0 4px 6px rgba(0, 0, 0, 0.08);
        }

        .gallery-header {
          background: linear-gradient(
            135deg,
            var(--portal-primary, #68ac78) 0%,
            var(--portal-primary-dark, #0d5834) 100%
          );
          color: white;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--portal-gray-200, #e9ecef);
        }

        .gallery-title {
          display: flex;
          align-items: center;
          font-weight: 600;
          font-size: 1.1rem;
          margin-bottom: 0.25rem;
        }

        .gallery-title .badge {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
        }

        .image-gallery {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          padding: 1.5rem;
          max-height: 600px;
          overflow-y: auto;
          justify-content: flex-start;
          align-items: flex-start;
        }

        .gallery-item {
          background: var(--portal-white, #ffffff);
          border-radius: 12px;
          overflow: hidden;
          box-shadow:
            0 4px 6px rgba(0, 0, 0, 0.1),
            0 2px 4px rgba(0, 0, 0, 0.06);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 2px solid var(--portal-gray-200, #e9ecef);
          width: 300px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
        }

        .gallery-item:hover {
          transform: translateY(-6px) scale(1.02);
          box-shadow:
            0 12px 24px rgba(0, 0, 0, 0.15),
            0 4px 8px rgba(0, 0, 0, 0.1);
          border-color: var(--portal-primary, #68ac78);
        }

        .image-container {
          position: relative;
          width: 100%;
          height: 200px;
          min-height: 200px;
          max-height: 200px;
          overflow: hidden;
          background: linear-gradient(
            135deg,
            var(--portal-gray-50, #f8f9fa) 0%,
            var(--portal-gray-200, #e9ecef) 100%
          );
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .gallery-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          display: block;
          max-width: 100%;
          max-height: 100%;
        }

        .gallery-item:hover .gallery-image {
          transform: scale(1.08);
        }

        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.4),
            rgba(0, 0, 0, 0.2)
          );
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(2px);
        }

        .gallery-item:hover .image-overlay {
          opacity: 1;
        }

        .remove-btn {
          background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
          border: none;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 18px;
          box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
          z-index: 10;
        }

        .remove-btn:hover {
          background: linear-gradient(135deg, #c82333 0%, #bd2130 100%);
          transform: scale(1.15) rotate(90deg);
          box-shadow: 0 6px 16px rgba(220, 53, 69, 0.5);
        }

        .remove-btn:active {
          transform: scale(1.05) rotate(90deg);
        }

        .image-number {
          position: absolute;
          top: 10px;
          left: 10px;
          background: linear-gradient(
            135deg,
            rgba(102, 126, 234, 0.9) 0%,
            rgba(118, 75, 162, 0.9) 100%
          );
          color: white;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          z-index: 5;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .image-details {
          padding: 1rem 1.25rem;
          background: #ffffff;
          border-top: 1px solid #f1f3f4;
          flex-grow: 1;
        }

        .file-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: #212529;
          margin-bottom: 0.375rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.4;
        }

        .file-size {
          font-size: 0.75rem;
          color: #6c757d;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .file-size::before {
          content: "📦";
          font-size: 0.7rem;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .image-gallery {
            gap: 1rem;
            padding: 1rem;
            justify-content: center;
          }

          .gallery-item {
            width: 100%;
            max-width: 300px;
            min-width: 280px;
          }

          .image-container {
            height: 200px;
          }

          .gallery-header {
            padding: 0.75rem 1rem;
          }

          .gallery-title {
            font-size: 1rem;
          }

          .image-details {
            padding: 0.875rem 1rem;
          }
        }

        @media (max-width: 480px) {
          .image-gallery {
            gap: 0.75rem;
            padding: 0.75rem;
            justify-content: center;
          }

          .gallery-item {
            width: 100%;
            max-width: 100%;
            min-width: auto;
          }

          .image-container {
            height: 200px;
          }

          .remove-btn {
            width: 38px;
            height: 38px;
            font-size: 16px;
          }

          .image-number {
            width: 24px;
            height: 24px;
            font-size: 0.75rem;
            top: 8px;
            left: 8px;
          }

          .image-details {
            padding: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}

// Step Components
function BasicInformationStep({
  data,
  onChange,
  errors,
  propertyTypes = [],
  propertyStatus = [],
}) {
  const fieldVisibility = getFieldVisibility(
    data.listingType,
    data.subType,
    data.status,
  );

  return (
    <div className="step-content">
      <div className="step-header">
        <h4 className="step-title">Basic Property Information</h4>
        <p className="step-subtitle">
          Tell us about your property type and basic details
        </p>
      </div>

      <Row className="g-4">
        <Col md={6}>
          <div className="form-group-enhanced">
            <label className="form-label-enhanced">
              <CIcon icon={cilHome} className="label-icon" />
              Listing Type
              <span className="required-indicator">*</span>
            </label>
            <div className="select-wrapper">
              <Form.Select
                value={data.listingType}
                onChange={(e) => onChange("listingType", e.target.value)}
                isInvalid={!!errors.listingType}
                className="form-control-enhanced"
              >
                <option value="">Choose listing type</option>
                {propertyTypes.length > 0 ? (
                  propertyTypes.map((type) => (
                    <option
                      key={type.id || type.projectTypeName}
                      value={type.projectTypeName}
                    >
                      {type.projectTypeName}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Residential">🏠 Residential</option>
                    <option value="Commercial">🏢 Commercial</option>
                  </>
                )}
              </Form.Select>
              <div className="select-arrow"></div>
            </div>
            {errors.listingType && (
              <div className="error-message">
                <CIcon icon={cilWarning} className="error-icon" />
                {errors.listingType}
              </div>
            )}
          </div>
        </Col>

        <Col md={6}>
          <div className="form-group-enhanced">
            <label className="form-label-enhanced">
              <CIcon icon={cilMoney} className="label-icon" />
              Transaction Type
              <span className="required-indicator">*</span>
            </label>
            <div className="select-wrapper">
              <Form.Select
                value={data.transaction}
                onChange={(e) => onChange("transaction", e.target.value)}
                isInvalid={!!errors.transaction}
                className="form-control-enhanced"
              >
                <option value="">Choose transaction type</option>
                <option value="Sale">💰 Sale</option>
                {/* <option value="Rent">📋 Rent/Lease</option> */}
              </Form.Select>
              <div className="select-arrow"></div>
            </div>
            {errors.transaction && (
              <div className="error-message">
                <CIcon icon={cilWarning} className="error-icon" />
                {errors.transaction}
              </div>
            )}
          </div>
        </Col>

        <Col md={6}>
          <div className="form-group-enhanced">
            <label className="form-label-enhanced">
              <CIcon icon={cilStar} className="label-icon" />
              Property Sub-Type
              <span className="required-indicator">*</span>
            </label>
            <div className="select-wrapper">
              <Form.Select
                value={data.subType}
                onChange={(e) => onChange("subType", e.target.value)}
                isInvalid={!!errors.subType}
                className="form-control-enhanced"
              >
                <option value="">Choose property sub-type</option>
                {data.listingType === "Residential" ? (
                  <>
                    <option value="Apartment">🏢 Apartment</option>
                    <option value="Villa">🏡 Villa</option>
                    <option value="Plot">📐 Plot</option>
                    <option value="Studio">🏠 Studio</option>
                    <option value="Penthouse">🏗️ Penthouse</option>
                    <option value="Farmhouse">🌾 Farmhouse</option>
                    <option value="Independent House">
                      🏘️ Independent House
                    </option>
                  </>
                ) : (
                  <>
                    <option value="Office">💼 Office</option>
                    <option value="Retail">🛍️ Retail</option>
                    <option value="Warehouse">🏭 Warehouse</option>
                    <option value="Industrial">🏗️ Industrial</option>
                    <option value="Land">📐 Land</option>
                  </>
                )}
              </Form.Select>
              <div className="select-arrow"></div>
            </div>
            {errors.subType && (
              <div className="error-message">
                <CIcon icon={cilWarning} className="error-icon" />
                {errors.subType}
              </div>
            )}
          </div>
        </Col>

        <Col md={6}>
          <div className="form-group-enhanced">
            <label className="form-label-enhanced">
              <CIcon icon={cilCheck} className="label-icon" />
              Property Status
              <span className="required-indicator">*</span>
            </label>
            <div className="select-wrapper">
              <Form.Select
                value={data.status}
                onChange={(e) => onChange("status", e.target.value)}
                isInvalid={!!errors.status}
                className="form-control-enhanced"
              >
                <option value="">Choose property status</option>
                {propertyStatus.length > 0 ? (
                  propertyStatus.map((status) => (
                    <option
                      key={status.id || status.statusName}
                      value={status.statusName || status.status}
                    >
                      {status.statusName || status.status}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Ready to Move">✅ Ready to Move</option>
                    <option value="Under-Construction">
                      🚧 Under Construction
                    </option>
                  </>
                )}
              </Form.Select>
              <div className="select-arrow"></div>
            </div>
            {errors.status && (
              <div className="error-message">
                <CIcon icon={cilWarning} className="error-icon" />
                {errors.status}
              </div>
            )}
          </div>
        </Col>

        <Col md={12}>
          <div className="form-group-enhanced">
            <label className="form-label-enhanced">
              <CIcon icon={cilStar} className="label-icon" />
              Property Description
              <span className="required-indicator">*</span>
            </label>
            <div className="textarea-wrapper">
              <Form.Control
                as="textarea"
                rows={4}
                value={data.description}
                onChange={(e) => onChange("description", e.target.value)}
                placeholder="Describe your property in detail... What makes it special? Mention key features, amenities, and location benefits."
                isInvalid={!!errors.description}
                className="form-control-enhanced textarea-enhanced"
              />
              <div className="textarea-footer">
                <div className="char-counter">
                  <span
                    className={
                      data.description.length > 1000
                        ? "text-warning"
                        : "text-muted"
                    }
                  >
                    {data.description.length}
                  </span>
                  /1200 characters
                </div>
                <div className="char-indicator">
                  <div
                    className="char-progress"
                    style={{
                      width: `${(data.description.length / 1200) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
            {errors.description && (
              <div className="error-message">
                <CIcon icon={cilWarning} className="error-icon" />
                {errors.description}
              </div>
            )}
          </div>
        </Col>

        {/* Conditional fields based on property type, subtype, and status */}
        {fieldVisibility.showPossession && (
          <Col md={6}>
            <div className="form-group-enhanced">
              <label className="form-label-enhanced">
                <CIcon icon={cilCalendar} className="label-icon" />
                Possession Date
                <span className="required-indicator">*</span>
              </label>
              <Form.Control
                type="date"
                value={data.possession || ""}
                onChange={(e) => onChange("possession", e.target.value)}
                isInvalid={!!errors.possession}
                className="form-control-enhanced"
              />
              {errors.possession && (
                <div className="error-message">
                  <CIcon icon={cilWarning} className="error-icon" />
                  {errors.possession}
                </div>
              )}
            </div>
          </Col>
        )}

        {fieldVisibility.showOccupancy && (
          <Col md={6}>
            <div className="form-group-enhanced">
              <label className="form-label-enhanced">
                <CIcon icon={cilUser} className="label-icon" />
                Occupancy Status
              </label>
              <div className="select-wrapper">
                <Form.Select
                  value={data.occupancy || ""}
                  onChange={(e) => onChange("occupancy", e.target.value)}
                  className="form-control-enhanced"
                >
                  <option value="">Select Occupancy</option>
                  <option value="Vacant">Vacant</option>
                  <option value="Tenanted">Tenanted</option>
                  <option value="Self Occupied">Self Occupied</option>
                </Form.Select>
                <div className="select-arrow"></div>
              </div>
            </div>
          </Col>
        )}

        {fieldVisibility.showNoticePeriod && (
          <Col md={6}>
            <div className="form-group-enhanced">
              <label className="form-label-enhanced">
                <CIcon icon={cilFlagAlt} className="label-icon" />
                Notice Period (Days)
              </label>
              <Form.Control
                type="number"
                min="0"
                value={data.noticePeriod || ""}
                onChange={(e) => onChange("noticePeriod", e.target.value)}
                placeholder="e.g., 30"
                className="form-control-enhanced"
              />
            </div>
          </Col>
        )}
      </Row>
    </div>
  );
}

function LocationAreaStep({
  data,
  onChange,
  errors,
  builderList = [],
  projectList = [],
  cities = [],
  loadingCities = false,
  loadingBuilders = false,
  loadingProjects = false,
}) {
  const fieldVisibility = getFieldVisibility(
    data.listingType,
    data.subType,
    data.status,
  );
  const [projectSearchTerm, setProjectSearchTerm] = useState("");
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [projectInputFocused, setProjectInputFocused] = useState(false);
  const [projectHighlightedIndex, setProjectHighlightedIndex] = useState(-1);

  const [builderSearchTerm, setBuilderSearchTerm] = useState("");
  const [showBuilderDropdown, setShowBuilderDropdown] = useState(false);
  const [builderInputFocused, setBuilderInputFocused] = useState(false);
  const [builderHighlightedIndex, setBuilderHighlightedIndex] = useState(-1);

  const [citySearchTerm, setCitySearchTerm] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [cityInputFocused, setCityInputFocused] = useState(false);
  const [cityHighlightedIndex, setCityHighlightedIndex] = useState(-1);

  // Refs to track dropdown clicks
  const projectDropdownRef = useRef(null);
  const builderDropdownRef = useRef(null);
  const cityDropdownRef = useRef(null);

  // Filter projects based on search term
  const filteredProjects = projectList
    .filter(project => project.propertyTypeName === data.listingType).filter((project) => {
      if (!projectSearchTerm.trim()) return false; // Don't show all when empty
      const projectName = (
        project.projectName ||
        project.name ||
        ""
      ).toLowerCase();
      const searchLower = projectSearchTerm.toLowerCase();
      return projectName.includes(searchLower);
    })
    .slice(0, 10); // Limit to 10 results for better UX

  // Filter builders based on search term
  const filteredBuilders = builderList
    .filter((builder) => {
      if (!builderSearchTerm.trim()) return false; // Don't show all when empty
      const builderName = (
        builder.builderName ||
        builder.name ||
        ""
      ).toLowerCase();
      const searchLower = builderSearchTerm.toLowerCase();
      return builderName.includes(searchLower);
    })
    .slice(0, 10); // Limit to 10 results for better UX

  // Filter cities based on search term
  const filteredCities = cities
    .filter((city) => {
      if (!citySearchTerm.trim()) return false; // Don't show all when empty
      const cityName = (city.cityName || city.name || city).toLowerCase();
      const searchLower = citySearchTerm.toLowerCase();
      return cityName.includes(searchLower);
    })
    .slice(0, 10); // Limit to 10 results for better UX

  // Handle project input change
  const handleProjectInputChange = (value) => {
    setProjectSearchTerm(value);
    onChange("projectName", value);
    onChange("projectId", null); // Clear ID when typing custom text
    setShowProjectDropdown(true);
    setProjectHighlightedIndex(-1);
  };

  // Handle builder input change
  const handleBuilderInputChange = (value) => {
    setBuilderSearchTerm(value);
    onChange("builderName", value);
    onChange("builderId", null); // Clear ID when typing custom text
    setShowBuilderDropdown(true);
    setBuilderHighlightedIndex(-1);
  };

  // Handle city input change
  const handleCityInputChange = (value) => {
    setCitySearchTerm(value);
    onChange("city", value);
    onChange("cityId", null); // Clear ID when typing
    setShowCityDropdown(true);
    setCityHighlightedIndex(-1);
  };

  // Handle keyboard navigation for project
  const handleProjectKeyDown = (e) => {
    if (!showProjectDropdown || filteredProjects.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setProjectHighlightedIndex((prev) =>
        prev < filteredProjects.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setProjectHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && projectHighlightedIndex >= 0) {
      e.preventDefault();
      handleProjectSelect(filteredProjects[projectHighlightedIndex], e);
    } else if (e.key === "Escape") {
      setShowProjectDropdown(false);
      setProjectInputFocused(false);
    }
  };

  // Handle keyboard navigation for builder
  const handleBuilderKeyDown = (e) => {
    if (!showBuilderDropdown || filteredBuilders.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setBuilderHighlightedIndex((prev) =>
        prev < filteredBuilders.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setBuilderHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && builderHighlightedIndex >= 0) {
      e.preventDefault();
      handleBuilderSelect(filteredBuilders[builderHighlightedIndex], e);
    } else if (e.key === "Escape") {
      setShowBuilderDropdown(false);
      setBuilderInputFocused(false);
    }
  };

  // Handle keyboard navigation for city
  const handleCityKeyDown = (e) => {
    if (!showCityDropdown || filteredCities.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCityHighlightedIndex((prev) =>
        prev < filteredCities.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCityHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && cityHighlightedIndex >= 0) {
      e.preventDefault();
      handleCitySelect(filteredCities[cityHighlightedIndex], e);
    } else if (e.key === "Escape") {
      setShowCityDropdown(false);
      setCityInputFocused(false);
    }
  };

  // Handle project selection from dropdown
  const handleProjectSelect = (project, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const projectName = project.projectName || project.name;
    setProjectSearchTerm(projectName);
    onChange("projectName", projectName);
    if (project.id) {
      onChange("projectId", project.id);
    }

    // Auto-fill builder, city, and locality from selected project
    if (project.builderName) {
      setBuilderSearchTerm(project.builderName);
      onChange("builderName", project.builderName);
      if (project.builderId) {
        onChange("builderId", project.builderId);
      }
    }

    if (project.cityName) {
      setCitySearchTerm(project.cityName);
      onChange("city", project.cityName);
      if (project.cityId) {
        onChange("cityId", project.cityId);
      }
    }

    if (project.projectLocality) {
      onChange("locality", project.projectLocality);
      if (project.localityId) {
        onChange("localityId", project.localityId);
      }
    }

    setShowProjectDropdown(false);
    setProjectInputFocused(false);
  };

  // Handle builder selection from dropdown
  const handleBuilderSelect = (builder, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const builderName = builder.builderName || builder.name;
    setBuilderSearchTerm(builderName);
    onChange("builderName", builderName);
    if (builder.id) {
      onChange("builderId", builder.id);
    }
    setShowBuilderDropdown(false);
    setBuilderInputFocused(false);
  };

  // Handle city selection from dropdown
  const handleCitySelect = (city, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const cityName = city.cityName || city.name || city;
    setCitySearchTerm(cityName);
    onChange("city", cityName);
    if (city.id) {
      onChange("cityId", city.id);
    }
    setShowCityDropdown(false);
    setCityInputFocused(false);
  };

  // Handle input focus
  const handleProjectFocus = () => {
    setProjectInputFocused(true);
    setShowProjectDropdown(true);
  };

  const handleBuilderFocus = () => {
    setBuilderInputFocused(true);
    setShowBuilderDropdown(true);
  };

  const handleCityFocus = () => {
    setCityInputFocused(true);
    setShowCityDropdown(true);
  };

  // Handle input blur (with delay to allow click on dropdown)
  const handleProjectBlur = (e) => {
    // Check if the related target (where focus is moving) is inside the dropdown
    if (
      projectDropdownRef.current &&
      projectDropdownRef.current.contains(e.relatedTarget)
    ) {
      return; // Don't close if clicking inside dropdown
    }
    setTimeout(() => {
      // Double-check if dropdown is still not being interacted with
      if (!projectDropdownRef.current?.matches(":hover")) {
        setShowProjectDropdown(false);
        setProjectInputFocused(false);
      }
    }, 300);
  };

  const handleBuilderBlur = (e) => {
    if (
      builderDropdownRef.current &&
      builderDropdownRef.current.contains(e.relatedTarget)
    ) {
      return;
    }
    setTimeout(() => {
      if (!builderDropdownRef.current?.matches(":hover")) {
        setShowBuilderDropdown(false);
        setBuilderInputFocused(false);
      }
    }, 300);
  };

  const handleCityBlur = (e) => {
    if (
      cityDropdownRef.current &&
      cityDropdownRef.current.contains(e.relatedTarget)
    ) {
      return;
    }
    setTimeout(() => {
      if (!cityDropdownRef.current?.matches(":hover")) {
        setShowCityDropdown(false);
        setCityInputFocused(false);
      }
    }, 300);
  };

  // Initialize search term from data
  useEffect(() => {
    if (data.projectName && !projectSearchTerm) {
      setProjectSearchTerm(data.projectName);
    }
    if (data.builderName && !builderSearchTerm) {
      setBuilderSearchTerm(data.builderName);
    }
    if (data.city && !citySearchTerm) {
      setCitySearchTerm(data.city);
    }
  }, [data.projectName, data.builderName, data.city]);

  return (
    <div className="step-content">
      <div className="step-header">
        <h4 className="step-title">Location & Area Details</h4>
        <p className="step-subtitle">
          Provide location information and property measurements
        </p>
      </div>

      <Row className="g-4">
        <Col md={6}>
          <div className="form-group-enhanced">
            <label className="form-label-enhanced">
              <CIcon icon={cilBuilding} className="label-icon" />
              Project/Building Name
              <span className="required-indicator">*</span>
            </label>
            <div
              className="searchable-select-wrapper"
              style={{ position: "relative" }}
            >
              <Form.Control
                type="text"
                value={projectSearchTerm}
                onChange={(e) => handleProjectInputChange(e.target.value)}
                onFocus={handleProjectFocus}
                onBlur={handleProjectBlur}
                onKeyDown={handleProjectKeyDown}
                placeholder={
                  loadingProjects
                    ? "Loading projects..."
                    : "Type to search or enter custom project name"
                }
                className="form-control-enhanced"
                disabled={loadingProjects}
                autoComplete="off"
                isInvalid={!!errors.projectName}
              />
              {loadingProjects && (
                <div
                  className="position-absolute"
                  style={{
                    right: "15px",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                >
                  <div
                    className="spinner-border spinner-border-sm text-primary"
                    role="status"
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}

              {/* Dropdown with filtered results */}
              {showProjectDropdown && projectInputFocused && (
                <div
                  ref={projectDropdownRef}
                  className="project-dropdown"
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    backgroundColor: "white",
                    border: "1px solid #e9ecef",
                    borderRadius: "0 0 10px 10px",
                    maxHeight: "200px",
                    overflowY: "auto",
                    zIndex: 1000,
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    marginTop: "2px",
                  }}
                  onMouseDown={(e) => e.preventDefault()} // Prevent input blur on dropdown click
                >
                  {filteredProjects.length > 0 ? (
                    filteredProjects.map((project, index) => {
                      const projectName = project.projectName || project.name;
                      const isHighlighted = index === projectHighlightedIndex;
                      return (
                        <div
                          key={project.id || projectName}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleProjectSelect(project, e);
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleProjectSelect(project, e);
                          }}
                          onMouseEnter={() => setProjectHighlightedIndex(index)}
                          style={{
                            padding: "0.75rem 1rem",
                            cursor: "pointer",
                            borderBottom: "1px solid #f1f3f4",
                            transition: "background-color 0.2s",
                            backgroundColor: isHighlighted
                              ? "#f8f9fa"
                              : "white",
                            userSelect: "none",
                          }}
                        >
                          <div style={{ fontWeight: 500, color: "#212529" }}>
                            {projectName}
                          </div>
                          {project.projectLocality && (
                            <div
                              style={{
                                fontSize: "0.875rem",
                                color: "#6c757d",
                                marginTop: "0.25rem",
                              }}
                            >
                              {project.projectLocality}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : projectSearchTerm.trim() ? (
                    <div
                      style={{
                        padding: "1rem",
                        textAlign: "center",
                        color: "#6c757d",
                      }}
                    >
                      No projects found. You can enter a custom name.
                    </div>
                  ) : null}
                </div>
              )}
            </div>
            {errors.projectName && (
              <div className="error-message">
                <CIcon icon={cilWarning} className="error-icon" />
                {errors.projectName}
              </div>
            )}
          </div>
        </Col>

        <Col md={6}>
          <div className="form-group-enhanced">
            <label className="form-label-enhanced">
              <CIcon icon={cilUser} className="label-icon" />
              Builder/Developer Name
              <span className="optional-indicator">(Optional)</span>
            </label>
            <div
              className="searchable-select-wrapper"
              style={{ position: "relative" }}
            >
              <Form.Control
                type="text"
                value={builderSearchTerm}
                onChange={(e) => handleBuilderInputChange(e.target.value)}
                onFocus={handleBuilderFocus}
                onBlur={handleBuilderBlur}
                onKeyDown={handleBuilderKeyDown}
                placeholder={
                  loadingBuilders
                    ? "Loading builders..."
                    : "Type to search or enter custom builder name"
                }
                className="form-control-enhanced"
                disabled={loadingBuilders}
                autoComplete="off"
              />
              {loadingBuilders && (
                <div
                  className="position-absolute"
                  style={{
                    right: "15px",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                >
                  <div
                    className="spinner-border spinner-border-sm text-primary"
                    role="status"
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}

              {/* Dropdown with filtered results */}
              {showBuilderDropdown && builderInputFocused && (
                <div
                  ref={builderDropdownRef}
                  className="builder-dropdown"
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    backgroundColor: "white",
                    border: "1px solid #e9ecef",
                    borderRadius: "0 0 10px 10px",
                    maxHeight: "200px",
                    overflowY: "auto",
                    zIndex: 1000,
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    marginTop: "2px",
                  }}
                  onMouseDown={(e) => e.preventDefault()} // Prevent input blur on dropdown click
                >
                  {filteredBuilders.length > 0 ? (
                    filteredBuilders.map((builder, index) => {
                      const builderName = builder.builderName || builder.name;
                      const isHighlighted = index === builderHighlightedIndex;
                      return (
                        <div
                          key={builder.id || builderName}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleBuilderSelect(builder, e);
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleBuilderSelect(builder, e);
                          }}
                          onMouseEnter={() => setBuilderHighlightedIndex(index)}
                          style={{
                            padding: "0.75rem 1rem",
                            cursor: "pointer",
                            borderBottom: "1px solid #f1f3f4",
                            transition: "background-color 0.2s",
                            backgroundColor: isHighlighted
                              ? "#f8f9fa"
                              : "white",
                            userSelect: "none",
                          }}
                          onMouseLeave={() => setBuilderHighlightedIndex(-1)}
                        >
                          {builderName}
                        </div>
                      );
                    })
                  ) : builderSearchTerm ? (
                    <div
                      style={{
                        padding: "0.75rem 1rem",
                        color: "#28a745",
                        fontWeight: "500",
                      }}
                    >
                      ✓ Custom builder: &quot;{builderSearchTerm}&quot; will be
                      saved
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: "0.75rem 1rem",
                        color: "#6c757d",
                      }}
                    >
                      {loadingBuilders
                        ? "Loading..."
                        : "Start typing to search or enter a custom builder name"}
                    </div>
                  )}
                </div>
              )}
            </div>
            <Form.Text
              className="text-muted"
              style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}
            >
              <CIcon icon={cilCheck} className="me-1" />
              Type to search from list or enter a custom builder name
            </Form.Text>
          </div>
        </Col>

        <Col md={12}>
          <div className="form-group-enhanced">
            <label className="form-label-enhanced">
              <CIcon icon={cilLocationPin} className="label-icon" />
              Complete Address
              <span className="required-indicator">*</span>
            </label>
            <Form.Control
              as="textarea"
              rows={3}
              value={data.address}
              onChange={(e) => onChange("address", e.target.value)}
              placeholder="Enter complete address with landmark and nearby landmarks"
              isInvalid={!!errors.address}
              className="form-control-enhanced textarea-enhanced"
            />
            {errors.address && (
              <div className="error-message">
                <CIcon icon={cilWarning} className="error-icon" />
                {errors.address}
              </div>
            )}
          </div>
        </Col>

        <Col md={6}>
          <div className="form-group-enhanced">
            <label className="form-label-enhanced">
              <CIcon icon={cilMap} className="label-icon" />
              Locality/Area
              <span className="required-indicator">*</span>
            </label>
            <Form.Control
              type="text"
              value={data.locality}
              onChange={(e) => onChange("locality", e.target.value)}
              placeholder="e.g., Sector 45, Gurgaon"
              isInvalid={!!errors.locality}
              className="form-control-enhanced"
            />
            {errors.locality && (
              <div className="error-message">
                <CIcon icon={cilWarning} className="error-icon" />
                {errors.locality}
              </div>
            )}
          </div>
        </Col>

        <Col md={6}>
          <div className="form-group-enhanced">
            <label className="form-label-enhanced">
              <CIcon icon={cilLocationPin} className="label-icon" />
              City
              <span className="required-indicator">*</span>
            </label>
            <div
              className="searchable-select-wrapper"
              style={{ position: "relative" }}
            >
              <Form.Control
                type="text"
                value={citySearchTerm}
                onChange={(e) => handleCityInputChange(e.target.value)}
                onFocus={handleCityFocus}
                onBlur={handleCityBlur}
                onKeyDown={handleCityKeyDown}
                placeholder={
                  loadingCities ? "Loading cities..." : "Type to search city"
                }
                className="form-control-enhanced"
                disabled={loadingCities}
                isInvalid={!!errors.city}
                autoComplete="off"
              />
              {loadingCities && (
                <div
                  className="position-absolute"
                  style={{
                    right: "15px",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                >
                  <div
                    className="spinner-border spinner-border-sm text-primary"
                    role="status"
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}

              {/* Dropdown with filtered results */}
              {showCityDropdown && cityInputFocused && (
                <div
                  ref={cityDropdownRef}
                  className="city-dropdown"
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    backgroundColor: "white",
                    border: "1px solid #e9ecef",
                    borderRadius: "0 0 10px 10px",
                    maxHeight: "200px",
                    overflowY: "auto",
                    zIndex: 1000,
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    marginTop: "2px",
                  }}
                  onMouseDown={(e) => e.preventDefault()} // Prevent input blur on dropdown click
                >
                  {filteredCities.length > 0 ? (
                    filteredCities.map((city, index) => {
                      const cityName = city.cityName || city.name || city;
                      const isHighlighted = index === cityHighlightedIndex;
                      return (
                        <div
                          key={city.id || cityName}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCitySelect(city, e);
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCitySelect(city, e);
                          }}
                          onMouseEnter={() => setCityHighlightedIndex(index)}
                          style={{
                            padding: "0.75rem 1rem",
                            cursor: "pointer",
                            borderBottom: "1px solid #f1f3f4",
                            transition: "background-color 0.2s",
                            backgroundColor: isHighlighted
                              ? "#f8f9fa"
                              : "white",
                            userSelect: "none",
                          }}
                          onMouseLeave={() => setCityHighlightedIndex(-1)}
                        >
                          {cityName}
                          {city.state && (
                            <span
                              style={{
                                color: "#6c757d",
                                fontSize: "0.85rem",
                                marginLeft: "0.5rem",
                              }}
                            >
                              ({city.state})
                            </span>
                          )}
                        </div>
                      );
                    })
                  ) : citySearchTerm ? (
                    <div
                      style={{
                        padding: "0.75rem 1rem",
                        color: "#6c757d",
                        fontStyle: "italic",
                      }}
                    >
                      No matching cities found. Please select from the list.
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: "0.75rem 1rem",
                        color: "#6c757d",
                      }}
                    >
                      {loadingCities
                        ? "Loading..."
                        : "Start typing to search cities"}
                    </div>
                  )}
                </div>
              )}
            </div>
            {errors.city && (
              <div className="error-message">
                <CIcon icon={cilWarning} className="error-icon" />
                {errors.city}
              </div>
            )}
            <Form.Text
              className="text-muted"
              style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}
            >
              <CIcon icon={cilCheck} className="me-1" />
              Type to search from available cities
            </Form.Text>
          </div>
        </Col>

        <Col md={6}>
          <div className="form-group-enhanced">
            <label className="form-label-enhanced">
              <CIcon icon={cilEnvelopeOpen} className="label-icon" />
              PIN Code
              <span className="required-indicator">*</span>
            </label>
            <Form.Control
              type="text"
              value={data.pincode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, ""); // Only allow digits
                onChange("pincode", value.slice(0, 6)); // Limit to 6 digits
              }}
              placeholder="6-digit PIN code"
              maxLength={6}
              isInvalid={!!errors.pincode}
              className="form-control-enhanced"
            />
            {errors.pincode && (
              <div className="error-message">
                <CIcon icon={cilWarning} className="error-icon" />
                {errors.pincode}
              </div>
            )}
          </div>
        </Col>

        {/* Conditional Area Fields */}
        {fieldVisibility.showPlotArea && (
          <Col md={6}>
            <Form.Group>
              <Form.Label>Plot Area (sq ft) *</Form.Label>
              <Form.Control
                type="number"
                value={data.plotArea}
                onChange={(e) => onChange("plotArea", e.target.value)}
                placeholder="Enter plot area"
                min={50}
                isInvalid={!!errors.plotArea}
              />
              <Form.Control.Feedback type="invalid">
                {errors.plotArea}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        )}

        {fieldVisibility.showCarpetArea && (
          <Col md={6}>
            <Form.Group>
              <Form.Label>Carpet Area (sq ft) *</Form.Label>
              <Form.Control
                type="number"
                value={data.carpetArea}
                onChange={(e) => onChange("carpetArea", e.target.value)}
                placeholder="Enter carpet area"
                min={50}
                isInvalid={!!errors.carpetArea}
              />
              <Form.Control.Feedback type="invalid">
                {errors.carpetArea}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                <CIcon icon={cilCheck} className="me-1" />
                Used for automatic price calculations
              </Form.Text>
            </Form.Group>
          </Col>
        )}

        {fieldVisibility.showBuiltUpArea && (
          <Col md={6}>
            <Form.Group>
              <Form.Label>Built-up Area (sq ft)</Form.Label>
              <Form.Control
                type="number"
                value={data.builtUpArea}
                onChange={(e) => onChange("builtUpArea", e.target.value)}
                placeholder="Enter built-up area"
                min={0}
              />
            </Form.Group>
          </Col>
        )}

        {fieldVisibility.showSuperBuiltUpArea && (
          <Col md={6}>
            <Form.Group>
              <Form.Label>Super Built-up Area (sq ft)</Form.Label>
              <Form.Control
                type="number"
                value={data.superBuiltUpArea}
                onChange={(e) => onChange("superBuiltUpArea", e.target.value)}
                placeholder="Enter super built-up area"
                min={0}
              />
            </Form.Group>
          </Col>
        )}
      </Row>
    </div>
  );
}

function PricingDetailsStep({ data, onChange, errors }) {
  const fieldVisibility = getFieldVisibility(
    data.listingType,
    data.subType,
    data.status,
  );

  // Number formatting functions
  const formatNumberWithCommas = (value) => {
    if (!value) return "";
    const num = parseInt(value.toString().replace(/,/g, ""));
    return isNaN(num) ? "" : num.toLocaleString("en-IN");
  };

  const parseNumberFromFormatted = (value) => {
    if (!value) return "";
    return value.toString().replace(/,/g, "");
  };

  // Auto-calculation functions
  const calculatePricePerSqFt = (totalPrice, carpetArea) => {
    if (totalPrice && carpetArea && carpetArea > 0) {
      return Math.round(totalPrice / carpetArea);
    }
    return "";
  };

  const calculateTotalPrice = (pricePerSqFt, carpetArea) => {
    if (pricePerSqFt && carpetArea && carpetArea > 0) {
      return Math.round(pricePerSqFt * carpetArea);
    }
    return "";
  };

  const handleTotalPriceChange = (value) => {
    const cleanValue = parseNumberFromFormatted(value);
    onChange("totalPrice", cleanValue);
    if (cleanValue && data.carpetArea) {
      const calculatedPricePerSqFt = calculatePricePerSqFt(
        parseInt(cleanValue),
        parseInt(data.carpetArea),
      );
      if (calculatedPricePerSqFt) {
        onChange("pricePerSqFt", calculatedPricePerSqFt.toString());
      }
    }
  };

  const handlePricePerSqFtChange = (value) => {
    const cleanValue = parseNumberFromFormatted(value);
    onChange("pricePerSqFt", cleanValue);
    if (cleanValue && data.carpetArea) {
      const calculatedTotalPrice = calculateTotalPrice(
        parseInt(cleanValue),
        parseInt(data.carpetArea),
      );
      if (calculatedTotalPrice) {
        onChange("totalPrice", calculatedTotalPrice.toString());
      }
    }
  };

  return (
    <div className="step-content">
      <h4 className="step-title mb-4">Pricing & Property Details</h4>

      <Row className="g-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>
              Total Price (₹)
              <span className="required-indicator">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              value={formatNumberWithCommas(data.totalPrice)}
              onChange={(e) => handleTotalPriceChange(e.target.value)}
              placeholder="Enter total price (e.g., 50,00,000)"
              isInvalid={!!errors.totalPrice}
              className="form-control-enhanced price-field"
            />
            <Form.Control.Feedback type="invalid">
              {errors.totalPrice}
            </Form.Control.Feedback>
            {data.carpetArea && (
              <Form.Text className="text-muted">
                <CIcon icon={cilCheck} className="me-1" />
                Auto-calculates price per sq ft based on carpet area (
                {data.carpetArea} sq ft)
              </Form.Text>
            )}
          </Form.Group>
        </Col>

        {fieldVisibility.showPricePerSqFt && (
          <Col md={6}>
            <Form.Group>
              <Form.Label>Price per sq ft (₹)</Form.Label>
              <Form.Control
                type="text"
                value={formatNumberWithCommas(data.pricePerSqFt)}
                onChange={(e) => handlePricePerSqFtChange(e.target.value)}
                placeholder="Price per square foot (e.g., 5,000)"
                className="form-control-enhanced price-field"
              />
              {data.carpetArea && (
                <Form.Text className="text-muted">
                  <CIcon icon={cilCheck} className="me-1" />
                  Auto-calculates total price based on carpet area (
                  {data.carpetArea} sq ft)
                </Form.Text>
              )}
            </Form.Group>
          </Col>
        )}

        {fieldVisibility.showMaintenanceCharges && (
          <Col md={6}>
            <Form.Group>
              <Form.Label>Maintenance Charges (₹/month)</Form.Label>
              <Form.Control
                type="text"
                value={formatNumberWithCommas(data.maintenanceCharges)}
                onChange={(e) =>
                  onChange(
                    "maintenanceCharges",
                    parseNumberFromFormatted(e.target.value),
                  )
                }
                placeholder="Monthly maintenance charges (e.g., 2,500)"
                className="form-control-enhanced price-field"
              />
            </Form.Group>
          </Col>
        )}

        {fieldVisibility.showBookingAmount && (
          <Col md={6}>
            <Form.Group>
              <Form.Label>Booking Amount (₹)</Form.Label>
              <Form.Control
                type="text"
                value={formatNumberWithCommas(data.bookingAmount)}
                onChange={(e) =>
                  onChange(
                    "bookingAmount",
                    parseNumberFromFormatted(e.target.value),
                  )
                }
                placeholder="Booking amount (e.g., 1,00,000)"
                className="form-control-enhanced price-field"
              />
            </Form.Group>
          </Col>
        )}

        {fieldVisibility.showFloor && (
          <Col md={6}>
            <Form.Group>
              <Form.Label>Floor Number *</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={data.floor}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow empty string or positive numbers only
                  if (
                    value === "" ||
                    (!isNaN(value) && parseFloat(value) >= 0)
                  ) {
                    onChange("floor", value);
                  }
                }}
                onBlur={(e) => {
                  const value = parseFloat(e.target.value);
                  // Clear if negative on blur
                  if (!isNaN(value) && value < 0) {
                    onChange("floor", "");
                  }
                }}
                placeholder="Floor number"
                isInvalid={!!errors.floor}
              />
              <Form.Control.Feedback type="invalid">
                {errors.floor}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        )}

        {fieldVisibility.showTotalFloors && (
          <Col md={6}>
            <Form.Group>
              <Form.Label>Total Floors *</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={data.totalFloors}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow empty string or positive numbers only
                  if (
                    value === "" ||
                    (!isNaN(value) && parseFloat(value) >= 0)
                  ) {
                    onChange("totalFloors", value);
                  }
                }}
                onBlur={(e) => {
                  const value = parseFloat(e.target.value);
                  // Clear if negative on blur
                  if (!isNaN(value) && value < 0) {
                    onChange("totalFloors", "");
                  }
                }}
                placeholder="Total floors in building"
                isInvalid={!!errors.totalFloors}
              />
              <Form.Control.Feedback type="invalid">
                {errors.totalFloors}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        )}

        {fieldVisibility.showFacing && (
          <Col md={6}>
            <Form.Group>
              <Form.Label>Facing</Form.Label>
              <Form.Select
                value={data.facing}
                onChange={(e) => onChange("facing", e.target.value)}
              >
                <option value="">Select Facing</option>
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="East">East</option>
                <option value="West">West</option>
                <option value="North-East">North-East</option>
                <option value="North-West">North-West</option>
                <option value="South-East">South-East</option>
                <option value="South-West">South-West</option>
              </Form.Select>
            </Form.Group>
          </Col>
        )}

        {fieldVisibility.showAgeOfConstruction && (
          <Col md={6}>
            <Form.Group>
              <Form.Label>Age of Construction</Form.Label>
              <Form.Control
                type="number"
                value={data.ageOfConstruction}
                onChange={(e) => onChange("ageOfConstruction", e.target.value)}
                placeholder="Years since construction"
                min={0}
              />
            </Form.Group>
          </Col>
        )}
      </Row>
    </div>
  );
}

function FeaturesAmenitiesStep({
  data,
  onChange,
  errors,
  amenities = [],
  features = [],
  nearbyBenefits = [],
  loadingAmenities = false,
  loadingFeatures = false,
  loadingNearbyBenefits = false,
  apiBaseUrl = "",
}) {
  const fieldVisibility = getFieldVisibility(
    data.listingType,
    data.subType,
    data.status,
  );
  const isResidential = data.listingType === "Residential";
  const isCommercial = data.listingType === "Commercial";

  // Search states
  const [amenitySearch, setAmenitySearch] = useState("");
  const [featureSearch, setFeatureSearch] = useState("");
  const [nearbyBenefitSearch, setNearbyBenefitSearch] = useState("");

  // Show more states for amenities, features, and nearby benefits
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [showAllNearbyBenefits, setShowAllNearbyBenefits] = useState(false);

  // Distance modal state
  const [showDistanceModal, setShowDistanceModal] = useState(false);
  const [selectedBenefit, setSelectedBenefit] = useState(null);
  const [distanceInput, setDistanceInput] = useState("");
  const [distanceError, setDistanceError] = useState("");

  // Filter amenities, features, and nearby benefits based on search
  const filteredAmenities = amenities.filter((amenity) => {
    if (!amenitySearch.trim()) return true;
    const title = (amenity.title || amenity.name || "").toLowerCase();
    return title.includes(amenitySearch.toLowerCase());
  });

  const filteredFeatures = features.filter((feature) => {
    if (!featureSearch.trim()) return true;
    const featureName = (
      feature.title ||
      feature.featureName ||
      feature.name ||
      ""
    ).toLowerCase();
    return featureName.includes(featureSearch.toLowerCase());
  });

  const filteredNearbyBenefits = nearbyBenefits.filter((benefit) => {
    if (!nearbyBenefitSearch.trim()) return true;
    const benefitName = (
      benefit.benefitName ||
      benefit.name ||
      ""
    ).toLowerCase();
    return benefitName.includes(nearbyBenefitSearch.toLowerCase());
  });

  // Limit displayed items (3 lines = ~12 items assuming 4 per row)
  const ITEMS_PER_LINE = 4;
  const INITIAL_LINES = 3;
  const INITIAL_ITEMS_TO_SHOW = ITEMS_PER_LINE * INITIAL_LINES;

  const displayedAmenities = showAllAmenities
    ? filteredAmenities
    : filteredAmenities.slice(0, INITIAL_ITEMS_TO_SHOW);

  const displayedFeatures = showAllFeatures
    ? filteredFeatures
    : filteredFeatures.slice(0, INITIAL_ITEMS_TO_SHOW);

  const displayedNearbyBenefits = showAllNearbyBenefits
    ? filteredNearbyBenefits
    : filteredNearbyBenefits.slice(0, INITIAL_ITEMS_TO_SHOW);

  // Get icon URL helper
  const getIconUrl = (filename, type) => {
    if (!filename) return null;
    if (type === "amenity") {
      return `${process.env.NEXT_PUBLIC_API_URL}fetch-image/amenity/${filename}`;
    } else if (type === "feature") {
      return `${process.env.NEXT_PUBLIC_API_URL}fetch-image/feature/${filename}`;
    } else if (type === "nearby-benefit") {
      return `${process.env.NEXT_PUBLIC_API_URL}fetch-image/nearby-benefit/${filename}`;
    }
    return null;
  };

  // Handle amenity toggle
  const handleAmenityToggle = (amenityId) => {
    const currentIds = data.amenityIds || [];
    const updatedIds = currentIds.includes(amenityId)
      ? currentIds.filter((id) => id !== amenityId)
      : [...currentIds, amenityId];
    onChange("amenityIds", updatedIds);
  };

  // Handle feature toggle
  const handleFeatureToggle = (featureId) => {
    const currentIds = data.featureIds || [];
    const updatedIds = currentIds.includes(featureId)
      ? currentIds.filter((id) => id !== featureId)
      : [...currentIds, featureId];
    onChange("featureIds", updatedIds);
  };

  // Handle nearby benefit click - open distance modal
  const handleNearbyBenefitClick = (benefit) => {
    const currentBenefits = data.nearbyBenefits || [];
    const existingIndex = currentBenefits.findIndex((b) => b.id === benefit.id);

    if (existingIndex >= 0) {
      // Remove if already selected
      const updated = currentBenefits.filter((b) => b.id !== benefit.id);
      onChange("nearbyBenefits", updated);
    } else {
      // Open modal to get distance
      setSelectedBenefit(benefit);
      setDistanceInput("");
      setDistanceError("");
      setShowDistanceModal(true);
    }
  };

  // Handle distance modal submit
  const handleDistanceSubmit = () => {
    const distance = parseFloat(distanceInput);

    if (!distanceInput.trim()) {
      setDistanceError("Distance is required");
      return;
    }

    if (isNaN(distance) || distance <= 0) {
      setDistanceError("Please enter a valid positive number");
      return;
    }

    const currentBenefits = data.nearbyBenefits || [];
    const updated = [
      ...currentBenefits,
      { id: selectedBenefit.id, distance: distance },
    ];
    onChange("nearbyBenefits", updated);
    setShowDistanceModal(false);
    setSelectedBenefit(null);
    setDistanceInput("");
    setDistanceError("");
  };

  // Check if item is selected
  const isAmenitySelected = (id) => (data.amenityIds || []).includes(id);
  const isFeatureSelected = (id) => (data.featureIds || []).includes(id);
  const isNearbyBenefitSelected = (id) => {
    const benefits = data.nearbyBenefits || [];
    return benefits.some((b) => b.id === id);
  };

  const getNearbyBenefitDistance = (id) => {
    const benefits = data.nearbyBenefits || [];
    const benefit = benefits.find((b) => b.id === id);
    return benefit ? benefit.distance : null;
  };

  return (
    <div className="step-content">
      <h4 className="step-title mb-4">
        {isResidential
          ? "Residential"
          : isCommercial
            ? "Commercial"
            : "Property"}{" "}
        Features & Amenities
      </h4>

      {!data.listingType && (
        <Alert variant="warning" className="mb-4">
          <CIcon icon={cilWarning} className="me-2" />
          Please select a listing type in Step 1 to see relevant fields.
        </Alert>
      )}

      <Row className="g-3">
        {/* Residential-specific fields */}
        {fieldVisibility.showBedrooms && (
          <Col md={6}>
            <Form.Group>
              <Form.Label>
                Number of Bedrooms (BHK{data.subType === "Studio" ? " / RK" : ""}) *
              </Form.Label>
              <Form.Select
                value={data.bedrooms}
                onChange={(e) => onChange("bedrooms", e.target.value)}
                isInvalid={!!errors.bedrooms}
              >
                <option value="">Select Bedrooms</option>
                {data.subType === "Studio" && (
                  <option value="1RK">1 RK</option>
                )}
                <option value="1">1 BHK</option>
                <option value="2">2 BHK</option>
                <option value="3">3 BHK</option>
                <option value="4">4 BHK</option>
                <option value="5">5+ BHK</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.bedrooms}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        )}

        {fieldVisibility.showBathrooms && (
          <Col md={6}>
            <Form.Group>
              <Form.Label>
                {isResidential
                  ? "Number of Bathrooms *"
                  : "Number of Washrooms"}
              </Form.Label>
              <Form.Select
                value={data.bathrooms}
                onChange={(e) => onChange("bathrooms", e.target.value)}
                isInvalid={!!errors.bathrooms}
              >
                <option value="">
                  Select {isResidential ? "Bathrooms" : "Washrooms"}
                </option>
                <option value="1">
                  1 {isResidential ? "Bathroom" : "Washroom"}
                </option>
                <option value="2">
                  2 {isResidential ? "Bathrooms" : "Washrooms"}
                </option>
                <option value="3">
                  3 {isResidential ? "Bathrooms" : "Washrooms"}
                </option>
                <option value="4">
                  4+ {isResidential ? "Bathrooms" : "Washrooms"}
                </option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.bathrooms}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        )}

        {fieldVisibility.showBalconies && (
          <Col md={6}>
            <Form.Group>
              <Form.Label>Number of Balconies</Form.Label>
              <Form.Select
                value={data.balconies}
                onChange={(e) => onChange("balconies", e.target.value)}
              >
                <option value="">Select Balconies</option>
                <option value="0">No Balcony</option>
                <option value="1">1 Balcony</option>
                <option value="2">2 Balconies</option>
                <option value="3">3+ Balconies</option>
              </Form.Select>
            </Form.Group>
          </Col>
        )}

        {/* Common fields for both */}
        {fieldVisibility.showParking && (
          <Col md={6}>
            <Form.Group>
              <Form.Label>Parking</Form.Label>
              <Form.Select
                value={data.parking}
                onChange={(e) => onChange("parking", e.target.value)}
              >
                <option value="">Select Parking</option>
                <option value="No Parking">No Parking</option>
                <option value="1 Covered">1 Covered</option>
                <option value="1 Open">1 Open</option>
                <option value="2 Covered">2 Covered</option>
                <option value="2 Open">2 Open</option>
                <option value="Multiple">Multiple</option>
              </Form.Select>
            </Form.Group>
          </Col>
        )}

        {/* Furnishing - conditional based on property type and status */}
        {fieldVisibility.showFurnishing && (
          <Col md={6}>
            <Form.Group>
              <Form.Label>Furnishing Status</Form.Label>
              <Form.Select
                value={data.furnished}
                onChange={(e) => onChange("furnished", e.target.value)}
              >
                <option value="">Select Furnishing</option>
                <option value="Fully Furnished">Fully Furnished</option>
                <option value="Semi Furnished">Semi Furnished</option>
                <option value="Unfurnished">Unfurnished</option>
              </Form.Select>
            </Form.Group>
          </Col>
        )}
      </Row>

      {/* Amenities Section */}
      <Row className="mt-4">
        <Col md={12}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">
              <CIcon icon={cilStar} className="me-2" />
              Amenities
              <Badge bg="secondary" className="ms-2">
                {data.amenityIds?.length || 0} selected
              </Badge>
            </h5>
          </div>
          <Form.Control
            type="text"
            placeholder={
              loadingAmenities ? "Loading amenities..." : "Search amenities..."
            }
            value={amenitySearch}
            onChange={(e) => setAmenitySearch(e.target.value)}
            className="mb-3"
            disabled={loadingAmenities}
          />
          {loadingAmenities ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredAmenities.length === 0 ? (
            <Alert variant="info">
              No amenities found.{" "}
              {amenitySearch && "Try a different search term."}
            </Alert>
          ) : (
            <>
              <div className="amenities-features-grid">
                {displayedAmenities.map((amenity) => {
                  const iconUrl = getIconUrl(
                    amenity.iconImage || amenity.iconImageUrl || amenity.icon,
                    "amenity",
                  );
                  const isSelected = isAmenitySelected(amenity.id);
                  const amenityName =
                    amenity.title || amenity.name || "Amenity";
                  return (
                    <div
                      key={amenity.id}
                      className={`amenity-feature-item ${isSelected ? "selected" : ""}`}
                      onClick={() => handleAmenityToggle(amenity.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Form.Check
                        type="checkbox"
                        id={`amenity-${amenity.id}`}
                        checked={isSelected}
                        onChange={() => handleAmenityToggle(amenity.id)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ margin: 0, flexShrink: 0 }}
                      />
                      {iconUrl && (
                        <div className="item-icon" style={{ flexShrink: 0 }}>
                          <NextImage
                            src={iconUrl}
                            alt={amenity.altTag || amenityName}
                            width={40}
                            height={40}
                            style={{ objectFit: "contain" }}
                          />
                        </div>
                      )}
                      <label
                        htmlFor={`amenity-${amenity.id}`}
                        style={{ margin: 0, cursor: "pointer", flex: 1 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {amenityName}
                      </label>
                    </div>
                  );
                })}
              </div>
              {filteredAmenities.length > INITIAL_ITEMS_TO_SHOW && (
                <div className="text-center mt-3">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setShowAllAmenities(!showAllAmenities)}
                  >
                    {showAllAmenities ? (
                      <>
                        <CIcon icon={cilChevronTop} className="me-1" />
                        Show Less
                      </>
                    ) : (
                      <>
                        Show More (
                        {filteredAmenities.length - INITIAL_ITEMS_TO_SHOW} more)
                        <CIcon icon={cilChevronBottom} className="ms-1" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </Col>
      </Row>

      {/* Features Section */}
      <Row className="mt-4">
        <Col md={12}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">
              <CIcon icon={cilHome} className="me-2" />
              {isResidential
                ? "Residential"
                : isCommercial
                  ? "Commercial"
                  : "Property"}{" "}
              Features
              <Badge bg="secondary" className="ms-2">
                {data.featureIds?.length || 0} selected
              </Badge>
            </h5>
          </div>
          <Form.Control
            type="text"
            placeholder={
              loadingFeatures ? "Loading features..." : "Search features..."
            }
            value={featureSearch}
            onChange={(e) => setFeatureSearch(e.target.value)}
            className="mb-3"
            disabled={loadingFeatures}
          />
          {loadingFeatures ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredFeatures.length === 0 ? (
            <Alert variant="info">
              No features found.{" "}
              {featureSearch && "Try a different search term."}
            </Alert>
          ) : (
            <>
              <div className="amenities-features-grid">
                {displayedFeatures.map((feature) => {
                  const iconUrl = getIconUrl(feature.iconImageUrl, "feature");
                  const isSelected = isFeatureSelected(feature.id);
                  const featureName =
                    feature.title ||
                    feature.featureName ||
                    feature.name ||
                    "Feature";
                  return (
                    <div
                      key={feature.id}
                      className={`amenity-feature-item ${isSelected ? "selected" : ""}`}
                      onClick={() => handleFeatureToggle(feature.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Form.Check
                        type="checkbox"
                        id={`feature-${feature.id}`}
                        checked={isSelected}
                        onChange={() => handleFeatureToggle(feature.id)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ margin: 0, flexShrink: 0 }}
                      />
                      {iconUrl && (
                        <div className="item-icon" style={{ flexShrink: 0 }}>
                          <NextImage
                            src={iconUrl}
                            alt={feature.altTag || featureName}
                            width={40}
                            height={40}
                            style={{ objectFit: "contain" }}
                          />
                        </div>
                      )}
                      <label
                        htmlFor={`feature-${feature.id}`}
                        style={{ margin: 0, cursor: "pointer", flex: 1 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {featureName}
                      </label>
                    </div>
                  );
                })}
              </div>
              {filteredFeatures.length > INITIAL_ITEMS_TO_SHOW && (
                <div className="text-center mt-3">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setShowAllFeatures(!showAllFeatures)}
                  >
                    {showAllFeatures ? (
                      <>
                        <CIcon icon={cilChevronTop} className="me-1" />
                        Show Less
                      </>
                    ) : (
                      <>
                        Show More (
                        {filteredFeatures.length - INITIAL_ITEMS_TO_SHOW} more)
                        <CIcon icon={cilChevronBottom} className="ms-1" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </Col>
      </Row>

      {/* Nearby Benefits Section */}
      <Row className="mt-4">
        <Col md={12}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">
              <CIcon icon={cilMap} className="me-2" />
              Nearby Benefits
              <Badge bg="secondary" className="ms-2">
                {data.nearbyBenefits?.length || 0} selected
              </Badge>
            </h5>
          </div>
          <Form.Control
            type="text"
            placeholder={
              loadingNearbyBenefits
                ? "Loading nearby benefits..."
                : "Search nearby benefits..."
            }
            value={nearbyBenefitSearch}
            onChange={(e) => setNearbyBenefitSearch(e.target.value)}
            className="mb-3"
            disabled={loadingNearbyBenefits}
          />
          {loadingNearbyBenefits ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredNearbyBenefits.length === 0 ? (
            <Alert variant="info">
              No nearby benefits found.{" "}
              {nearbyBenefitSearch && "Try a different search term."}
            </Alert>
          ) : (
            <>
              <div className="amenities-features-grid">
                {displayedNearbyBenefits.map((benefit) => {
                  const iconUrl = getIconUrl(
                    benefit.benefitIcon || benefit.iconImageUrl,
                    "nearby-benefit",
                  );
                  const isSelected = isNearbyBenefitSelected(benefit.id);
                  const distance = getNearbyBenefitDistance(benefit.id);
                  return (
                    <div
                      key={benefit.id}
                      className={`amenity-feature-item ${isSelected ? "selected" : ""}`}
                      onClick={() => handleNearbyBenefitClick(benefit)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Form.Check
                        type="checkbox"
                        id={`nearby-${benefit.id}`}
                        checked={isSelected}
                        onChange={() => handleNearbyBenefitClick(benefit)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ margin: 0, flexShrink: 0 }}
                      />
                      {iconUrl && (
                        <div className="item-icon" style={{ flexShrink: 0 }}>
                          <NextImage
                            src={iconUrl}
                            alt={
                              benefit.altTag ||
                              benefit.benefitName ||
                              "Nearby Benefit"
                            }
                            width={40}
                            height={40}
                            style={{ objectFit: "contain" }}
                          />
                        </div>
                      )}
                      <div className="flex-grow-1" style={{ flex: 1 }}>
                        <label
                          htmlFor={`nearby-${benefit.id}`}
                          style={{ margin: 0, cursor: "pointer" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {benefit.benefitName || benefit.name}
                        </label>
                        {isSelected && distance && (
                          <small className="text-muted d-block mt-1">
                            <CIcon icon={cilLocationPin} className="me-1" />
                            {distance} KM
                          </small>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {filteredNearbyBenefits.length > INITIAL_ITEMS_TO_SHOW && (
                <div className="text-center mt-3">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() =>
                      setShowAllNearbyBenefits(!showAllNearbyBenefits)
                    }
                  >
                    {showAllNearbyBenefits ? (
                      <>
                        <CIcon icon={cilChevronTop} className="me-1" />
                        Show Less
                      </>
                    ) : (
                      <>
                        Show More (
                        {filteredNearbyBenefits.length - INITIAL_ITEMS_TO_SHOW}{" "}
                        more)
                        <CIcon icon={cilChevronBottom} className="ms-1" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </Col>
      </Row>

      {/* Distance Modal */}
      <Modal
        show={showDistanceModal}
        onHide={() => setShowDistanceModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Enter Distance</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>
              Distance to{" "}
              {selectedBenefit?.benefitName || selectedBenefit?.name} (in KMs) *
            </Form.Label>
            <Form.Control
              type="number"
              step="0.1"
              min="0.1"
              value={distanceInput}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || parseFloat(value) > 0) {
                  setDistanceInput(value);
                  setDistanceError("");
                }
              }}
              placeholder="Enter distance (e.g., 2.5)"
              isInvalid={!!distanceError}
            />
            {distanceError && (
              <Form.Control.Feedback type="invalid">
                {distanceError}
              </Form.Control.Feedback>
            )}
            <Form.Text className="text-muted">
              Please enter the distance in kilometers (positive numbers only)
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDistanceModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleDistanceSubmit}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .amenities-features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .amenity-feature-item {
          padding: 1rem;
          border: 2px solid var(--portal-gray-200, #e9ecef);
          border-radius: 8px;
          background: var(--portal-white, #ffffff);
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .amenity-feature-item:hover {
          border-color: var(--portal-primary, #68ac78);
          box-shadow: 0 2px 8px rgba(104, 172, 120, 0.15);
          transform: translateY(-2px);
        }

        .amenity-feature-item.selected {
          border-color: var(--portal-primary, #68ac78);
          background: rgba(104, 172, 120, 0.08);
        }

        .item-icon {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .amenity-feature-item .form-check {
          margin: 0;
          flex-grow: 1;
        }

        .amenity-feature-item .form-check-label {
          cursor: pointer;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .amenities-features-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}

function MediaContactStep({
  data,
  onChange,
  onImageChange,
  onImageRemove,
  errors,
}) {
  const fileInputRef = useRef(null);

  const handleSelectImages = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="step-content">
      <h4 className="step-title mb-4">Media & Contact Information</h4>

      <Row className="g-3">
        <Col md={12}>
          <Form.Group>
            <Form.Label className="d-flex align-items-center gap-2 mb-3">
              <CIcon icon={cilCamera} className="me-2" />
              Property Images
              <span className="required-indicator">*</span>
              {data.imagePreviews && data.imagePreviews.length > 0 && (
                <Badge bg="secondary" className="ms-2">
                  {data.imagePreviews.length}{" "}
                  {data.imagePreviews.length === 1 ? "image" : "images"}{" "}
                  selected
                </Badge>
              )}
            </Form.Label>

            {/* Hidden file input */}
            <Form.Control
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={onImageChange}
              isInvalid={!!errors.images}
              className="d-none"
            />

            {/* Select Images Button */}
            <Button
              variant="outline-primary"
              onClick={handleSelectImages}
              className="mb-3"
              style={{ width: "100%" }}
            >
              <CIcon icon={cilCamera} className="me-2" />
              Select Multiple Images
            </Button>

            {errors.images && (
              <div className="text-danger small mb-2">
                <CIcon icon={cilWarning} className="me-1" />
                {errors.images}
              </div>
            )}

            <Form.Text className="text-muted d-block mb-3">
              Upload at least one image of your property (JPG, PNG, max 5MB
              each). Images must be rectangular (not square).
            </Form.Text>

            {/* Image Previews Grid */}
            {data.imagePreviews && data.imagePreviews.length > 0 && (
              <div
                className="property-images-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: "1rem",
                  marginTop: "1rem",
                }}
              >
                {data.imagePreviews.map((imageData, index) => (
                  <div
                    key={imageData.id}
                    style={{
                      position: "relative",
                      border: "2px solid #e9ecef",
                      borderRadius: "8px",
                      overflow: "hidden",
                      background: "#ffffff",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#68ac78";
                      e.currentTarget.style.boxShadow =
                        "0 2px 8px rgba(104, 172, 120, 0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#e9ecef";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        width: "200px",
                        height: "100px",
                        margin: "0 auto",
                        overflow: "hidden",
                      }}
                    >
                      <NextImage
                        src={imageData.preview}
                        alt={`Property image ${index + 1}`}
                        fill
                        style={{
                          objectFit: "cover",
                        }}
                      />
                      {/* Remove Icon */}
                      <button
                        type="button"
                        onClick={() => onImageRemove(imageData.id)}
                        title="Remove this image"
                        style={{
                          position: "absolute",
                          top: "4px",
                          right: "4px",
                          background: "rgba(220, 53, 69, 0.9)",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "28px",
                          height: "28px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          zIndex: 10,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "rgba(220, 53, 69, 1)";
                          e.currentTarget.style.transform = "scale(1.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            "rgba(220, 53, 69, 0.9)";
                          e.currentTarget.style.transform = "scale(1)";
                        }}
                      >
                        <CIcon icon={cilX} style={{ fontSize: "14px" }} />
                      </button>
                      {/* Image Number Badge */}
                      <div
                        style={{
                          position: "absolute",
                          top: "4px",
                          left: "4px",
                          background: "rgba(0, 0, 0, 0.6)",
                          color: "white",
                          borderRadius: "4px",
                          padding: "2px 6px",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        {index + 1}
                      </div>
                    </div>
                    {/* Image Details */}
                    <div
                      style={{
                        padding: "8px",
                        borderTop: "1px solid #e9ecef",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: "500",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          marginBottom: "4px",
                        }}
                        title={
                          imageData.file
                            ? imageData.file.name
                            : imageData.url || "Existing image"
                        }
                      >
                        {imageData.file
                          ? imageData.file.name
                          : imageData.isExisting
                            ? "Existing Image"
                            : "Image"}
                      </div>
                      {imageData.file && (
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#6c757d",
                          }}
                        >
                          {(imageData.file.size / 1024 / 1024).toFixed(1)} MB
                        </div>
                      )}
                      {imageData.isExisting && (
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#28a745",
                          }}
                        >
                          ✓ Saved
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Form.Group>
        </Col>

        <Col md={12}>
          <Form.Group>
            <Form.Label>Virtual Tour URL</Form.Label>
            <Form.Control
              type="url"
              value={data.virtualTour}
              onChange={(e) => onChange("virtualTour", e.target.value)}
              placeholder="https://example.com/virtual-tour"
              isInvalid={!!errors.virtualTour}
            />
            {errors.virtualTour && (
              <Form.Control.Feedback type="invalid">
                {errors.virtualTour}
              </Form.Control.Feedback>
            )}
            <Form.Text className="text-muted">
              Optional: Enter a valid URL for virtual tour (e.g., YouTube,
              Matterport)
            </Form.Text>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group>
            <Form.Label>Contact Name *</Form.Label>
            <Form.Control
              type="text"
              value={data.contactName}
              onChange={(e) => onChange("contactName", e.target.value)}
              placeholder="Your full name"
              isInvalid={!!errors.contactName}
            />
            <Form.Control.Feedback type="invalid">
              {errors.contactName}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group>
            <Form.Label>Contact Phone *</Form.Label>
            <Form.Control
              type="tel"
              value={data.contactPhone}
              onChange={(e) => onChange("contactPhone", e.target.value)}
              placeholder="10-digit mobile number"
              maxLength={10}
              isInvalid={!!errors.contactPhone}
            />
            <Form.Control.Feedback type="invalid">
              {errors.contactPhone}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group>
            <Form.Label>Contact Email *</Form.Label>
            <Form.Control
              type="email"
              value={data.contactEmail}
              onChange={(e) => onChange("contactEmail", e.target.value)}
              placeholder="your.email@example.com"
              isInvalid={!!errors.contactEmail}
            />
            <Form.Control.Feedback type="invalid">
              {errors.contactEmail}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group>
            <Form.Label>Preferred Contact Method</Form.Label>
            <Form.Select
              value={data.contactPreference}
              onChange={(e) => onChange("contactPreference", e.target.value)}
            >
              <option value="Phone">Phone</option>
              <option value="Email">Email</option>
              <option value="Any">Any</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group>
            <Form.Label>Preferred Contact Time</Form.Label>
            <Form.Select
              value={data.preferredTime}
              onChange={(e) => onChange("preferredTime", e.target.value)}
            >
              <option value="">Select Time</option>
              <option value="Morning (9 AM - 12 PM)">
                Morning (9 AM - 12 PM)
              </option>
              <option value="Afternoon (12 PM - 5 PM)">
                Afternoon (12 PM - 5 PM)
              </option>
              <option value="Evening (5 PM - 8 PM)">
                Evening (5 PM - 8 PM)
              </option>
              <option value="Any Time">Any Time</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group>
            <Form.Label>Ownership Type</Form.Label>
            <Form.Control
              type="text"
              value={data.ownershipType}
              onChange={(e) => onChange("ownershipType", e.target.value)}
              placeholder="e.g., Freehold, Leasehold"
            />
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group>
            <Form.Label>RERA ID</Form.Label>
            <Form.Control
              type="text"
              value={data.reraId}
              onChange={(e) => onChange("reraId", e.target.value)}
              placeholder="Enter RERA registration number"
            />
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group>
            <Form.Label>RERA State</Form.Label>
            <Form.Control
              type="text"
              value={data.reraState}
              onChange={(e) => onChange("reraState", e.target.value)}
              placeholder="State where RERA is registered"
            />
          </Form.Group>
        </Col>

        <Col md={12}>
          <Form.Group>
            <Form.Label>Additional Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={data.additionalNotes}
              onChange={(e) => onChange("additionalNotes", e.target.value)}
              placeholder="Any additional information for potential buyers/tenants"
            />
          </Form.Group>
        </Col>

        <Col md={12}>
          <div className="d-flex flex-column gap-2 mt-2">
            <Form.Check
              type="checkbox"
              id="truthfulDeclaration"
              label="I confirm that the information provided is true and accurate"
              checked={data.truthfulDeclaration === true}
              onChange={(e) =>
                onChange("truthfulDeclaration", e.target.checked)
              }
              isInvalid={!!errors.truthfulDeclaration}
            />
            {errors.truthfulDeclaration && (
              <div className="error-message">
                <CIcon icon={cilWarning} className="error-icon" />
                {errors.truthfulDeclaration}
              </div>
            )}
            <Form.Check
              type="checkbox"
              id="dpdpConsent"
              label="I consent to MyPropertyFact storing and processing my data"
              checked={data.dpdpConsent === true}
              onChange={(e) => onChange("dpdpConsent", e.target.checked)}
              isInvalid={!!errors.dpdpConsent}
            />
            {errors.dpdpConsent && (
              <div className="error-message">
                <CIcon icon={cilWarning} className="error-icon" />
                {errors.dpdpConsent}
              </div>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
}
