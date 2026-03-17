import Property from "./propertypage";
import {
  fetchAllProjects,
  fetchCityData,
  fetchProjectDetailsBySlug,
  isCityTypeUrl,
  isFloorTypeUrl,
} from "@/app/_global_components/masterFunction";
import MasterBHKProjectsPage from "@/app/_global_components/bhk-components/master-bhk-server-component";
import ProjectListByFloorType from "@/app/_global_components/floor-type/projectListByFloorType";
import NotFound from "@/app/not-found";
import NewFooterDesign from "@/app/(home)/components/footer/NewFooterDesign";
export const dynamic = "force-dynamic";

const NEW_PROJECTS_CITY_METADATA = {
  delhi: {
    title: "Best New Residential & Commercial Projects in Delhi | Smart Living",
    description:
      "Explore the best new residential and commercial projects in Delhi. Smart homes, luxury apartments, gated communities, and office spaces in prime zones with modern amenities.",
  },
  noida: {
    title: "Top New Projects in Noida | Metro-Connected Homes & Offices",
    description:
      "Discover top new projects in Noida with metro-connected apartments, villas, gated societies, and office spaces. Perfect blend of lifestyle, affordability, and connectivity.",
  },
  gurugram: {
    title:
      "Exclusive New Projects in Gurugram | Premium Flats & Business Spaces",
    description:
      "Exclusive new projects in Gurugram with premium flats, luxury apartments, gated communities, and business spaces. Located in prime sectors of the city’s leading hub.",
  },
  faridabad: {
    title:
      "Affordable New Projects in Faridabad | Villas, Apartments & Shops",
    description:
      "Affordable new projects in Faridabad featuring family homes, villas, apartments, and retail shops. Well-connected neighborhoods with modern amenities for comfortable living.",
  },
  ghaziabad: {
    title:
      "Top New Projects in Ghaziabad | Gated Homes & Commercial Hubs",
    description:
      "Top new projects in Ghaziabad offering gated societies, modern apartments, villas, and commercial hubs. Excellent transport links and lifestyle facilities for families and professionals.",
  },
  "greater-noida": {
    title:
      "Best New Projects in Greater Noida | Townships, Flats & Retail",
    description:
      "Best new projects in Greater Noida with affordable flats, luxury apartments, integrated townships, and retail spaces. Designed for smart living with world-class amenities.",
  },
  "noida-extension": {
    title:
      "Budget New Projects in Noida Extension | Smart Homes & Workspaces",
    description:
      "Budget-friendly new projects in Noida Extension offering smart apartments, gated homes, and office spaces. Great connectivity with modern lifestyle features and family-friendly options.",
  },
  sonipat: {
    title:
      "Emerging New Projects in Sonipat | Residential & Commercial Growth",
    description:
      "Emerging new projects in Sonipat with residential apartments, villas, and commercial developments. Growing neighborhoods with affordable housing and investment opportunities.",
  },
  bangalore: {
    title:
      "Top New Projects in Bangalore | IT Hub Apartments & Office Spaces",
    description:
      "Top new projects in Bangalore offering IT hub apartments, luxury villas, gated communities, and office spaces. Perfect for professionals seeking modern living and workspaces.",
  },
  bareilly: {
    title: "Affordable New Projects in Bareilly | Family Homes & Shops",
    description:
      "Affordable new projects in Bareilly with family-friendly housing, apartments, villas, and retail shops. Designed for modern living with excellent connectivity and amenities.",
  },
  chandigarh: {
    title:
      "Best New Projects in Chandigarh | Modern Apartments & Commercial Units",
    description:
      "Best new projects in Chandigarh featuring modern apartments, villas, gated communities, and commercial units. Located in green, well-planned zones for premium lifestyle.",
  },
  chennai: {
    title:
      "Premium New Projects in Chennai | Coastal Villas & Business Spaces",
    description:
      "Premium new projects in Chennai with coastal villas, urban apartments, gated societies, and business spaces. Perfect mix of modern living and investment opportunities.",
  },
  dehradun: {
    title:
      "Scenic New Projects in Dehradun | Hill-View Homes & Retail Projects",
    description:
      "Scenic new projects in Dehradun offering hill-view apartments, villas, gated communities, and retail projects. Peaceful surroundings with modern amenities for families.",
  },
  dwarka: {
    title:
      "Top New Projects in Dwarka | Metro-Linked Apartments & Offices",
    description:
      "Top new projects in Dwarka with metro-linked affordable apartments, gated communities, and office spaces. Prime sectors offering modern lifestyle and connectivity.",
  },
  goa: {
    title:
      "Exclusive New Projects in Goa | Beachside Villas & Commercial Spaces",
    description:
      "Exclusive new projects in Goa featuring beachside villas, luxury apartments, gated communities, and commercial spaces. Ideal for holiday homes and premium investments.",
  },
  hyderabad: {
    title:
      "Best New Projects in Hyderabad | Premium Flats & IT Hub Offices",
    description:
      "Best new projects in Hyderabad with premium flats, gated communities, and IT hub office spaces. Located in prime corridors with modern lifestyle amenities.",
  },
  indore: {
    title:
      "Affordable New Projects in Indore | Luxury Homes & Commercial Spaces",
    description:
      "Affordable new projects in Indore offering luxury homes, apartments, gated societies, and commercial spaces. Designed for modern living with excellent facilities.",
  },
  jaipur: {
    title:
      "Top New Projects in Jaipur | Heritage Homes & Modern Business Spaces",
    description:
      "Top new projects in Jaipur blending heritage charm with modern apartments, villas, gated communities, and business spaces. Perfect for lifestyle and investment.",
  },
  kochi: {
    title:
      "Waterfront New Projects in Kochi | Apartments, Villas & Offices",
    description:
      "Waterfront new projects in Kochi with premium apartments, villas, gated communities, and office spaces. Located near prime coastal areas with modern amenities.",
  },
  lucknow: {
    title:
      "Best New Projects in Lucknow | Affordable Flats & Commercial Hubs",
    description:
      "Best new projects in Lucknow featuring affordable flats, luxury apartments, gated communities, and commercial hubs. Perfect for families and professionals.",
  },
  ludhiana: {
    title: "Modern New Projects in Ludhiana | Apartments & Business Spaces",
    description:
      "Modern new projects in Ludhiana offering apartments, villas, gated societies, and commercial spaces. Prime city locations with lifestyle and investment benefits.",
  },
  mohali: {
    title:
      "Premium New Projects in Mohali | Top Apartments & Commercial Units",
    description:
      "Premium new projects in Mohali with top apartments, villas, gated communities, and commercial units. Growing residential hubs with modern amenities.",
  },
  mumbai: {
    title:
      "Exclusive New Projects in Mumbai | Sea-View Homes & Office Towers",
    description:
      "Exclusive new projects in Mumbai featuring sea-view luxury apartments, premium homes, gated communities, and office towers in prime city locations.",
  },
  pune: {
    title:
      "Best New Projects in Pune | IT Hub Flats & Commercial Spaces",
    description:
      "Best new projects in Pune with IT hub flats, family homes, gated communities, and commercial spaces. Perfect mix of modern lifestyle and connectivity.",
  },
  rohini: {
    title:
      "Affordable New Projects in Rohini | Metro-Connected Homes & Shops",
    description:
      "Affordable new projects in Rohini offering metro-connected apartments, gated homes, and retail shops. Designed for modern living with excellent connectivity.",
  },
  thiruvananthapuram: {
    title:
      "Coastal New Projects in Thiruvananthapuram | Villas & Commercial Spaces",
    description:
      "Coastal new projects in Thiruvananthapuram featuring villas, apartments, gated communities, and commercial spaces. Modern amenities with scenic surroundings.",
  },
};

