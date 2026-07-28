"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { useSiteData } from "@/app/_global_components/contexts/SiteDataContext";
import { buildProjectImageUrl } from "@/lib/projectImageUrl";
import { HOME_FAQ_ITEMS } from "./homeFaqItems";
import { useDeferredStylesheet } from "@/lib/useDeferredStylesheet";

function getProjectImageUrl(project) {
  return buildProjectImageUrl(project, { preferThumbnail: true });
}

/** Prefer a project in this city with a banner, then higher indicative price. */
function findTopProjectForCity(projectsArray, cityName) {
  if (!cityName || !Array.isArray(projectsArray) || !projectsArray.length) {
    return null;
  }
  const n = String(cityName).toLowerCase().trim();
  const inCity = projectsArray.filter(
    (p) => String(p.cityName || "")
      .toLowerCase()
      .trim() === n,
  );
  if (!inCity.length) return null;
  inCity.sort((a, b) => {
    const hasA = a.projectBannerImage || a.projectThumbnailImage ? 1 : 0;
    const hasB = b.projectBannerImage || b.projectThumbnailImage ? 1 : 0;
    if (hasB !== hasA) return hasB - hasA;
    const ap = parseFloat(a.projectPrice);
    const bp = parseFloat(b.projectPrice);
    const aOk = !Number.isNaN(ap) ? ap : 0;
    const bOk = !Number.isNaN(bp) ? bp : 0;
    return bOk - aOk;
  });
  return inCity[0];
}

// Static city data (10 cards)
const CITY_CARDS = [
  {
    id: "ludhiana",
    name: "Ludhiana",
    priceRange: "₹4,000 – ₹8,000 per sqft",
    totalProperties: 2847,
    href: "/city/ludhiana",
    imageSrc: "/agi-sky.webp",
  },
  {
    id: "maria-one",
    name: "Kochi",
    priceRange: "₹5,000 – ₹12,000 per sqft",
    totalProperties: 1923,
    href: "/city/kochi",
    imageSrc: "/marina.webp",
  },
  {
    id: "ajmera-marina",
    name: "Bangalore",
    priceRange: "₹6,000 – ₹15,000 per sqft",
    totalProperties: 5124,
    href: "/city/bangalore",
    imageSrc: "/ajmer.webp",
  },
  {
    id: "galaxy-sawasdee",
    name: "Delhi",
    priceRange: "₹8,000 – ₹25,000 per sqft",
    totalProperties: 3891,
    href: "/city/delhi",
    imageSrc: "/NewDelhi.webp",
  },
  {
    id: "adani-9-pbr",
    name: "Mumbai",
    priceRange: "₹15,000 – ₹50,000 per sqft",
    totalProperties: 2654,
    href: "/city/mumbai",
    imageSrc: "/adani.webp",
  },
  
  {
    id: "sector-153",
    name: "Noida",
    priceRange: "₹7,000 – ₹12,000 per sqft",
    totalProperties: 487,
    href: "/city/noida",
    imageSrc: "/ace-153.webp",
  },
];

const FAQ_ITEMS = HOME_FAQ_ITEMS;

