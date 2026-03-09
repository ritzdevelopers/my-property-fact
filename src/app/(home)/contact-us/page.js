import CommonHeaderBanner from "../components/common/commonheaderbanner";
import NewContactUs from "./NewContactUs";

export default function ContactUsPage() {
  return (
    <>
      <CommonHeaderBanner
        image={"contact-banner.jpg"}
        headerText={"Contact Us"}
        pageName={"Contact Us"}
      />
      {/* <CommonBreadCrum pageName={"Contact-us"} /> */}
      <NewContactUs />
    </>
  );
}