const APARTMENTS_CITY_METADATA = {
  delhi: {
    title: "Best Apartments in Delhi | Luxury & Affordable Flats",
    description:
      "Explore the best apartments in Delhi with smart homes, luxury flats, gated communities, and affordable housing options in prime city zones.",
  },
  noida: {
    title: "Top Apartments in Noida | Metro-Connected Modern Living",
    description:
      "Discover top apartments in Noida offering metro-connected flats, villas, and gated societies with modern amenities and excellent connectivity.",
  },
  gurugram: {
    title: "Exclusive Apartments in Gurugram | Premium Flats & Villas",
    description:
      "Browse exclusive apartments in Gurugram with luxury flats, premium villas, and gated communities located in prime residential sectors.",
  },
  faridabad: {
    title: "Affordable Apartments in Faridabad | Family Homes & Villas",
    description:
      "Find affordable apartments in Faridabad featuring family homes, villas, and gated societies with modern amenities and great connectivity.",
  },
  ghaziabad: {
    title: "Top Apartments in Ghaziabad | Gated Societies & Flats",
    description:
      "Explore top apartments in Ghaziabad with modern flats, gated communities, and family-friendly housing near excellent transport links.",
  },
  "greater-noida": {
    title: "Best Apartments in Greater Noida | Flats & Townships",
    description:
      "Discover the best apartments in Greater Noida with affordable flats, luxury homes, integrated townships, and modern lifestyle amenities.",
  },
  "noida-extension": {
    title: "Budget Apartments in Noida Extension | Smart Flats",
    description:
      "Explore budget apartments in Noida Extension offering smart flats, gated homes, and modern amenities with excellent connectivity.",
  },
  sonipat: {
    title: "Emerging Apartments in Sonipat | Affordable Flats & Villas",
    description:
      "Find emerging apartments in Sonipat with affordable flats, villas, and gated communities in growing residential neighborhoods.",
  },
  agra: {
    title: "Affordable Apartments in Agra | Flats & Villas",
    description:
      "Explore affordable apartments in Agra with modern flats, villas, and gated communities near prime cultural and residential hubs.",
  },
  bangalore: {
    title: "Top Apartments in Bangalore | IT Hub Luxury Flats",
    description:
      "Discover top apartments in Bangalore offering luxury flats, villas, and gated communities near prime IT corridors and tech hubs.",
  },
  bareilly: {
    title: "Affordable Apartments in Bareilly | Family Housing",
    description:
      "Find affordable apartments in Bareilly with family-friendly flats, villas, and gated communities designed for modern living.",
  },
  chandigarh: {
    title: "Best Apartments in Chandigarh | Modern Flats & Villas",
    description:
      "Explore the best apartments in Chandigarh featuring modern flats, villas, and gated communities in green and well-planned zones.",
  },
  chennai: {
    title: "Premium Apartments in Chennai | Coastal Living",
    description:
      "Discover premium apartments in Chennai with coastal flats, villas, and gated societies offering modern lifestyle and investment value.",
  },
  dehradun: {
    title: "Scenic Apartments in Dehradun | Hill-View Flats",
    description:
      "Explore scenic apartments in Dehradun with hill-view flats, villas, and gated communities in peaceful surroundings.",
  },
  dwarka: {
    title: "Top Apartments in Dwarka | Metro-Linked Flats",
    description:
      "Find top apartments in Dwarka with metro-linked flats, gated communities, and affordable housing in prime city sectors.",
  },
  goa: {
    title: "Exclusive Apartments in Goa | Beachside Living",
    description:
      "Discover exclusive apartments in Goa featuring beachside flats, villas, and gated communities ideal for holiday homes and investments.",
  },
  hyderabad: {
    title: "Best Apartments in Hyderabad | Premium Flats",
    description:
      "Explore the best apartments in Hyderabad with premium flats, gated communities, and modern homes near IT hub corridors.",
  },
  indore: {
    title: "Affordable Apartments in Indore | Luxury Flats",
    description:
      "Find affordable apartments in Indore offering luxury flats, villas, and gated communities with modern amenities.",
  },
  jaipur: {
    title: "Top Apartments in Jaipur | Heritage & Modern Living",
    description:
      "Discover top apartments in Jaipur blending heritage charm with modern flats, villas, and gated communities.",
  },
  kochi: {
    title: "Waterfront Apartments in Kochi | Flats & Villas",
    description:
      "Explore waterfront apartments in Kochi with premium flats, villas, and gated communities near prime coastal areas.",
  },
  lucknow: {
    title: "Best Apartments in Lucknow | Affordable Flats",
    description:
      "Find the best apartments in Lucknow featuring affordable flats, luxury homes, and gated communities with modern amenities.",
  },
  ludhiana: {
    title: "Modern Apartments in Ludhiana | Flats & Villas",
    description:
      "Explore modern apartments in Ludhiana offering flats, villas, and gated communities in prime city locations.",
  },
  mohali: {
    title: "Premium Apartments in Mohali | Top Flats",
    description:
      "Discover premium apartments in Mohali with top flats, villas, and gated communities in growing residential hubs.",
  },
  mumbai: {
    title: "Exclusive Apartments in Mumbai | Sea-View Flats",
    description:
      "Explore exclusive apartments in Mumbai featuring sea-view flats, luxury homes, and gated communities in prime city areas.",
  },
  pune: {
    title: "Best Apartments in Pune | IT Hub Flats",
    description:
      "Find the best apartments in Pune with IT hub flats, family homes, and gated communities offering modern lifestyle.",
  },
  rohini: {
    title: "Affordable Apartments in Rohini | Metro-Connected Flats",
    description:
      "Discover affordable apartments in Rohini with metro-connected flats, gated homes, and retail shops in prime locations.",
  },
  thiruvananthapuram: {
    title: "Coastal Apartments in Thiruvananthapuram | Villas & Flats",
    description:
      "Explore coastal apartments in Thiruvananthapuram featuring villas, flats, and gated communities with modern amenities.",
  },
  vrindavan: {
    title: "Affordable Apartments in Vrindavan | Flats & Villas",
    description:
      "Find affordable apartments in Vrindavan with modern flats, villas, and gated communities near prime spiritual and residential hubs.",
  },
};