export default function NoidaProjectsSection() {
  useDeferredStylesheet(() =>
    Promise.all([
      import("swiper/css"),
      import("./NoidaProjectsSection.css"),
    ]),
  );

  const [cityCards, setCityCards] = useState(CITY_CARDS);
  const [openFaqId, setOpenFaqId] = useState(FAQ_ITEMS[0]?.id || null);
  const { cityList, projectList } = useSiteData();
  useEffect(() => {
      try {
        if (!cityList || cityList.length === 0 || !projectList || projectList.length === 0) {
          return;
        }
        
        const cityArray = Array.isArray(cityList) ? cityList : [];
        const projectsArray = Array.isArray(projectList) ? projectList : [];

        // Create maps for project counts and price ranges by city
        const cityProjectCountMap = new Map();
        const cityPriceMap = new Map(); // Map to store pricePerSqft arrays for each city
        
        // Helper function to extract price per sqft from project
        const getPricePerSqft = (project) => {
          // Try different possible field names
          const price = project.pricePerSqft || 
                       project.price_per_sqft || 
                       project.pricePerSqFt;
          
          if (price === null || price === undefined) return null;
          
          // Convert to number if it's a string
          const numPrice = typeof price === 'string' 
            ? parseFloat(price.replace(/[^0-9.]/g, '')) 
            : parseFloat(price);
          
          return isNaN(numPrice) || numPrice <= 0 ? null : numPrice;
        };
        
        // Process projects to count and collect prices by city
        projectsArray.forEach((project) => {
          const cityName = project.cityName || project.city?.name || project.city?.cityName;
          const cityId = project.cityId || project.city?.id;
          const pricePerSqft = getPricePerSqft(project);
          
          if (cityName) {
            const normalizedName = cityName.toLowerCase();
            
            // Count projects
            cityProjectCountMap.set(
              normalizedName,
              (cityProjectCountMap.get(normalizedName) || 0) + 1
            );
            
            // Collect prices
            if (pricePerSqft !== null) {
              if (!cityPriceMap.has(normalizedName)) {
                cityPriceMap.set(normalizedName, []);
              }
              cityPriceMap.get(normalizedName).push(pricePerSqft);
            }
          }
          
          if (cityId) {
            // Count projects by ID
            cityProjectCountMap.set(
              `id_${cityId}`,
              (cityProjectCountMap.get(`id_${cityId}`) || 0) + 1
            );
            
            // Collect prices by ID
            if (pricePerSqft !== null) {
              const idKey = `id_${cityId}`;
              if (!cityPriceMap.has(idKey)) {
                cityPriceMap.set(idKey, []);
              }
              cityPriceMap.get(idKey).push(pricePerSqft);
            }
          }
        });
        
        // Helper function to format price range
        const formatPriceRange = (prices) => {
          if (!prices || prices.length === 0) return null;
          
          const validPrices = prices.filter(p => p !== null && p > 0);
          if (validPrices.length === 0) return null;
          
          const minPrice = Math.min(...validPrices);
          const maxPrice = Math.max(...validPrices);
          
          // Format with Indian number formatting
          const formatPrice = (price) => {
            return Math.round(price).toLocaleString('en-IN');
          };
          
          if (minPrice === maxPrice) {
            return `₹${formatPrice(minPrice)} per sqft`;
          }
          
          return `₹${formatPrice(minPrice)} – ₹${formatPrice(maxPrice)} per sqft`;
        };

        // Update city cards with actual project counts and price ranges from database
        const updatedCards = CITY_CARDS.map((card) => {
          // Find matching city by name (case-insensitive)
          const cityData = cityArray.find(
            (city) => 
              city.cityName?.toLowerCase() === card.name.toLowerCase() ||
              city.name?.toLowerCase() === card.name.toLowerCase()
          );

          let count = card.totalProperties; // fallback to static value
          let priceRange = card.priceRange; // fallback to static value

          if (cityData) {
            // Try to get count from projectList if available
            if (cityData.projectList && Array.isArray(cityData.projectList)) {
              count = cityData.projectList.length;
              
              // Calculate price range from projectList
              const prices = cityData.projectList
                .map(p => getPricePerSqft(p))
                .filter(p => p !== null);
              const calculatedRange = formatPriceRange(prices);
              if (calculatedRange) {
                priceRange = calculatedRange;
              }
            } else if (cityData.totalProperties !== undefined) {
              count = cityData.totalProperties;
            } else if (cityData.projectCount !== undefined) {
              count = cityData.projectCount;
            } else {
              // Use the count from our project map
              const cityName = cityData.cityName || cityData.name;
              const normalizedName = cityName?.toLowerCase();
              const countByName = normalizedName ? cityProjectCountMap.get(normalizedName) : null;
              const countById = cityData.id ? cityProjectCountMap.get(`id_${cityData.id}`) : null;
              
              if (countByName !== null && countByName !== undefined) {
                count = countByName;
              } else if (countById !== null && countById !== undefined) {
                count = countById;
              }
              
              // Get price range from our price map
              const pricesByName = normalizedName ? cityPriceMap.get(normalizedName) : null;
              const pricesById = cityData.id ? cityPriceMap.get(`id_${cityData.id}`) : null;
              const prices = pricesByName || pricesById || [];
              const calculatedRange = formatPriceRange(prices);
              if (calculatedRange) {
                priceRange = calculatedRange;
              }
            }
          } else {
            // If city not found in API, try to match by name from project map
            const normalizedName = card.name.toLowerCase();
            const countFromMap = cityProjectCountMap.get(normalizedName);
            if (countFromMap !== null && countFromMap !== undefined) {
              count = countFromMap;
            }
            
            // Get price range from our price map
            const prices = cityPriceMap.get(normalizedName) || [];
            const calculatedRange = formatPriceRange(prices);
            if (calculatedRange) {
              priceRange = calculatedRange;
            }
          }

          const topProject = findTopProjectForCity(
            projectsArray,
            card.name,
          );
          const displayImageSrc = getProjectImageUrl(topProject);
          return {
            ...card,
            totalProperties: count,
            priceRange: priceRange,
            topProjectName: topProject?.projectName || null,
            displayImageSrc: displayImageSrc || null,
          };
        });

        setCityCards(updatedCards);
      } catch (error) {
        console.error("Error calculating city and project data:", error);
        // Keep static data on error
      }
  }, [cityList, projectList]);

  /**
   * Swiper loop needs enough slides (>= 2 * slidesPerView on desktop). Duplicate
   * the set so the loop is seamless and no blank space appears at the join.
   */
  const swiperSlides = useMemo(
    () => [...cityCards, ...cityCards],
    [cityCards],
  );

  const toggleFaq = (faqId) => {
    setOpenFaqId((prev) => (prev === faqId ? null : faqId));
  };

  return (
    <section className="container noida-projects-section">
      <div className="noida-projects-container">
        <div className="noida-projects-content">
          <div className="noida-projects-header">
            <h2 className="plus-jakarta-sans-semi-bold text-center my-5">
              Popular Real Estate Destinations
            </h2>
          </div>
          <div className="city-cards-slider-wrapper">
            <Swiper
              modules={[Autoplay]}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
                waitForTransition: false,
              }}
              loop={swiperSlides.length > 1}
              roundLengths
              watchSlidesProgress
              watchOverflow={false}
              centerInsufficientSlides={false}
              spaceBetween={8}
              speed={800}
              slidesPerView={3}
              breakpoints={{
                0: { slidesPerView: 1, spaceBetween: 8 },
                768: { slidesPerView: 2, spaceBetween: 8 },
                992: { slidesPerView: 3, spaceBetween: 8 },
              }}
              preventClicks
              preventClicksPropagation
              className="city-cards-swiper"
            >
              {swiperSlides.map((city, index) => (
                <SwiperSlide key={`${city.id}-${index}`}>
                  <CityCard city={city} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>

      <div className="destination-faq" id="home-faq">
        <div className="destination-faq__inner">
          <div className="destination-faq__left">
            <span className="destination-faq__tag">Trusted By</span>
            <h2 className="destination-faq__title">Frequently Asked Questions</h2>
          </div>

          <div className="destination-faq__right">
            <div
              className="destination-faq__scroll-area"
              role="region"
              aria-label="FAQ answers list"
            >
            {FAQ_ITEMS.map((item) => {
              const isOpen = openFaqId === item.id;
              return (
                <div
                  key={item.id}
                  className={`destination-faq__item ${isOpen ? "is-open" : ""}`}
                >
                  <h3 className="destination-faq__question">
                    <button
                      type="button"
                      className="destination-faq__question-btn"
                      onClick={() => toggleFaq(item.id)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${item.id}`}
                      id={`faq-trigger-${item.id}`}
                    >
                      <span className="destination-faq__question-text">
                        {item.question}
                      </span>
                      <span className="destination-faq__icon" aria-hidden="true">
                        {isOpen ? "-" : "+"}
                      </span>
                    </button>
                  </h3>
                  <div
                    id={`faq-panel-${item.id}`}
                    role="region"
                    aria-labelledby={`faq-trigger-${item.id}`}
                    className={`destination-faq__answer-wrap ${isOpen ? "is-open" : ""}`}
                  >
                    <div className="destination-faq__answer-inner">
                      <div className="destination-faq__answer">
                        <p>{item.answer}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          </div>

          <div className="destination-faq__contact">
            <p className="destination-faq__contact-title">Still have questions ?</p>
            <p className="destination-faq__contact-text">
              We&apos;re here to answer all your questions. Reach out today!
            </p>
            <Link
              href="/contact-us"
              className="destination-faq__mail-btn"
              aria-label="Open contact us page"
              target="_blank"
              rel="noopener noreferrer"
            >
              Send Mail
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// City Card Component
function CityCard({ city }) {
  const cityLabel = (city.name && String(city.name).trim()) || "City";
  const cityDestinationAlt = `${cityLabel} — popular real estate destination; projects for sale on My Property Fact`;
  const topPickAlt = city.topProjectName
    ? `${city.topProjectName} in ${cityLabel} — featured project on My Property Fact`
    : cityDestinationAlt;
  const heroImgDescription = topPickAlt;
  const iconNavigateTitle = `View ${cityLabel} real estate on My Property Fact (opens city page)`;
  const iconArrowTitle = `See all ${cityLabel} properties for sale (opens city page)`;
  const heroSrc = city.displayImageSrc || city.imageSrc;

  const cityLinkTitle = `Explore ${cityLabel} real estate, listings and price trends on My Property Fact`;

  return (
    <Link
      href={city.href}
      prefetch={false}
      className="city-card city-card-link"
      title={cityLinkTitle}
    >
      <div className="city-card-hero">
        <div className="city-card-hero__img">
          <img
            src={heroSrc}
            alt={heroImgDescription}
            title={heroImgDescription}
            className="city-card-hero__image"
            loading="lazy"
            decoding="async"
           style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}/>
        </div>
        <div className="city-card-hero__bar" aria-hidden="true" />
        <div className="city-card-hero__overlay">
          <div className="city-header-row">
            <h3 className="city-name city-name--on-image">{cityLabel}</h3>
            <span className="city-external-icon" aria-hidden="true">
              <img
                src="/icon/navigate.svg"
                alt={iconNavigateTitle}
                title={iconNavigateTitle}
                width={18}
                height={18}
                className="navigate-icon navigate-icon--on-image"
                aria-hidden
              />
            </span>
          </div>
        </div>
      </div>

      <div className="city-card-body">
        {city.topProjectName && (
          <p className="city-top-pick" title={city.topProjectName ?? undefined}>
            <span className="city-top-pick__label">Top project</span>
            <span className="city-top-pick__name">{city.topProjectName}</span>
          </p>
        )}

        <div className="city-price-range">
          <span className="price-text">{city.priceRange}</span>
        </div>

        <div className="city-properties-count">
          <span className="count-text">
            {city.totalProperties}{" "}
            {city.totalProperties === 1
              ? "Property for Sale"
              : "Properties for Sale"}
            <img
              src="/icon/arrow.svg"
              alt={iconArrowTitle}
              title={iconArrowTitle}
              width={16}
              height={16}
              className="count-arrow-icon"
              aria-hidden
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
