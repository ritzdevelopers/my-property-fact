import CommonHeaderBanner from "../components/common/commonheaderbanner";
import NewContactUs from "./NewContactUs";

export default function ContactUsPage() {
  return (
    <main id="primary-content" aria-labelledby="mpf-page-heading">
      <CommonHeaderBanner
        image={"contact-banner.jpg"}
        headerText={"Contact Us"}
        pageName={"Contact Us"}
      />
      {/* <CommonBreadCrum pageName={"Contact-us"} /> */}
      <NewContactUs />
    </main>
  );
}