const COMMERCIAL_PROPERTY_CITY_METADATA = {
  delhi: {
    title: "Commercial Property in Delhi: Secrets Investors Can't Ignore in 2026",
    description:
      "Unlock the hottest commercial property in Delhi - premium offices, retail hotspots & sky-high ROI in prime NCR hubs. Don't miss these game-changing deals before they're gone!",
  },
  noida: {
    title: "Commercial Property in Noida: Smart Investors Are Buying NOW",
    description:
      "Dive into top commercial property in Noida - modern offices, booming retail & massive returns in exploding business zones. Grab these high-growth opportunities today!",
  },
  gurugram: {
    title: "Commercial Property in Gurugram: 2026's Highest ROI Goldmines",
    description:
      "Gurugram commercial property secrets revealed - luxury offices, prime retail & insane returns in corporate epicenters. Investors are rushing in - secure yours fast!",
  },
  faridabad: {
    title: "Hidden Commercial Property in Faridabad Deals You NEED to See",
    description:
      "Unearth affordable commercial property in Faridabad - offices, shops & undervalued gems in fast-rising zones. These hidden winners deliver big profits - act now!",
  },
  ghaziabad: {
    title: "Commercial Property in Ghaziabad: Top Picks for Explosive Growth",
    description:
      "Best commercial property in Ghaziabad - sleek offices, retail spots & strong NCR links for smart gains. Connectivity + potential = massive upside. Invest before prices soar!",
  },
  "greater-noida": {
    title:
      "Commercial Property in Greater Noida: The 2026 Breakthrough Revealed",
    description:
      "Explore unbeatable commercial property in Greater Noida - IT-focused offices, retail & high-ROI projects in booming zones. This is where smart money is flowing right now!",
  },
  "noida-extension": {
    title:
      "Commercial Property in Noida Extension: Why Everyone's Buying in 2026",
    description:
      "Investors can't stop snapping up commercial property in Noida Extension - retail, offices & emerging hubs with huge upside. Emerging hotspot = your next big win. Don't wait!",
  },
  sonipat: {
    title:
      "Commercial Property in Sonipat: The Fastest-Growing Market Explosion",
    description:
      "Sonipat commercial property is on fire - offices, retail & investment gems in rising districts. Get in early for explosive returns before the rush hits peak!",
  },
  bangalore: {
    title: "Commercial Property in Bangalore: What Top Investors Are Grabbing",
    description:
      "Prime commercial property in Bangalore near IT corridors - luxury offices, retail & unbeatable long-term gains. This is the hotspot investors love - join the winners now!",
  },
  chandigarh: {
    title:
      "Commercial Property in Chandigarh: Elite Spots for Serious Profits",
    description:
      "Discover premium commercial property in Chandigarh - offices, shops & high-value deals in prime sectors. Perfect for business growth & strong ROI. Claim yours today!",
  },
  dwarka: {
    title:
      "Commercial Property in Dwarka: Metro-Linked Investments You Can't Miss",
    description:
      "Best commercial property in Dwarka Delhi - offices, retail & profit machines with unbeatable metro access. Prime location + growth = your smartest move in 2026!",
  },
  goa: {
    title: "Commercial Property in Goa: Double Your ROI in Tourist Hotspots",
    description:
      "Goa commercial property that screams profits - retail, offices & hospitality gems in high-traffic tourist zones. Watch your investment explode - secure prime spots now!",
  },
  hyderabad: {
    title:
      "Commercial Property in Hyderabad: What Savvy Investors Are Targeting",
    description:
      "Hyderabad commercial property hot picks - IT park offices, retail & stellar returns in booming tech scene. Investors are eyeing these - don't get left behind!",
  },
  indore: {
    title:
      "Commercial Property in Indore: Today's Hottest Undervalued Deals",
    description:
      "Top commercial property in Indore - offices, retail & emerging business winners with massive potential. Affordable entry, huge upside - grab these deals before they vanish!",
  },
  jaipur: {
    title: "Commercial Property in Jaipur: Sky-High ROI Waiting to Explode",
    description:
      "Jaipur commercial property gems - offices, shops & fast-growing zones packed with profit power. High ROI potential in royal city expansion - invest smart today!",
  },
  lucknow: {
    title: "Commercial Property in Lucknow: Investor Favorites for 2026",
    description:
      "Unlock best commercial property in Lucknow - prime offices, retail & high-return spots in key business areas. Strong demand + growth = perfect timing to buy now!",
  },
  ludhiana: {
    title: "Commercial Property in Ludhiana: Ultimate Business Power Plays",
    description:
      "Ludhiana commercial property standouts - retail, offices & industrial-linked investments in core zones. High-potential deals investors love - jump in for big wins!",
  },
  mohali: {
    title: "Commercial Property in Mohali: What Buyers Are Snapping Up Fast",
    description:
      "Mohali commercial property near Chandigarh hubs - offices, retail & profitable projects with strong connectivity. Investors are moving quick - get your piece now!",
  },
  mumbai: {
    title: "Commercial Property in Mumbai: ROI Boosters You Have to See",
    description:
      "Mumbai commercial property elite - premium offices, retail & top-location high-value plays. Maximum returns in India's financial capital - don't miss these winners!",
  },
  pune: {
    title: "Commercial Property in Pune: Hottest IT-Park Deals of 2026",
    description:
      "Pune's sizzling commercial property near IT parks - offices, shops & explosive investment potential in thriving areas. This is where fortunes are made - act fast!",
  },
  rohini: {
    title: "Commercial Property in Rohini: Prime Delhi Business Winners",
    description:
      "Top commercial property in Rohini Delhi - retail shops, offices & high-traffic investment hotspots. Prime areas + strong returns = unbeatable opportunity. Secure it today!",
  },
};

