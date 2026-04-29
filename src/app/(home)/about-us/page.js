import CommonBreadCrum from "../components/common/breadcrum";
import CommonHeaderBanner from "../components/common/commonheaderbanner";
import AboutUs from "./aboutUs";
import NewAboutUs from "./NewAboutUs";
import {
  getAllProjects,
  fetchBuilderData,
  fetchCityData,
} from "@/app/_global_components/masterFunction";

export const metadata = {
  title: "About Us | MyPropertyFact – Real Estate Price Trends & Insights",
  description: "Discover the story behind MyPropertyFact – your trusted source for accurate real estate price trends, market insights, and property data across major Indian cities.",
  alternates: {
    canonical: "/about-us",
  },
};

export default async function AboutUsPage() {
  //Defining what we offer array
  const whatWeOffer = [
    {
      id: 1,
      heading: "Verified Project Insights",
      text: "We provide verified project details backed by data, on-ground checks, and expert validation. From RERA updates to construction progress, we ensure every buyer gets trustworthy, current information."
    },
    {
      id: 2,
      heading: "Smart Financial Tools",
      text: "From EMI calculators to affordability scores, our financial tools help buyers plan confidently. Understand budgets, compare loan options, and make informed investment decisions in minutes."
    },
    {
      id: 3,
      heading: "Neighbourhood Intelligence",
      text: "We break down every micro-market with clarity, schools, hospitals, connectivity, safety, and future growth corridors, so you know exactly what living there feels like before you decide."
    },
    {
      id: 4,
      heading: "Transparent Developer Ratings",
      text: "A builder’s track record matters. We compile delivery history, customer satisfaction, legal compliance, and past performance into clean, easy-to-read ratings that empower better choices."
    },
    {
      id: 5,
      heading: "Personalised Recommendations",
      text: "Our system studies your needs, budget, location, lifestyle, investment goals, and suggests properties that fit you perfectly. No noise. Only what matters."
    },
  ];

  //Our commitment object
  const ourCommitment = {
    heading: "Our Commitment",
    text: "We’re committed to transparency, innovation, and reliability. By harnessing the power of technology and a dedicated support team, we aim to make the entire real estate journey from initial search to final closing as smooth and rewarding as possible."
  };

  const [projects, buildersRes, cities] = await Promise.all([
    getAllProjects(),
    fetchBuilderData(),
    fetchCityData(),
  ]);
  const buildersList = buildersRes?.builders ?? buildersRes?.data ?? [];
  const platformStats = {
    cities: Array.isArray(cities) ? cities.length : 0,
    builders: Array.isArray(buildersList) ? buildersList.length : 0,
    projects: Array.isArray(projects) ? projects.length : 0,
  };

  //Defining why my property fact array
  const whyMyPropertyFact = [
    {
      id: 1,
      heading: "Holistic Platform",
      text: "Find everything from residential rentals to large-scale commercial investments in one place."
    },
    {
      id: 2,
      heading: "Streamlined Searches",
      text: "Use our intuitive Search and View features to quickly locate the best matches for your requirements."
    },
    {
      id: 3,
      heading: "No Guesswork",
      text: "Our side-by-side comparison feature and detailed project listings remove confusion from the decision-making process."
    },
    {
      id: 4,
      heading: "Trusted Connections",
      text: "We link you directly to builders, brokers, and fellow investors—fostering real conversations and genuine opportunities."
    },
    {
      id: 5,
      heading: "Continuous Growth",
      text: "My Property Fact constantly expands its listings and features so users always have the latest offerings at their fingertips."
    },
  ];

  return (
    <main id="primary-content" aria-labelledby="mpf-page-heading">
      <CommonHeaderBanner 
      // image={"about-us.jpg"} 
      headerText={"About Us"} 
      // firstPage={"About Us"}
      pageName={"About Us"}
      />
      {/* <CommonBreadCrum pageName={"About Us"} /> */}
      {/* <AboutUs
        whyMyPropertyFact={whyMyPropertyFact}
        whatWeOffer={whatWeOffer}
        ourCommitment={ourCommitment}
      /> */}
      <NewAboutUs platformStats={platformStats} />
    </main>
  );
}
