import Home from "@/components/Home";
import Section2 from "@/components/Section2";
import Section3 from "@/components/Section3";
import Section4 from "@/components/Section4";
import Section5 from "@/components/Section5";
import Section6 from "@/components/Section6"; 
import Section8 from "@/components/Section8";
import Section9 from "@/components/Section9";
import Section10 from "@/components/Section10";
import Footer from "@/components/Footer";
import FloatingEnquiryButton from "@/components/FloatingEnquiryButton";
import LeadPopup from "@/components/LeadPopup";
import Navbar from "@/components/Navbar";

function Page() {
  return (
    <>
      <LeadPopup />
      <FloatingEnquiryButton />
      <Navbar />
      <Home />
      <Section2 />
      <Section3 />
      <Section4 />
      <Section5 />
      <Section6 />
      <Section8 />
      <Section9 />
      <Section10 />
      <Footer />
    </>
  );
}

export default Page;