const FLATS_CITY_METADATA = {
  delhi: {
    title: "Flats in Delhi for Sale | 2, 3, 4, 5 BHK Luxury Apartments",
    description:
      "Explore flats in Delhi with 2, 3, 4 & 5 BHK options in prime locations. Compare prices, amenities, and connectivity across luxury and affordable residential projects.",
  },
  noida: {
    title: "Flats in Noida | 2, 3 & 4 BHK Apartments for Sale",
    description:
      "Discover flats in Noida with modern 2, 3 & 4 BHK apartments. Compare new launch and ready-to-move projects with top amenities and great connectivity.",
  },
  gurugram: {
    title: "Flats in Gurugram | Luxury 3, 4 & 5 BHK Apartments",
    description:
      "Find premium flats in Gurugram offering spacious 3, 4 & 5 BHK apartments. Explore modern projects with luxury amenities, smart layouts, and prime locations.",
  },
  faridabad: {
    title: "Flats in Faridabad | Affordable 2 & 3 BHK Apartments",
    description:
      "Search flats in Faridabad with affordable 2 & 3 BHK apartments. Explore modern residential projects offering great amenities and excellent Delhi NCR connectivity.",
  },
  ghaziabad: {
    title: "Flats in Ghaziabad | 2, 3 & 4 BHK Apartments for Sale",
    description:
      "Browse flats in Ghaziabad featuring 2, 3 & 4 BHK apartments with modern amenities, spacious layouts, and easy connectivity to Delhi and Noida.",
  },
  "greater-noida": {
    title: "Flats in Greater Noida | 2, 3 & 4 BHK Modern Apartments",
    description:
      "Discover flats in Greater Noida with 2, 3 & 4 BHK options. Explore green surroundings, smart infrastructure, and affordable housing projects.",
  },
  "noida-extension": {
    title: "Flats in Noida Extension | Affordable 2 & 3 BHK Homes",
    description:
      "Explore flats in Noida Extension offering budget-friendly 2 & 3 BHK apartments. Compare new projects, amenities, and connectivity across Greater Noida West.",
  },
  sonipat: {
    title: "Flats in Sonipat | 2 & 3 BHK Residential Apartments",
    description:
      "Discover flats in Sonipat with modern 2 & 3 BHK apartments. Ideal for homebuyers seeking affordable housing and fast connectivity to Delhi NCR.",
  },
  agra: {
    title: "Flats in Agra | 2, 3 & 4 BHK Apartments for Sale",
    description:
      "Find flats in Agra with 2, 3 & 4 BHK modern apartments in prime locations. Explore residential projects with amenities and excellent infrastructure.",
  },
  bangalore: {
    title: "Flats in Bangalore | Luxury 2, 3, 4 BHK Apartments",
    description:
      "Explore flats in Bangalore near IT hubs with 2, 3 & 4 BHK apartments. Discover premium projects, smart amenities, and high investment potential.",
  },
  bareilly: {
    title: "Flats in Bareilly | 2 & 3 BHK Affordable Apartments",
    description:
      "Search flats in Bareilly offering 2 & 3 BHK apartments with modern amenities. Compare residential projects in prime areas with affordable prices.",
  },
  chandigarh: {
    title: "Flats in Chandigarh | 2, 3 & 4 BHK Premium Homes",
    description:
      "Discover flats in Chandigarh with well-planned 2, 3 & 4 BHK apartments. Explore premium residential sectors with modern infrastructure.",
  },
  chennai: {
    title: "Flats in Chennai | 2, 3 & 4 BHK Apartments for Sale",
    description:
      "Explore flats in Chennai from top builders featuring 2, 3 & 4 BHK apartments. Find homes with excellent connectivity and modern amenities.",
  },
  dehradun: {
    title: "Flats in Dehradun | 2, 3 & 4 BHK Nature View Homes",
    description:
      "Find flats in Dehradun surrounded by greenery with 2, 3 & 4 BHK apartments. Enjoy peaceful living and modern residential projects.",
  },
  dwarka: {
    title: "Flats in Dwarka Delhi | 2, 3 & 4 BHK Apartments",
    description:
      "Search flats in Dwarka Delhi offering 2, 3 & 4 BHK apartments near metro connectivity. Discover modern homes in prime residential sectors.",
  },
  goa: {
    title: "Flats in Goa | Luxury 2, 3 & 4 BHK Beachside Homes",
    description:
      "Discover flats in Goa with 2, 3 & 4 BHK beachside apartments. Perfect for holiday homes, investment, and luxury coastal living.",
  },
  hyderabad: {
    title: "Flats in Hyderabad | 2, 3, 4 BHK Apartments Near IT",
    description:
      "Explore flats in Hyderabad with 2, 3 & 4 BHK apartments near IT hubs. Compare new projects, modern amenities, and investment opportunities.",
  },
  indore: {
    title: "Flats in Indore | 2 & 3 BHK Affordable Apartments",
    description:
      "Discover flats in Indore offering 2 & 3 BHK apartments with modern amenities. Explore affordable residential projects in top locations.",
  },
  jaipur: {
    title: "Flats in Jaipur | 2, 3 & 4 BHK Apartments for Sale",
    description:
      "Find flats in Jaipur with 2, 3 & 4 BHK apartments in prime locations. Explore modern housing projects with premium facilities.",
  },
  kochi: {
    title: "Flats in Kochi | 2, 3 & 4 BHK Waterfront Apartments",
    description:
      "Explore flats in Kochi with scenic waterfront views and 2, 3 & 4 BHK apartments. Discover modern homes with premium amenities.",
  },
  lucknow: {
    title: "Flats in Lucknow | 2, 3 & 4 BHK Apartments for Sale",
    description:
      "Discover flats in Lucknow with spacious 2, 3 & 4 BHK apartments. Compare modern residential projects with affordable pricing.",
  },
  ludhiana: {
    title: "Flats in Ludhiana | 2, 3 & 4 BHK Residential Flats",
    description:
      "Find flats in Ludhiana with 2, 3 & 4 BHK apartments featuring modern layouts, amenities, and prime residential locations.",
  },
  mohali: {
    title: "Flats in Mohali | 2, 3 & 4 BHK Apartments Near Chandigarh",
    description:
      "Explore flats in Mohali offering 2, 3 & 4 BHK apartments near Chandigarh. Discover premium housing with modern infrastructure.",
  },
  mumbai: {
    title: "Flats in Mumbai | Luxury 2, 3, 4 & 5 BHK Apartments",
    description:
      "Find flats in Mumbai with luxury 2, 3, 4 & 5 BHK apartments. Explore premium projects with top amenities and prime city locations.",
  },
  pune: {
    title: "Flats in Pune | 2, 3 & 4 BHK Apartments Near IT Parks",
    description:
      "Discover flats in Pune featuring 2, 3 & 4 BHK apartments near IT hubs. Compare residential projects with modern amenities.",
  },
  rohini: {
    title: "Flats in Rohini Delhi | 2, 3 & 4 BHK Apartments",
    description:
      "Search flats in Rohini Delhi offering 2, 3 & 4 BHK apartments. Explore residential projects with modern amenities and great connectivity.",
  },
  thiruvananthapuram: {
    title: "Flats in Thiruvananthapuram | 2, 3 & 4 BHK Apartments",
    description:
      "Discover flats in Thiruvananthapuram with 2, 3 & 4 BHK apartments. Explore modern homes in scenic and well-connected locations.",
  },
  vrindavan: {
    title: "Flats in Vrindavan | 1, 2 & 3 BHK Spiritual Living Homes",
    description:
      "Find flats in Vrindavan ideal for peaceful and spiritual living. Explore 1, 2 & 3 BHK apartments near temples and holy places.",
  },
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const response = await fetchProjectDetailsBySlug(slug);
  if (!(response.slugURL === slug)) {
    if (slug.startsWith("flats-in-")) {
      const citySlug = slug.replace("flats-in-", "");
      const cityMeta = FLATS_CITY_METADATA[citySlug];
      if (cityMeta) {
        return {
          title: cityMeta.title,
          description: cityMeta.description,
          alternates: {
            canonical: `/${slug}`,
          },
        };
      }
    }
    if (slug.startsWith("commercial-property-in-")) {
      const citySlug = slug.replace("commercial-property-in-", "");
      const cityMeta = COMMERCIAL_PROPERTY_CITY_METADATA[citySlug];
      if (cityMeta) {
        return {
          title: cityMeta.title,
          description: cityMeta.description,
          alternates: {
            canonical: `/${slug}`,
          },
        };
      }
    }
    if (slug.startsWith("apartments-in-")) {
      const citySlug = slug.replace("apartments-in-", "");
      const cityMeta = APARTMENTS_CITY_METADATA[citySlug];
      if (cityMeta) {
        return {
          title: cityMeta.title,
          description: cityMeta.description,
          alternates: {
            canonical: `/${slug}`,
          },
        };
      }
    }
    if (slug.startsWith("new-projects-in-")) {
      const citySlug = slug.replace("new-projects-in-", "");
      const cityMeta = NEW_PROJECTS_CITY_METADATA[citySlug];
      if (cityMeta) {
        return {
          title: cityMeta.title,
          description: cityMeta.description,
          alternates: {
            canonical: `/${slug}`,
          },
        };
      }
    }
    // Case 1: Master BHK listing page
    return {
      title:
        slug.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()) +
        " Flats in India",
      description:
        "Browse apartments, villas, and plots categorized by BHK type. Get detailed price lists, floor plans, and location maps.",
      keywords: [
        slug.replace(/-/g, " ") + " flats",
        "apartments",
        "villas",
        "plots",
        "BHK flats in India",
      ],
      alternates: {
        canonical: `/${slug}`,
      },
    };
  }

  if (!response.projectAddress) {
    response.projectAddress = "";
  }
  return {
    title:
      response.metaTitle +
      " " +
      response.projectAddress +
      " | Price List & Brochure, Floor Plan, Location Map & Reviews",
    description: response.metaDescription,
    keywords: response.metaKeyword,
    alternates: {
      canonical: `/${slug}`,
    },
  };
}

export default async function PropertyPage({ params }) {
  const { slug } = await params;
  const [cityList, projectDetail, featuredProjects] = await Promise.all([
    fetchCityData(),
    fetchProjectDetailsBySlug(slug),
    fetchAllProjects(),
  ]);
  const isFloorTypeSlug = await isFloorTypeUrl(slug);
  const isProjectSlug = projectDetail.slugURL === slug;
  const isCitySlug = await isCityTypeUrl(slug);

  const projectCity = projectDetail.city || projectDetail.cityName;
  const similarProject = featuredProjects.filter(
    (item) =>
      item.cityName === projectDetail.city &&
      item.propertyTypeName === projectDetail.propertyTypeName &&
      item.id !== projectDetail.id,
  );
  
  if (isCitySlug) {
    return <MasterBHKProjectsPage slug={slug} cityList={cityList} />;
  } else if (isFloorTypeSlug) {
    {
      return <ProjectListByFloorType slug={slug} cityList={cityList} />;
    }
  } else if (isProjectSlug) {
    return (
      <>
        <Property projectDetail={projectDetail} similarProjects={similarProject} />
        <NewFooterDesign cityList={cityList} compactTop={true} />
      </>
    );
  } else {
    return <NotFound />;
  }
}
