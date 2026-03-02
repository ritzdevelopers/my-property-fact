"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "./NoidaProjectsSection.css";

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

export default function NoidaProjectsSection() {
  const [cityCards, setCityCards] = useState(CITY_CARDS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCityDataAndProjects = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
          setLoading(false);
          return;
        }

        // Fetch cities and projects in parallel
        const [citiesResponse, projectsResponse] = await Promise.all([
          fetch(`${apiUrl}city/all`),
          fetch(`${apiUrl}projects`),
        ]);

        if (!citiesResponse.ok || !projectsResponse.ok) {
          setLoading(false);
          return;
        }

        const cities = await citiesResponse.json();
        const projects = await projectsResponse.json();
        
        const cityArray = Array.isArray(cities) ? cities : [];
        const projectsArray = Array.isArray(projects) ? projects : [];

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

          return {
            ...card,
            totalProperties: count,
            priceRange: priceRange,
          };
        });

        setCityCards(updatedCards);
      } catch (error) {
        console.error("Error fetching city and project data:", error);
        // Keep static data on error
      } finally {
        setLoading(false);
      }
    };

    fetchCityDataAndProjects();
  }, []);

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
              loop={cityCards.length > 1}
              loopedSlides={cityCards.length}
              watchOverflow={false}
              centerInsufficientSlides={false}
              spaceBetween={8}
              slidesPerView={3}
              breakpoints={{
                0: { slidesPerView: 1, spaceBetween: 8 },
                768: { slidesPerView: 2, spaceBetween: 8 },
                992: { slidesPerView: 3, spaceBetween: 8 },
              }}
              // watchOverflow={true}
              preventClicks={true}
              preventClicksPropagation={true}
              className="city-cards-swiper"
            >
              {cityCards.map((city) => (
                <SwiperSlide key={city.id}>
                  <CityCard
                    city={city}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
}

// City Card Component
function CityCard({ city }) {
  return (
    <Link 
      href={city.href}
      className="city-card city-card-link"
    >
      {/* City Header */}
      <div className="city-card-header">
        <div className="city-header-row">
          <h3 className="city-name">{city.name}</h3>
          <span className="city-external-icon" aria-hidden="true">
            <Image
              src="/icon/navigate.svg"
              alt=""
              width={18}
              height={18}
              className="navigate-icon"
            />
          </span>
        </div>
      </div>

      {/* Price Range */}
      <div className="city-price-range">
        <span className="price-text">{city.priceRange}</span>
      </div>

      {/* Total Properties Count */}
      <div className="city-properties-count">
        <span className="count-text">
          {city.totalProperties}{" "}
          {city.totalProperties === 1 ? "Property for Sale" : "Properties for Sale"}
          <Image
            src="/icon/arrow.svg"
            alt=""
            width={16}
            height={16}
            className="count-arrow-icon"
          />
        </span>
      </div>

      {/* Static City Image */}
      <div className="city-projects-slider-container">
        <div className="project-image-wrapper">
          <Image
            src={city.imageSrc}
            alt={city.name}
            fill
            className="project-slider-image"
            unoptimized
          />
        </div>
      </div>
    </Link>
  );
}
