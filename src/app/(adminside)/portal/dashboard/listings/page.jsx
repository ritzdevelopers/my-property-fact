"use client";
import { Suspense, useState, useEffect, useCallback, useMemo } from "react";
import ModernPropertyListing from "../../_components/ModernPropertyListing";
import { Card, Row, Col, Button, Badge, Spinner, Alert, Form, Collapse } from "react-bootstrap";
import Cookies from "js-cookie";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  cilFilter, 
  cilX, 
  cilHome, 
  cilLocationPin,
  cilMoney,
  cilCheckCircle,
  cilFilterSquare,
  cilBuilding,
  cilStar,
  cilCalendar,
  cilCarAlt,
  cilCompass,
  cilLayers,
  cilPlus,
  cilViewModule
} from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ListingPage() {
  const router = useRouter();
  const searchParamsHook = useSearchParams();
  const action = searchParamsHook?.get('action') || null;
  const [allListings, setAllListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    listingType: "",
    subType: "",
    transaction: "",
    approvalStatus: "",
    priceMin: "",
    priceMax: "",
    pricePerSqftMin: "",
    pricePerSqftMax: "",
    areaMin: "",
    areaMax: "",
    city: "",
    locality: "",
    builderName: "",
    bedrooms: "",
    bathrooms: "",
    balconies: "",
    furnished: "",
    parking: "",
    possession: "",
    occupancy: "",
    floorNumber: "",
    totalFloors: "",
    facing: "",
    ageOfConstruction: "",
    ownershipType: "",
    reraId: "",
    maintenanceChargesMin: "",
    maintenanceChargesMax: "",
    bookingAmountMin: "",
    bookingAmountMax: "",
    searchText: ""
  });

  const fetchUserProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}user/property-listings`, {
        withCredentials: true,
      });

      if (response.status !== 200) {
        throw new Error(`Failed to fetch properties: ${response.status}`);
      }

      if (response.data.success && Array.isArray(response.data.properties)) {
        const transformedListings = response.data.properties.map(property => {
          const locationParts = [];
          if (property.address) locationParts.push(property.address);
          if (property.locality) locationParts.push(property.locality);
          if (property.city) locationParts.push(property.city);
          if (property.pincode) locationParts.push(property.pincode);

          // Use approvalStatus directly from API, default to PENDING if not present
          const approvalStatus = property.approvalStatus || "PENDING";
          const approvalStatusUpper = typeof approvalStatus === 'string' 
            ? approvalStatus.toUpperCase() 
            : approvalStatus;

          return {
            id: property.id,
            title:
              property.title ||
              property.projectName ||
              `${property.listingType || ""} ${property.subType || "Property"}`.trim(),
            location: locationParts.filter(Boolean).join(", ") || "Location not specified",
            price: formatPrice(property.totalPrice),
            area: formatArea(property.carpetArea || property.builtUpArea || property.superBuiltUpArea || property.plotArea),
            status: getStatusDisplay(approvalStatusUpper),
            statusBadge: getStatusBadge(approvalStatusUpper),
            views: 0,
            inquiries: 0,
            created: property.createdAt,
            approvalStatus: approvalStatusUpper,
            isApproved: approvalStatusUpper === "APPROVED",
            raw: property
          };
        });
        
        setAllListings(transformedListings);
      } else {
        setError(result.message || "Failed to fetch properties");
      }
        } catch (err) {
      console.error("Error fetching properties:", err);
      setError(err.message || "Failed to load properties. Please try again.");  
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (action !== 'add') {
      fetchUserProperties();
    }
  }, [action, fetchUserProperties]);

  // Early return must happen AFTER all hooks are called
  // But we need to ensure hooks are always called in the same order
  const formatPrice = (price) => {
    if (!price && price !== 0) return "Price not set";
    
    let numPrice;
    
    // Handle string prices (including scientific notation like "1.5E7")
    if (typeof price === 'string') {
      // Check if it's scientific notation
      if (price.includes('E') || price.includes('e')) {
        numPrice = parseFloat(price);
      } else {
        // Regular string price - remove non-numeric characters except decimal point, E, e, +, and -
        // Place - at the end to avoid range interpretation
        numPrice = parseFloat(price.replace(/[^0-9.Ee+\-]/g, ''));
      }
      
      if (isNaN(numPrice)) {
        // Try extracting number from string like "₹1.5E7" or "1.5E7 Cr"
        const match = price.match(/[\d.]+[Ee][\d+-]+/);
        if (match) {
          numPrice = parseFloat(match[0]);
        } else {
          return price; // Return original if can't parse
        }
      }
    } else {
      // Handle number prices
      numPrice = typeof price === 'number' ? price : parseFloat(price);
    }
    
    if (isNaN(numPrice)) return "Price not set";
    
    // Format based on amount
    if (numPrice >= 10000000) {
      return `₹${(numPrice / 10000000).toFixed(2)} Cr`;
    } else if (numPrice >= 100000) {
      return `₹${(numPrice / 100000).toFixed(2)} L`;
    }
    return `₹${Math.round(numPrice).toLocaleString('en-IN')}`;
  };

  const formatArea = (area) => {
    if (area === null || area === undefined || area === "") return "Area not specified";
    const numericArea = typeof area === 'string' ? parseFloat(area) : area;
    if (Number.isNaN(numericArea)) return "Area not specified";
    return `${numericArea.toLocaleString('en-IN')} sq ft`;
  };

  const getStatusDisplay = (approvalStatus) => {
    if (!approvalStatus) return "Unknown";
    switch (approvalStatus.toUpperCase()) {
      case 'DRAFT':
        return 'Draft';
      case 'PENDING':
        return 'Pending Approval';
      case 'APPROVED':
        return 'Active';
      case 'REJECTED':
        return 'Rejected';
      default:
        return approvalStatus;
    }
  };

  const getStatusBadge = (approvalStatus) => {
    if (!approvalStatus) return 'secondary';
    switch (approvalStatus.toUpperCase()) {
      case 'DRAFT':
        return 'warning';
      case 'PENDING':
        return 'info';
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const handleDelete = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(listingId);
      const token = Cookies.get("token");
      
      if (!token) {
        alert("Please login to delete properties");
        return;
      }

      const response = await axios.delete(`${API_BASE_URL}user/property-listings/${listingId}`, {
        withCredentials: true,
      });

      const result = await response.data;

      if (response.status === 200) {
        alert('Property deleted successfully');
        // Refresh the listings
        fetchUserProperties();
      } else {
        alert(result.message || 'Failed to delete property');
      }
    } catch (error) {
      console.error("Error deleting property:", error);
      alert('Error deleting property. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleView = (listingId) => {
    router.push(`/portal/dashboard/listings/${listingId}`);
  };

  const handleEdit = (listingId) => {
    router.push(`/portal/dashboard/listings/${listingId}?action=edit`);
  };

  // Filter listings based on filter criteria
  // NOTE: All hooks must be called before any early returns
  const filteredListings = useMemo(() => {
    if (action === 'add') {
      return []; // Return empty array when action is 'add'
    }
    if (!allListings || allListings.length === 0) {
      return [];
    }
    return allListings.filter(listing => {
      const property = listing.raw;
      
      // Search text filter
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        const searchableText = [
          listing.title,
          listing.location,
          property.listingType,
          property.subType,
          property.transaction || property.transactionType,
          property.projectName,
          property.builderName
        ].filter(Boolean).join(' ').toLowerCase();
        
        if (!searchableText.includes(searchLower)) {
          return false;
        }
      }
      
      // Listing type filter
      if (filters.listingType && property.listingType !== filters.listingType) {
        return false;
      }
      
      // Transaction type filter
      if (filters.transaction && property.transaction !== filters.transaction && property.transactionType !== filters.transaction) {
        return false;
      }
      
      // Approval status filter
      if (filters.approvalStatus && listing.approvalStatus !== filters.approvalStatus) {
        return false;
      }
      
      // Price range filter
      const price = property.totalPrice ? parseFloat(property.totalPrice) : null;
      if (filters.priceMin && price !== null && price < parseFloat(filters.priceMin)) {
        return false;
      }
      if (filters.priceMax && price !== null && price > parseFloat(filters.priceMax)) {
        return false;
      }
      
      // Area range filter
      const area = property.carpetArea || property.builtUpArea || property.superBuiltUpArea || property.plotArea;
      const numericArea = area ? parseFloat(area) : null;
      if (filters.areaMin && numericArea !== null && numericArea < parseFloat(filters.areaMin)) {
        return false;
      }
      if (filters.areaMax && numericArea !== null && numericArea > parseFloat(filters.areaMax)) {
        return false;
      }
      
      // City filter
      if (filters.city && property.city && !property.city.toLowerCase().includes(filters.city.toLowerCase())) {
        return false;
      }
      
      // Locality filter
      if (filters.locality && property.locality && !property.locality.toLowerCase().includes(filters.locality.toLowerCase())) {
        return false;
      }
      
      // Bedrooms filter
      if (filters.bedrooms && property.bedrooms !== parseInt(filters.bedrooms)) {
        return false;
      }
      
      // Bathrooms filter
      if (filters.bathrooms && property.bathrooms !== parseInt(filters.bathrooms)) {
        return false;
      }
      
      // Sub Type filter
      if (filters.subType && property.subType !== filters.subType) {
        return false;
      }
      
      // Possession filter
      if (filters.possession && property.possession && !property.possession.toLowerCase().includes(filters.possession.toLowerCase())) {
        return false;
      }
      
      // Occupancy filter
      if (filters.occupancy && property.occupancy && !property.occupancy.toLowerCase().includes(filters.occupancy.toLowerCase())) {
        return false;
      }
      
      // Furnished filter
      if (filters.furnished && property.furnished !== filters.furnished) {
        return false;
      }
      
      // Parking filter
      if (filters.parking && property.parking && !property.parking.toLowerCase().includes(filters.parking.toLowerCase())) {
        return false;
      }
      
      // Balconies filter
      if (filters.balconies && property.balconies !== parseInt(filters.balconies)) {
        return false;
      }
      
      // Floor number filter
      if (filters.floorNumber && property.floorNumber !== parseInt(filters.floorNumber)) {
        return false;
      }
      
      // Total floors filter
      if (filters.totalFloors && property.totalFloors !== parseInt(filters.totalFloors)) {
        return false;
      }
      
      // Facing filter
      if (filters.facing && property.facing && !property.facing.toLowerCase().includes(filters.facing.toLowerCase())) {
        return false;
      }
      
      // Age of construction filter
      if (filters.ageOfConstruction && property.ageOfConstruction !== parseInt(filters.ageOfConstruction)) {
        return false;
      }
      
      // Ownership type filter
      if (filters.ownershipType && property.ownershipType && !property.ownershipType.toLowerCase().includes(filters.ownershipType.toLowerCase())) {
        return false;
      }
      
      // Builder name filter
      if (filters.builderName && property.builderName && !property.builderName.toLowerCase().includes(filters.builderName.toLowerCase())) {
        return false;
      }
      
      // RERA ID filter
      if (filters.reraId && property.reraId && !property.reraId.toLowerCase().includes(filters.reraId.toLowerCase())) {
        return false;
      }
      
      // Price per sqft range filter
      const pricePerSqft = property.pricePerSqft ? parseFloat(property.pricePerSqft) : null;
      if (filters.pricePerSqftMin && pricePerSqft !== null && pricePerSqft < parseFloat(filters.pricePerSqftMin)) {
        return false;
      }
      if (filters.pricePerSqftMax && pricePerSqft !== null && pricePerSqft > parseFloat(filters.pricePerSqftMax)) {
        return false;
      }
      
      // Maintenance charges range filter
      const maintenanceCharges = property.maintenanceCharges ? parseFloat(property.maintenanceCharges) : null;
      if (filters.maintenanceChargesMin && maintenanceCharges !== null && maintenanceCharges < parseFloat(filters.maintenanceChargesMin)) {
        return false;
      }
      if (filters.maintenanceChargesMax && maintenanceCharges !== null && maintenanceCharges > parseFloat(filters.maintenanceChargesMax)) {
        return false;
      }
      
      // Booking amount range filter
      const bookingAmount = property.bookingAmount ? parseFloat(property.bookingAmount) : null;
      if (filters.bookingAmountMin && bookingAmount !== null && bookingAmount < parseFloat(filters.bookingAmountMin)) {
        return false;
      }
      if (filters.bookingAmountMax && bookingAmount !== null && bookingAmount > parseFloat(filters.bookingAmountMax)) {
        return false;
      }
      
      return true;
    });
  }, [allListings, filters, action]);
  
  // Get unique values for filter options
  const uniqueValues = useMemo(() => {
    if (action === 'add') {
      return {
        listingTypes: [],
        subTypes: [],
        transactions: [],
        cities: [],
        localities: [],
        builderNames: [],
        bedrooms: [],
        bathrooms: [],
        balconies: [],
        furnished: [],
        parking: [],
        possessions: [],
        occupancies: [],
        facing: [],
        ownershipTypes: [],
        floorNumbers: [],
        totalFloors: [],
        ageOfConstruction: []
      };
    }
    if (!allListings || allListings.length === 0) {
      return {
        listingTypes: [],
        subTypes: [],
        transactions: [],
        cities: [],
        localities: [],
        builderNames: [],
        bedrooms: [],
        bathrooms: [],
        balconies: [],
        furnished: [],
        parking: [],
        possessions: [],
        occupancies: [],
        facing: [],
        ownershipTypes: [],
        floorNumbers: [],
        totalFloors: [],
        ageOfConstruction: []
      };
    }
    const values = {
      listingTypes: [],
      subTypes: [],
      transactions: [],
      cities: [],
      localities: [],
      builderNames: [],
      bedrooms: [],
      bathrooms: [],
      balconies: [],
      furnished: [],
      parking: [],
      possessions: [],
      occupancies: [],
      facing: [],
      ownershipTypes: [],
      floorNumbers: [],
      totalFloors: [],
      ageOfConstruction: []
    };
    
    allListings.forEach(listing => {
      const prop = listing.raw;
      
      if (prop.listingType && !values.listingTypes.includes(prop.listingType)) {
        values.listingTypes.push(prop.listingType);
      }
      
      if (prop.subType && !values.subTypes.includes(prop.subType)) {
        values.subTypes.push(prop.subType);
      }
      
      const transaction = prop.transaction || prop.transactionType;
      if (transaction && !values.transactions.includes(transaction)) {
        values.transactions.push(transaction);
      }
      
      if (prop.city && !values.cities.includes(prop.city)) {
        values.cities.push(prop.city);
      }
      
      if (prop.locality && !values.localities.includes(prop.locality)) {
        values.localities.push(prop.locality);
      }
      
      if (prop.builderName && !values.builderNames.includes(prop.builderName)) {
        values.builderNames.push(prop.builderName);
      }
      
      if (prop.bedrooms && !values.bedrooms.includes(prop.bedrooms)) {
        values.bedrooms.push(prop.bedrooms);
      }
      
      if (prop.bathrooms && !values.bathrooms.includes(prop.bathrooms)) {
        values.bathrooms.push(prop.bathrooms);
      }
      
      if (prop.balconies && !values.balconies.includes(prop.balconies)) {
        values.balconies.push(prop.balconies);
      }
      
      if (prop.furnished && !values.furnished.includes(prop.furnished)) {
        values.furnished.push(prop.furnished);
      }
      
      if (prop.parking && !values.parking.includes(prop.parking)) {
        values.parking.push(prop.parking);
      }
      
      if (prop.possession && !values.possessions.includes(prop.possession)) {
        values.possessions.push(prop.possession);
      }
      
      if (prop.occupancy && !values.occupancies.includes(prop.occupancy)) {
        values.occupancies.push(prop.occupancy);
      }
      
      if (prop.facing && !values.facing.includes(prop.facing)) {
        values.facing.push(prop.facing);
      }
      
      if (prop.ownershipType && !values.ownershipTypes.includes(prop.ownershipType)) {
        values.ownershipTypes.push(prop.ownershipType);
      }
      
      if (prop.floorNumber && !values.floorNumbers.includes(prop.floorNumber)) {
        values.floorNumbers.push(prop.floorNumber);
      }
      
      if (prop.totalFloors && !values.totalFloors.includes(prop.totalFloors)) {
        values.totalFloors.push(prop.totalFloors);
      }
      
      if (prop.ageOfConstruction && !values.ageOfConstruction.includes(prop.ageOfConstruction)) {
        values.ageOfConstruction.push(prop.ageOfConstruction);
      }
    });
    
    // Sort numeric arrays
    values.bedrooms.sort((a, b) => a - b);
    values.bathrooms.sort((a, b) => a - b);
    values.balconies.sort((a, b) => a - b);
    values.floorNumbers.sort((a, b) => a - b);
    values.totalFloors.sort((a, b) => a - b);
    values.ageOfConstruction.sort((a, b) => a - b);
    
    return values;
  }, [allListings, action]);
  
  // Count active filters
  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(v => v && v !== "").length;
  }, [filters]);
  
  // Reset all filters
  const resetFilters = () => {
    setFilters({
      listingType: "",
      subType: "",
      transaction: "",
      approvalStatus: "",
      priceMin: "",
      priceMax: "",
      pricePerSqftMin: "",
      pricePerSqftMax: "",
      areaMin: "",
      areaMax: "",
      city: "",
      locality: "",
      builderName: "",
      bedrooms: "",
      bathrooms: "",
      balconies: "",
      furnished: "",
      parking: "",
      possession: "",
      occupancy: "",
      floorNumber: "",
      totalFloors: "",
      facing: "",
      ageOfConstruction: "",
      ownershipType: "",
      reraId: "",
      maintenanceChargesMin: "",
      maintenanceChargesMax: "",
      bookingAmountMin: "",
      bookingAmountMax: "",
      searchText: ""
    });
  };
  
  // Check if any filter is active
  const hasActiveFilters = activeFilterCount > 0;
  
  const activeListings = allListings.filter(l => l.approvalStatus === 'APPROVED').length;
  const pendingListings = allListings.filter(l => l.approvalStatus === 'PENDING').length;
  const draftListings = allListings.filter(l => l.approvalStatus === 'DRAFT').length;
  const rejectedListings = allListings.filter(l => l.approvalStatus === 'REJECTED').length;

  // Early return AFTER all hooks have been called
  if (action === 'add') {
    return <ModernPropertyListing />;
  }

  return (
    <div className="portal-content">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-title">
            <h2>My Property Listings</h2>
            <p>Manage your property listings and track their performance</p>
          </div>
          <div className="header-actions">
            <Button 
              variant="light"
              onClick={() => window.location.href = '/portal/dashboard/listings?action=add'}
            >
              <CIcon icon={cilPlus} className="me-1" />
              Add New Property
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col lg={3} md={6}>
          <Card className="stat-card h-100">
            <Card.Body>
              <div className="stat-content">
                <div className="stat-icon primary">
                  <CIcon icon={cilHome} />
                </div>
                <div className="stat-info">
                  <h6 className="stat-title">Total Listings</h6>
                  {loading ? (
                    <Spinner size="sm" />
                  ) : (
                    <h3 className="stat-value">{allListings.length}</h3>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6}>
          <Card className="stat-card h-100">
            <Card.Body>
              <div className="stat-content">
                <div className="stat-icon success">
                  <CIcon icon={cilCheckCircle} />
                </div>
                <div className="stat-info">
                  <h6 className="stat-title">Active Listings</h6>
                  {loading ? (
                    <Spinner size="sm" />
                  ) : (
                    <h3 className="stat-value">{activeListings}</h3>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6}>
          <Card className="stat-card h-100">
            <Card.Body>
              <div className="stat-content">
                <div className="stat-icon info">
                  <CIcon icon={cilCalendar} />
                </div>
                <div className="stat-info">
                  <h6 className="stat-title">Pending Approval</h6>
                  {loading ? (
                    <Spinner size="sm" />
                  ) : (
                    <h3 className="stat-value">{pendingListings}</h3>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6}>
          <Card className="stat-card h-100">
            <Card.Body>
              <div className="stat-content">
                <div className="stat-icon warning">
                  <CIcon icon={cilLayers} />
                </div>
                <div className="stat-info">
                  <h6 className="stat-title">Draft</h6>
                  {loading ? (
                    <Spinner size="sm" />
                  ) : (
                    <h3 className="stat-value">{draftListings}</h3>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

        {/* Filters and Listings Table */}
        <Card className="dashboard-card">
          <Card.Header className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h5 className="mb-1">All Listings</h5>
              <small className="text-muted">
                Showing {filteredListings.length} of {allListings.length} properties
                {hasActiveFilters && ` (${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} applied)`}
              </small>
            </div>
            <div className="d-flex gap-2">
              {hasActiveFilters && (
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={resetFilters}
                  className="d-flex align-items-center gap-2"
                >
                  <CIcon icon={cilX} className="me-1" />
                  Clear Filters
                </Button>
              )}
              <Button 
                variant={showFilters ? "primary" : "outline-primary"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="d-flex align-items-center gap-2"
              >
                <CIcon icon={showFilters ? cilCheckCircle : cilFilter} className="me-1" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge bg="light" text="dark" className="ms-1">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </div>
          </Card.Header>
          
          {/* Filter Panel */}
          <Collapse in={showFilters}>
            <div>
              <Card.Body className="border-bottom" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)' }}>
                <Row className="g-3">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">
                        <CIcon icon={cilFilterSquare} className="me-2" />
                        Search
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Search by title, location, type..."
                        value={filters.searchText}
                        onChange={(e) => setFilters(prev => ({ ...prev, searchText: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6} lg={3}>
                    <Form.Group>
                      <Form.Label className="fw-semibold d-flex align-items-center">
                        <CIcon icon={cilHome} className="me-2" />
                        Listing Type
                      </Form.Label>
                      <Form.Select
                        value={filters.listingType}
                        onChange={(e) => setFilters(prev => ({ ...prev, listingType: e.target.value }))}
                      >
                        <option value="">All Types</option>
                        {uniqueValues.listingTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6} lg={3}>
                    <Form.Group>
                      <Form.Label className="fw-semibold d-flex align-items-center">
                        <CIcon icon={cilMoney} className="me-2" />
                        Transaction
                      </Form.Label>
                      <Form.Select
                        value={filters.transaction}
                        onChange={(e) => setFilters(prev => ({ ...prev, transaction: e.target.value }))}
                      >
                        <option value="">All Transactions</option>
                        {uniqueValues.transactions.map(trans => (
                          <option key={trans} value={trans}>{trans}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6} lg={3}>
                    <Form.Group>
                      <Form.Label className="fw-semibold d-flex align-items-center">
                        <CIcon icon={cilCheckCircle} className="me-2" />
                        Approval Status
                      </Form.Label>
                      <Form.Select
                        value={filters.approvalStatus}
                        onChange={(e) => setFilters(prev => ({ ...prev, approvalStatus: e.target.value }))}
                      >
                        <option value="">All Statuses</option>
                        <option value="DRAFT">Draft</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6} lg={3}>
                    <Form.Group>
                      <Form.Label className="fw-semibold d-flex align-items-center">
                        <CIcon icon={cilLocationPin} className="me-2" />
                        City
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Filter by city"
                        value={filters.city}
                        onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                        list="city-list"
                      />
                      <datalist id="city-list">
                        {uniqueValues.cities.map(city => (
                          <option key={city} value={city} />
                        ))}
                      </datalist>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6} lg={3}>
                    <Form.Group>
                      <Form.Label className="fw-semibold d-flex align-items-center">
                        <CIcon icon={cilLocationPin} className="me-2" />
                        Locality
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Filter by locality"
                        value={filters.locality}
                        onChange={(e) => setFilters(prev => ({ ...prev, locality: e.target.value }))}
                        list="locality-list"
                      />
                      <datalist id="locality-list">
                        {uniqueValues.localities.map(locality => (
                          <option key={locality} value={locality} />
                        ))}
                      </datalist>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6} lg={3}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">Bedrooms</Form.Label>
                      <Form.Select
                        value={filters.bedrooms}
                        onChange={(e) => setFilters(prev => ({ ...prev, bedrooms: e.target.value }))}
                      >
                        <option value="">All</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(bed => (
                          <option key={bed} value={bed}>{bed} BHK</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6} lg={3}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">Bathrooms</Form.Label>
                      <Form.Select
                        value={filters.bathrooms}
                        onChange={(e) => setFilters(prev => ({ ...prev, bathrooms: e.target.value }))}
                      >
                        <option value="">All</option>
                        {[1, 2, 3, 4, 5, 6].map(bath => (
                          <option key={bath} value={bath}>{bath} Bath</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6} lg={3}>
                    <Form.Group>
                      <Form.Label className="fw-semibold d-flex align-items-center">
                        <CIcon icon={cilMoney} className="me-2" />
                        Min Price (₹)
                      </Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Min price"
                        value={filters.priceMin}
                        onChange={(e) => setFilters(prev => ({ ...prev, priceMin: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6} lg={3}>
                    <Form.Group>
                      <Form.Label className="fw-semibold d-flex align-items-center">
                        <CIcon icon={cilMoney} className="me-2" />
                        Max Price (₹)
                      </Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Max price"
                        value={filters.priceMax}
                        onChange={(e) => setFilters(prev => ({ ...prev, priceMax: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6} lg={3}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">Min Area (sq ft)</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Min area"
                        value={filters.areaMin}
                        onChange={(e) => setFilters(prev => ({ ...prev, areaMin: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6} lg={3}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">Max Area (sq ft)</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Max area"
                        value={filters.areaMax}
                        onChange={(e) => setFilters(prev => ({ ...prev, areaMax: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6} lg={3}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">Sub Type</Form.Label>
                      <Form.Select
                        value={filters.subType}
                        onChange={(e) => setFilters(prev => ({ ...prev, subType: e.target.value }))}
                      >
                        <option value="">All Sub Types</option>
                        {uniqueValues.subTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6} lg={3}>
                    <Form.Group>
                      <Form.Label className="fw-semibold d-flex align-items-center">
                        <CIcon icon={cilBuilding} className="me-2" />
                        Builder Name
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Filter by builder"
                        value={filters.builderName}
                        onChange={(e) => setFilters(prev => ({ ...prev, builderName: e.target.value }))}
                        list="builder-list"
                      />
                      <datalist id="builder-list">
                        {uniqueValues.builderNames.map(builder => (
                          <option key={builder} value={builder} />
                        ))}
                      </datalist>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6} lg={3}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">Balconies</Form.Label>
                      <Form.Select
                        value={filters.balconies}
                        onChange={(e) => setFilters(prev => ({ ...prev, balconies: e.target.value }))}
                      >
                        <option value="">All</option>
                        {[1, 2, 3, 4, 5, 6].map(bal => (
                          <option key={bal} value={bal}>{bal} Balcony{bal > 1 ? 'ies' : ''}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6} lg={3}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">Furnished</Form.Label>
                      <Form.Select
                        value={filters.furnished}
                        onChange={(e) => setFilters(prev => ({ ...prev, furnished: e.target.value }))}
                      >
                        <option value="">All</option>
                        {uniqueValues.furnished.map(furn => (
                          <option key={furn} value={furn}>{furn}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6} lg={3}>
                    <Form.Group>
                      <Form.Label className="fw-semibold d-flex align-items-center">
                        <CIcon icon={cilCarAlt} className="me-2" />
                        Parking
                      </Form.Label>
                      <Form.Select
                        value={filters.parking}
                        onChange={(e) => setFilters(prev => ({ ...prev, parking: e.target.value }))}
                      >
                        <option value="">All</option>
                        {uniqueValues.parking.map(park => (
                          <option key={park} value={park}>{park}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6} lg={3}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">Possession</Form.Label>
                      <Form.Select
                        value={filters.possession}
                        onChange={(e) => setFilters(prev => ({ ...prev, possession: e.target.value }))}
                      >
                        <option value="">All</option>
                        {uniqueValues.possessions.map(pos => (
                          <option key={pos} value={pos}>{pos}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6} lg={3}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">Occupancy</Form.Label>
                      <Form.Select
                        value={filters.occupancy}
                        onChange={(e) => setFilters(prev => ({ ...prev, occupancy: e.target.value }))}
                      >
                        <option value="">All</option>
                        {uniqueValues.occupancies.map(occ => (
                          <option key={occ} value={occ}>{occ}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6} lg={3}>
                    <Form.Group>
                      <Form.Label className="fw-semibold d-flex align-items-center">
                        <CIcon icon={cilLayers} className="me-2" />
                        Floor Number
                      </Form.Label>
                      <Form.Select
                        value={filters.floorNumber}
                        onChange={(e) => setFilters(prev => ({ ...prev, floorNumber: e.target.value }))}
                      >
                        <option value="">All</option>
                        {uniqueValues.floorNumbers.map(floor => (
                          <option key={floor} value={floor}>{floor}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6} lg={3}>
                    <Form.Group>
                      <Form.Label className="fw-semibold d-flex align-items-center">
                        <CIcon icon={cilBuilding} className="me-2" />
                        Total Floors
                      </Form.Label>
                      <Form.Select
                        value={filters.totalFloors}
                        onChange={(e) => setFilters(prev => ({ ...prev, totalFloors: e.target.value }))}
                      >
                        <option value="">All</option>
                        {uniqueValues.totalFloors.map(floors => (
                          <option key={floors} value={floors}>{floors}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6} lg={3}>
                    <Form.Group>
                      <Form.Label className="fw-semibold d-flex align-items-center">
                        <CIcon icon={cilCompass} className="me-2" />
                        Facing
                      </Form.Label>
                      <Form.Select
                        value={filters.facing}
                        onChange={(e) => setFilters(prev => ({ ...prev, facing: e.target.value }))}
                      >
                        <option value="">All Directions</option>
                        {uniqueValues.facing.map(face => (
                          <option key={face} value={face}>{face}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6} lg={3}>
                    <Form.Group>
                      <Form.Label className="fw-semibold d-flex align-items-center">
                        <CIcon icon={cilCalendar} className="me-2" />
                        Age of Construction
                      </Form.Label>
                      <Form.Select
                        value={filters.ageOfConstruction}
                        onChange={(e) => setFilters(prev => ({ ...prev, ageOfConstruction: e.target.value }))}
                      >
                        <option value="">All</option>
                        {uniqueValues.ageOfConstruction.map(age => (
                          <option key={age} value={age}>{age} Year{age > 1 ? 's' : ''}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6} lg={3}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">Ownership Type</Form.Label>
                      <Form.Select
                        value={filters.ownershipType}
                        onChange={(e) => setFilters(prev => ({ ...prev, ownershipType: e.target.value }))}
                      >
                        <option value="">All</option>
                        {uniqueValues.ownershipTypes.map(own => (
                          <option key={own} value={own}>{own}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6} lg={3}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">RERA ID</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Filter by RERA ID"
                        value={filters.reraId}
                        onChange={(e) => setFilters(prev => ({ ...prev, reraId: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6} lg={3}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">Min Price/Sqft (₹)</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Min price/sqft"
                        value={filters.pricePerSqftMin}
                        onChange={(e) => setFilters(prev => ({ ...prev, pricePerSqftMin: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6} lg={3}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">Max Price/Sqft (₹)</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Max price/sqft"
                        value={filters.pricePerSqftMax}
                        onChange={(e) => setFilters(prev => ({ ...prev, pricePerSqftMax: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6} lg={3}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">Min Maintenance (₹)</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Min maintenance"
                        value={filters.maintenanceChargesMin}
                        onChange={(e) => setFilters(prev => ({ ...prev, maintenanceChargesMin: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6} lg={3}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">Max Maintenance (₹)</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Max maintenance"
                        value={filters.maintenanceChargesMax}
                        onChange={(e) => setFilters(prev => ({ ...prev, maintenanceChargesMax: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6} lg={3}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">Min Booking Amount (₹)</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Min booking amount"
                        value={filters.bookingAmountMin}
                        onChange={(e) => setFilters(prev => ({ ...prev, bookingAmountMin: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6} lg={3}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">Max Booking Amount (₹)</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Max booking amount"
                        value={filters.bookingAmountMax}
                        onChange={(e) => setFilters(prev => ({ ...prev, bookingAmountMax: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </div>
          </Collapse>
          
          <Card.Body>
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-3 text-muted">Loading your properties...</p>
              </div>
            ) : error ? (
              <Alert variant="danger">
                <Alert.Heading>Error Loading Properties</Alert.Heading>
                <p>{error}</p>
                <Button variant="outline-danger" size="sm" onClick={fetchUserProperties}>
                  Retry
                </Button>
              </Alert>
            ) : allListings.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted mb-3">You haven&apos;t posted any properties yet.</p>
                <Button 
                  variant="primary"
                  onClick={() => window.location.href = '/portal/dashboard/listings?action=add'}
                >
                  Add Your First Property
                </Button>
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted mb-3">No properties match your filters.</p>
                <Button 
                  variant="outline-primary"
                  onClick={resetFilters}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Location</th>
                      <th>Price</th>
                      <th>Area</th>
                      <th>Status</th>
                      <th>Views</th>
                      <th>Inquiries</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredListings.map(listing => (
                      <tr key={listing.id}>
                        <td>
                          <div>
                            <h6 className="mb-1 fw-semibold">{listing.title}</h6>
                            <small className="text-muted">ID: #{listing.id}</small>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <CIcon icon={cilLocationPin} className="me-1 text-muted" />
                            <span>{listing.location}</span>
                          </div>
                        </td>
                        <td>
                          <strong className="text-primary">{listing.price}</strong>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <CIcon icon={cilViewModule} className="me-1 text-muted" />
                            <span>{listing.area}</span>
                          </div>
                        </td>
                        <td>
                          <Badge bg={listing.statusBadge}>
                            {listing.status}
                          </Badge>
                        </td>
                        <td>
                          <span className="text-muted">{listing.views}</span>
                        </td>
                        <td>
                          <span className="text-muted">{listing.inquiries}</span>
                        </td>
                        <td>
                          <small className="text-muted">
                            {listing.created ? new Date(listing.created).toLocaleDateString() : 'N/A'}
                          </small>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => handleView(listing.id)}
                              disabled={deletingId === listing.id}
                            >
                              View
                            </Button>
                            <Button 
                              variant="outline-secondary" 
                              size="sm"
                              onClick={() => handleEdit(listing.id)}
                              disabled={deletingId === listing.id}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleDelete(listing.id)}
                              disabled={deletingId === listing.id}
                            >
                              {deletingId === listing.id ? (
                                <>
                                  <Spinner size="sm" className="me-1" />
                                  Deleting...
                                </>
                              ) : (
                                'Delete'
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card.Body>
        </Card>
      
      <style jsx>{`
        /* Common styles are now in PortalCommonStyles.css */
        /* Only page-specific styles below */
        
        :global(.table thead th) {
          background: var(--portal-primary, #68ac78);
          color: white;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.5px;
          border: none;
          padding: 1rem 0.75rem;
        }
        
        :global(.table tbody tr) {
          transition: all 0.2s ease;
        }
        
        :global(.table tbody tr:hover) {
          background: rgba(104, 172, 120, 0.05);
          transform: translateX(2px);
        }
        
        :global(.table td) {
          vertical-align: middle;
          padding: 1rem 0.75rem;
          border-top: 1px solid var(--portal-gray-200, #e9ecef);
        }
      `}</style>
    </div>
  );
}
