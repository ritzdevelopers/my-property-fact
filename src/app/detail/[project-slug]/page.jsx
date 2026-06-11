"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Badge, 
  Spinner, 
  Alert,
  Accordion
} from "react-bootstrap";
import { 
  faBed, 
  faBath, 
  faSquare, 
  faLocationDot,
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faCalendar,
  faParking,
  faCouch,
  faRuler,
  faBuilding
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8005";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params["project-slug"];
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const fetchProjectDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
      const url = `${apiUrl}/projects/get/${slug}`;
      
      // Add timeout to prevent infinite loading
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        if (response.status === 404) {
          throw new Error("Project not found. This project may not be published yet or the slug is incorrect.");
        }
        throw new Error(`Failed to load project (${response.status}): ${errorText.substring(0, 100)}`);
      }

      const projectData = await response.json();
      
      // Check if we got an empty object or no data
      // Backend returns empty ProjectDetailDto {} when project not found
      if (!projectData || 
          (typeof projectData === 'object' && 
           Object.keys(projectData).length === 0) ||
          (!projectData.id && !projectData.projectName && !projectData.slugURL)) {
        console.error("Received empty project data object - project not found or not published");
        throw new Error("Project not found. This project may not exist, may not be approved yet, or the slug URL is incorrect. Please check that the project has been approved.");
      }
      
      // Check if we have valid project data - projectName might be missing for user-submitted projects
      if (projectData && (projectData.projectName || projectData.id)) {
        // Ensure we have at least basic fields
        const processedProject = {
          ...projectData,
          // Fallback for project name
          projectName: projectData.projectName || projectData.title || "Unnamed Property",
          // Handle empty lists/null values
          projectGalleryImageList: projectData.projectGalleryImageList || projectData.projectGalleryDtoList || [],
          projectAmenityList: projectData.projectAmenityList || projectData.amenities || [],
          projectFloorPlanList: projectData.projectFloorPlanList || projectData.floorPlans || [],
          projectLocationBenefitList: projectData.projectLocationBenefitList || projectData.locationBenefits || [],
          projectFaqList: projectData.projectFaqList || projectData.faqs || []
        };
        setProject(processedProject);
        setLoading(false);
      } else {
        console.error("Invalid project data structure:", projectData);
        throw new Error("Invalid project data: The project data received is not in the expected format.");
      }
    } catch (err) {
      console.error("Error fetching project:", err);
      if (err.name === 'AbortError') {
        setError("Request timed out. Please check your backend server is running at " + API_BASE_URL + " and try again.");
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Failed to load project details. Please check the console for more information.");
      }
    } finally {
      // Always stop loading, even if there's an error
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (slug) {
      fetchProjectDetails();
    } else {
      setLoading(false);
      setError("No project slug provided");
    }
  }, [slug, fetchProjectDetails]);

  const formatPrice = (price) => {
    if (!price && price !== 0) return "Price on Request";
    
    let numPrice;
    if (typeof price === 'string') {
      if (price.includes('E') || price.includes('e')) {
        numPrice = parseFloat(price);
      } else {
        numPrice = parseFloat(price.replace(/[^0-9.Ee+\-]/g, ''));
      }
      
      if (isNaN(numPrice)) {
        const match = price.match(/[\d.]+[Ee][\d+-]+/);
        if (match) {
          numPrice = parseFloat(match[0]);
        } else {
          return price;
        }
      }
    } else {
      numPrice = typeof price === 'number' ? price : parseFloat(price);
    }
    
    if (isNaN(numPrice)) return "Price on Request";
    
    if (numPrice >= 10000000) {
      return `₹${(numPrice / 10000000).toFixed(2)} Cr`;
    } else if (numPrice >= 100000) {
      return `₹${(numPrice / 100000).toFixed(2)} L`;
    }
    return `₹${Math.round(numPrice).toLocaleString('en-IN')}`;
  };

  const formatArea = (area) => {
    if (!area && area !== 0) return "N/A";
    const areaNum = typeof area === 'number' ? area : parseFloat(area);
    if (isNaN(areaNum)) return "N/A";
    return `${Math.round(areaNum)} sq ft`;
  };

  // Gallery slider settings
  const gallerySettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    beforeChange: (current, next) => setActiveImageIndex(next),
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" size="lg" />
          <p className="mt-3 text-muted">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container my-5">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Project</Alert.Heading>
          <p>{error}</p>
          <Button variant="primary" onClick={() => router.push("/")}>
            Go to Homepage
          </Button>
        </Alert>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container my-5">
        <Alert variant="warning">
          <Alert.Heading>Project Not Found</Alert.Heading>
          <p>This project may have been removed or the link is incorrect.</p>
          <Button variant="primary" onClick={() => router.push("/")}>
            Go to Homepage
          </Button>
        </Alert>
      </div>
    );
  }

  // Get gallery images - handle galleyImage typo in DTO
  const galleryImages = project.projectGalleryImageList || [];
  const hasImages = galleryImages.length > 0 && galleryImages.some(img => img.galleyImage || img.image);
  
  // Get amenities - already processed in fetchProjectDetails
  const amenities = project.projectAmenityList || [];
  
  // Get floor plans - already processed in fetchProjectDetails
  const floorPlans = project.projectFloorPlanList || [];
  
  // Get location benefits - already processed in fetchProjectDetails
  const locationBenefits = project.projectLocationBenefitList || [];
  
  // Get FAQs - already processed in fetchProjectDetails
  const faqs = project.projectFaqList || [];

  return (
    <div className="project-detail-page">
      {/* Hero Section with Images */}
      <section className="hero-section">
        {hasImages ? (
          <Slider {...gallerySettings} className="hero-slider">
            {galleryImages.map((image, index) => {
          // Handle different image field names - galleyImage is a typo in the DTO
          const imagePath = image.galleyImage || image.image || image.galleryImage || image.imageName || "";
          
          // Construct image URL - images are stored in properties/{slug}/ folder
          let imageUrl = "";
          if (imagePath && project.slugURL) {
            const baseUrl = process.env.NEXT_PUBLIC_IMAGE_URL || "";
            // Remove trailing slashes
            let cleanBase = baseUrl.replace(/\/+$/, '');
            
            // Check if baseUrl already ends with /get/images (case-insensitive)
            const hasGetImages = /\/get\/images\/?$/i.test(cleanBase);
            
            // If baseUrl doesn't already have /get/images, add it
            if (!hasGetImages) {
              cleanBase = `${cleanBase}/get/images`;
            }
            
            // Images are stored in properties/{slug}/ format
            imageUrl = `${cleanBase}/properties/${project.slugURL}/${imagePath}`;
          }
          
          return (
            <div key={index}>
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={image.altTag || image.mobileAltTag || image.desktopAltTag || `Project image ${index + 1}`}
                  className="hero-image"
                  style={{ width: "100%", height: "70vh", objectFit: "cover", display: "block" }}
                  onError={(e) => {
                    console.error("Failed to load image:", imageUrl);
                    // Hide image if it fails to load
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="hero-image d-flex align-items-center justify-content-center bg-light" style={{ width: "100%", height: "70vh" }}>
                  <p className="text-muted">Image not available</p>
                </div>
              )}
            </div>
          );
        })}
          </Slider>
        ) : (
          <div 
            className="hero-placeholder"
            style={{
              width: "100%",
              height: "70vh",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "2rem"
            }}
          >
            <div className="text-center">
              <FontAwesomeIcon icon={faBuilding} size="3x" className="mb-3" />
              <h2>{project.projectName}</h2>
            </div>
          </div>
        )}
      </section>

      {/* Quick Info Bar */}
      <section className="quick-info-bar">
        <div className="container">
          <Row className="g-4 py-4">
            <Col md={3} className="text-center">
              <h4 className="text-primary mb-2">{formatPrice(project.totalPrice || project.projectPrice)}</h4>
              <p className="text-muted mb-0">Starting Price</p>
            </Col>
            <Col md={3} className="text-center">
              <h4 className="text-primary mb-2">{project.projectConfiguration || "N/A"}</h4>
              <p className="text-muted mb-0">Configuration</p>
            </Col>
            <Col md={3} className="text-center">
              <h4 className="text-primary mb-2">
                <FontAwesomeIcon icon={faLocationDot} className="me-2" />
                {project.cityName || project.projectLocality || "Location"}
              </h4>
              <p className="text-muted mb-0">Location</p>
            </Col>
            <Col md={3} className="text-center">
              <h4 className="text-primary mb-2">
                <Badge bg="success">{project.projectStatusName || "Available"}</Badge>
              </h4>
              <p className="text-muted mb-0">Status</p>
            </Col>
          </Row>
        </div>
      </section>

      {/* Main Content */}
      <div className="container my-5">
        <Row>
          {/* Left Column - Main Details */}
          <Col lg={8}>
            {/* Project Overview */}
            <Card className="mb-4 shadow-sm">
              <Card.Body className="p-4">
                <h2 className="mb-4">Project Overview</h2>
                {project.projectAboutLongDescription ? (
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: project.projectAboutLongDescription 
                    }} 
                    className="project-description"
                  />
                ) : project.projectWalkthroughDescription ? (
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: project.projectWalkthroughDescription 
                    }} 
                    className="project-description"
                  />
                ) : project.locationDescription ? (
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: project.locationDescription 
                    }} 
                    className="project-description"
                  />
                ) : (
                  <p className="text-muted">No description available.</p>
                )}
              </Card.Body>
            </Card>

            {/* Property Details */}
            <Card className="mb-4 shadow-sm">
              <Card.Body className="p-4">
                <h3 className="mb-4">Property Details</h3>
                {(project.bedrooms || project.bathrooms || project.carpetAreaSqft || project.builtUpAreaSqft || 
                  project.floorNumber || project.facing || project.parkingDetails || project.furnishedStatus || 
                  project.pricePerSqft || project.balconies || project.superBuiltUpAreaSqft || project.plotAreaSqft ||
                  project.ageOfConstruction || project.maintenanceCharges || project.bookingAmount || 
                  project.transactionType || project.listingType || project.propertySubtype || 
                  project.possessionStatus || project.occupancyStatus) ? (
                  <Row className="g-4">
                    {project.bedrooms && (
                      <Col xs={6} md={4}>
                        <div className="detail-item text-center p-3">
                          <FontAwesomeIcon icon={faBed} className="text-primary fs-4 mb-2 d-block" />
                          <strong className="d-block">Bedrooms</strong>
                          <span className="text-primary fs-5">{project.bedrooms}</span>
                        </div>
                      </Col>
                    )}
                    {project.bathrooms && (
                      <Col xs={6} md={4}>
                        <div className="detail-item text-center p-3">
                          <FontAwesomeIcon icon={faBath} className="text-primary fs-4 mb-2 d-block" />
                          <strong className="d-block">Bathrooms</strong>
                          <span className="text-primary fs-5">{project.bathrooms}</span>
                        </div>
                      </Col>
                    )}
                    {project.balconies && (
                      <Col xs={6} md={4}>
                        <div className="detail-item text-center p-3">
                          <FontAwesomeIcon icon={faBuilding} className="text-primary fs-4 mb-2 d-block" />
                          <strong className="d-block">Balconies</strong>
                          <span className="text-primary fs-5">{project.balconies}</span>
                        </div>
                      </Col>
                    )}
                    {project.carpetAreaSqft && (
                      <Col xs={6} md={4}>
                        <div className="detail-item text-center p-3">
                          <FontAwesomeIcon icon={faSquare} className="text-primary fs-4 mb-2 d-block" />
                          <strong className="d-block">Carpet Area</strong>
                          <span className="text-primary">{formatArea(project.carpetAreaSqft)}</span>
                        </div>
                      </Col>
                    )}
                    {project.builtUpAreaSqft && (
                      <Col xs={6} md={4}>
                        <div className="detail-item text-center p-3">
                          <FontAwesomeIcon icon={faSquare} className="text-primary fs-4 mb-2 d-block" />
                          <strong className="d-block">Built-up Area</strong>
                          <span className="text-primary">{formatArea(project.builtUpAreaSqft)}</span>
                        </div>
                      </Col>
                    )}
                    {project.superBuiltUpAreaSqft && (
                      <Col xs={6} md={4}>
                        <div className="detail-item text-center p-3">
                          <FontAwesomeIcon icon={faSquare} className="text-primary fs-4 mb-2 d-block" />
                          <strong className="d-block">Super Built-up</strong>
                          <span className="text-primary">{formatArea(project.superBuiltUpAreaSqft)}</span>
                        </div>
                      </Col>
                    )}
                    {project.plotAreaSqft && (
                      <Col xs={6} md={4}>
                        <div className="detail-item text-center p-3">
                          <FontAwesomeIcon icon={faSquare} className="text-primary fs-4 mb-2 d-block" />
                          <strong className="d-block">Plot Area</strong>
                          <span className="text-primary">{formatArea(project.plotAreaSqft)}</span>
                        </div>
                      </Col>
                    )}
                    {project.floorNumber && project.totalFloors && (
                      <Col xs={6} md={4}>
                        <div className="detail-item text-center p-3">
                          <FontAwesomeIcon icon={faBuilding} className="text-primary fs-4 mb-2 d-block" />
                          <strong className="d-block">Floor</strong>
                          <span className="text-primary">{project.floorNumber} of {project.totalFloors}</span>
                        </div>
                      </Col>
                    )}
                    {project.facing && (
                      <Col xs={6} md={4}>
                        <div className="detail-item text-center p-3">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-primary fs-4 mb-2 d-block" />
                          <strong className="d-block">Facing</strong>
                          <span className="text-primary">{project.facing}</span>
                        </div>
                      </Col>
                    )}
                    {project.parkingDetails && (
                      <Col xs={6} md={4}>
                        <div className="detail-item text-center p-3">
                          <FontAwesomeIcon icon={faParking} className="text-primary fs-4 mb-2 d-block" />
                          <strong className="d-block">Parking</strong>
                          <span className="text-primary small">{project.parkingDetails}</span>
                        </div>
                      </Col>
                    )}
                    {project.furnishedStatus && (
                      <Col xs={6} md={4}>
                        <div className="detail-item text-center p-3">
                          <FontAwesomeIcon icon={faCouch} className="text-primary fs-4 mb-2 d-block" />
                          <strong className="d-block">Furnishing</strong>
                          <span className="text-primary small">{project.furnishedStatus}</span>
                        </div>
                      </Col>
                    )}
                    {project.pricePerSqft && (
                      <Col xs={6} md={4}>
                        <div className="detail-item text-center p-3">
                          <FontAwesomeIcon icon={faRuler} className="text-primary fs-4 mb-2 d-block" />
                          <strong className="d-block">Price/sqft</strong>
                          <span className="text-primary">₹{Math.round(project.pricePerSqft).toLocaleString('en-IN')}</span>
                        </div>
                      </Col>
                    )}
                    {project.ageOfConstruction && (
                      <Col xs={6} md={4}>
                        <div className="detail-item text-center p-3">
                          <FontAwesomeIcon icon={faCalendar} className="text-primary fs-4 mb-2 d-block" />
                          <strong className="d-block">Age</strong>
                          <span className="text-primary">{project.ageOfConstruction} years</span>
                        </div>
                      </Col>
                    )}
                    {project.transactionType && (
                      <Col xs={6} md={4}>
                        <div className="detail-item text-center p-3">
                          <Badge bg={project.transactionType === "Sale" ? "success" : "info"} className="fs-6 p-2">
                            {project.transactionType}
                          </Badge>
                          <strong className="d-block mt-2">Transaction</strong>
                        </div>
                      </Col>
                    )}
                    {project.listingType && (
                      <Col xs={6} md={4}>
                        <div className="detail-item text-center p-3">
                          <Badge bg="secondary" className="fs-6 p-2">{project.listingType}</Badge>
                          <strong className="d-block mt-2">Type</strong>
                        </div>
                      </Col>
                    )}
                    {project.propertySubtype && (
                      <Col xs={6} md={4}>
                        <div className="detail-item text-center p-3">
                          <strong className="d-block">Subtype</strong>
                          <span className="text-primary">{project.propertySubtype}</span>
                        </div>
                      </Col>
                    )}
                    {project.possessionStatus && (
                      <Col xs={6} md={4}>
                        <div className="detail-item text-center p-3">
                          <strong className="d-block">Possession</strong>
                          <span className="text-primary">{project.possessionStatus}</span>
                        </div>
                      </Col>
                    )}
                    {project.occupancyStatus && (
                      <Col xs={6} md={4}>
                        <div className="detail-item text-center p-3">
                          <strong className="d-block">Occupancy</strong>
                          <span className="text-primary">{project.occupancyStatus}</span>
                        </div>
                      </Col>
                    )}
                    {project.noticePeriod && (
                      <Col xs={6} md={4}>
                        <div className="detail-item text-center p-3">
                          <strong className="d-block">Notice Period</strong>
                          <span className="text-primary">{project.noticePeriod} days</span>
                        </div>
                      </Col>
                    )}
                    {project.maintenanceCharges && (
                      <Col xs={6} md={4}>
                        <div className="detail-item text-center p-3">
                          <strong className="d-block">Maintenance</strong>
                          <span className="text-primary">₹{Math.round(project.maintenanceCharges).toLocaleString('en-IN')}/month</span>
                        </div>
                      </Col>
                    )}
                    {project.bookingAmount && (
                      <Col xs={6} md={4}>
                        <div className="detail-item text-center p-3">
                          <strong className="d-block">Booking Amount</strong>
                          <span className="text-primary">{formatPrice(project.bookingAmount)}</span>
                        </div>
                      </Col>
                    )}
                  </Row>
                ) : (
                  <p className="text-muted">Property details will be displayed here once available.</p>
                )}
              </Card.Body>
            </Card>

            {/* Amenities */}
            {amenities && amenities.length > 0 && (
              <Card className="mb-4 shadow-sm">
                <Card.Body className="p-4">
                  <h3 className="mb-4">Amenities</h3>
                  {project.amenityDescription && (
                    <div 
                      className="mb-4"
                      dangerouslySetInnerHTML={{ 
                        __html: project.amenityDescription 
                      }} 
                    />
                  )}
                  <Row className="g-3">
                    {amenities.map((amenity, index) => (
                      <Col xs={6} sm={4} md={3} lg={2} key={index}>
                        <div className="amenity-card text-center p-3 border rounded h-100">
                          {amenity.image && (
                            <div className="mb-2 d-flex justify-content-center">
                              <img
                                src={`${process.env.NEXT_PUBLIC_IMAGE_URL || ""}amenity/${amenity.image}`}
                                alt={amenity.title || amenity.mobileAltTag || amenity.desktopAltTag || `Amenity ${index + 1}`}
                                width={50}
                                height={50}
                                style={{ objectFit: "contain" }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          <p className="mb-0 small fw-semibold">{amenity.title || amenity.name}</p>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
            )}

            {/* Floor Plans */}
            {floorPlans && floorPlans.length > 0 && (
              <Card className="mb-4 shadow-sm">
                <Card.Body className="p-4">
                  <h3 className="mb-4">Floor Plans</h3>
                  {project.floorPlanDescription && (
                    <div 
                      className="mb-4"
                      dangerouslySetInnerHTML={{ 
                        __html: project.floorPlanDescription 
                      }} 
                    />
                  )}
                  <Row className="g-4">
                    {floorPlans.map((plan, index) => (
                      <Col md={6} lg={4} key={index}>
                        <Card className="h-100">
                          <Card.Body>
                            <h5>{plan.planType || plan.type || "Floor Plan"}</h5>
                            <p className="mb-2">
                              <FontAwesomeIcon icon={faSquare} className="text-primary me-2" />
                              <strong>Area:</strong> {formatArea(plan.areaSqFt || plan.area)}
                            </p>
                            {(plan.price || plan.pricePerUnit) && (
                              <p className="text-primary fw-bold mb-0">
                                {formatPrice(plan.price || plan.pricePerUnit)}
                              </p>
                            )}
                            <Button variant="outline-primary" className="mt-3 w-100">
                              View Details
                            </Button>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
            )}

            {/* Location Benefits */}
            {locationBenefits && locationBenefits.length > 0 && (
              <Card className="mb-4 shadow-sm">
                <Card.Body className="p-4">
                  <h3 className="mb-4">Location Benefits</h3>
                  <Row className="g-3">
                    {locationBenefits.map((benefit, index) => (
                      <Col xs={6} sm={4} md={3} lg={2} key={index}>
                        <div className="text-center p-3 border rounded h-100">
                          {(benefit.iconImage || benefit.image) && (
                            <div className="mb-2 d-flex justify-content-center">
                              <img
                                src={`${(() => {
                                  const baseUrl = process.env.NEXT_PUBLIC_IMAGE_URL || "";
                                  let cleanBase = baseUrl.replace(/\/+$/, '');
                                  const hasGetImages = /\/get\/images\/?$/i.test(cleanBase);
                                  if (!hasGetImages) {
                                    cleanBase = `${cleanBase}/get/images`;
                                  }
                                  return `${cleanBase}/location-benefit/${benefit.iconImage || benefit.image}`;
                                })()}`}
                                alt={benefit.title || benefit.benefitName || benefit.name || `Location benefit ${index + 1}`}
                                width={50}
                                height={50}
                                style={{ objectFit: "contain" }}
                                onError={(e) => {
                                  // Try fallback path using icon endpoint
                                  const baseUrl = process.env.NEXT_PUBLIC_IMAGE_URL || "";
                                  let cleanBase = baseUrl.replace(/\/+$/, '');
                                  const hasGetImages = /\/get\/images\/?$/i.test(cleanBase);
                                  if (!hasGetImages) {
                                    cleanBase = `${cleanBase}/get/images`;
                                  }
                                  const fallback = `${cleanBase}/icon/${benefit.iconImage || benefit.image}`;
                                  if (e.target.src !== fallback) {
                                    e.target.src = fallback;
                                  } else {
                                    e.target.style.display = 'none';
                                  }
                                }}
                              />
                            </div>
                          )}
                          <p className="mb-1 small fw-semibold">{benefit.title || benefit.benefitName || benefit.name}</p>
                          {(benefit.distance || benefit.distanceKm) && (
                            <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>
                              {benefit.distance || benefit.distanceKm} km
                            </p>
                          )}
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
            )}

            {/* FAQs */}
            {faqs && faqs.length > 0 && (
              <Card className="mb-4 shadow-sm">
                <Card.Body className="p-4">
                  <h3 className="mb-4">Frequently Asked Questions</h3>
                  <Accordion>
                    {faqs.map((faq, index) => (
                      <Accordion.Item eventKey={index.toString()} key={index}>
                        <Accordion.Header>{faq.question}</Accordion.Header>
                        <Accordion.Body>
                          {faq.answer}
                        </Accordion.Body>
                      </Accordion.Item>
                    ))}
                  </Accordion>
                </Card.Body>
              </Card>
            )}
          </Col>

          {/* Right Column - Contact & Quick Info */}
          <Col lg={4}>
            {/* Contact Card */}
            <Card className="mb-4 shadow-lg sticky-top" style={{ top: "20px" }}>
              <Card.Body className="p-4">
                <h4 className="mb-4">Get in Touch</h4>
                
                {project.contactName && (
                  <div className="mb-3">
                    <strong>Contact Person:</strong>
                    <p className="mb-0">{project.contactName}</p>
                  </div>
                )}
                
                {project.contactPhone && (
                  <div className="mb-3">
                    <FontAwesomeIcon icon={faPhone} className="text-primary me-2" />
                    <strong>Phone:</strong>
                    <p className="mb-0">
                      <a href={`tel:${project.contactPhone}`} className="text-decoration-none">
                        {project.contactPhone}
                      </a>
                    </p>
                  </div>
                )}
                
                {project.contactEmail && (
                  <div className="mb-3">
                    <FontAwesomeIcon icon={faEnvelope} className="text-primary me-2" />
                    <strong>Email:</strong>
                    <p className="mb-0">
                      <a href={`mailto:${project.contactEmail}`} className="text-decoration-none">
                        {project.contactEmail}
                      </a>
                    </p>
                  </div>
                )}

                {project.preferredTime && (
                  <div className="mb-3">
                    <FontAwesomeIcon icon={faCalendar} className="text-primary me-2" />
                    <strong>Preferred Time:</strong>
                    <p className="mb-0">{project.preferredTime}</p>
                  </div>
                )}

                <Button 
                  variant="primary" 
                  size="lg" 
                  className="w-100 mt-3"
                  onClick={() => {
                    if (project.contactPhone) {
                      window.location.href = `tel:${project.contactPhone}`;
                    } else if (project.ivrNo) {
                      window.location.href = `tel:${project.ivrNo}`;
                    } else {
                      alert("Contact number not available");
                    }
                  }}
                >
                  Request Callback
                </Button>
                
                {project.ivrNo && (
                  <Button 
                    variant="outline-primary" 
                    size="lg" 
                    className="w-100 mt-2"
                    onClick={() => window.location.href = `tel:${project.ivrNo}`}
                  >
                    Call: {project.ivrNo}
                  </Button>
                )}
              </Card.Body>
            </Card>

            {/* Quick Stats Card */}
            <Card className="mb-4 shadow-sm">
              <Card.Body className="p-4">
                <h5 className="mb-4">Project Highlights</h5>
                <div className="quick-stats">
                  {project.builderName && (
                    <div className="mb-3">
                      <strong>Builder:</strong>
                      <p className="mb-0">{project.builderName}</p>
                    </div>
                  )}
                  
                  {project.propertyTypeName && (
                    <div className="mb-3">
                      <strong>Property Type:</strong>
                      <p className="mb-0">{project.propertyTypeName}</p>
                    </div>
                  )}
                  
                  {project.reraNo && (
                    <div className="mb-3">
                      <strong>RERA Number:</strong>
                      <p className="mb-0">{project.reraNo}</p>
                    </div>
                  )}
                  
                  {project.transactionType && (
                    <div className="mb-3">
                      <strong>Transaction:</strong>
                      <p className="mb-0">
                        <Badge bg={project.transactionType === "Sale" ? "success" : "info"}>
                          {project.transactionType}
                        </Badge>
                      </p>
                    </div>
                  )}
                  
                  {project.listingType && (
                    <div className="mb-3">
                      <strong>Category:</strong>
                      <p className="mb-0">
                        <Badge bg="secondary">{project.listingType}</Badge>
                      </p>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>

            {/* Location Map */}
            {project.locationMapImage && (
              <Card className="mb-4 shadow-sm">
                <Card.Body className="p-0">
                  <img
                    src={`${process.env.NEXT_PUBLIC_IMAGE_URL || ""}properties/${project.slugURL}/${project.locationMapImage}`}
                    alt="Location Map"
                    width={400}
                    height={300}
                    className="w-100"
                    style={{ objectFit: "cover" }}
                  />
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
}
