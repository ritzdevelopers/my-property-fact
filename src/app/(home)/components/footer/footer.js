"use client";
import {
  faInstagram,
  faLinkedin,
  faTwitter,
  faXTwitter,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./footer.css";
import Link from "next/link";
import Image from "next/image";
import CityList from "../common/citylistcard";

export default function Footer({ cityList = [], projectTypes = [] }) {
  // Defining footer media array
  const mediaArr = [
    {
      id: 2,
      name: "Blog",
      slugUrl: "/blog",
    },
    {
      id: 3,
      name: "Web Stories",
      slugUrl: "/web-stories",
    },
  ];

  //Defining company array
  const companyArr = [
    {
      id: 1,
      name: "About MPF",
      slugUrl: "/about-us",
    },
    {
      id: 3,
      name: "Contact Us",
      slugUrl: "/contact-us",
    },
    {
      id: 5,
      name: "Join Our Team",
      slugUrl: "/join-our-team",
    },
  ];
  //Defining Explore array
  const exploreArr = [
    {
      id: 1,
      name: "Careers",
      slugUrl: "/",
    },
    {
      id: 2,
      name: "Contact us",
      slugUrl: "/contact-us",
    },
    {
      id: 3,
      name: "Buyer guide",
      slugUrl: "/",
    },
    {
      id: 4,
      name: "Term & conditions",
      slugUrl: "/",
    },
    {
      id: 5,
      name: "Sitemap",
      slugUrl: "/",
    },
  ];

  return (
    <footer className="plus-jakarta-sans-regular footer-bg">
      <div className="container">
        <div className="container-fluid pt-5">
          <div className="inner">
            <div className="row gap-row">
              <div className="col-md-12 col-sm-12 p-3 px-3 px-md-0 foot-menu">
                <div className="insideBox">
                  <p className="text-white">Popular cities</p>
                  <ul className="d-flex flex-wrap list-unstyled gap-2">
                    {cityList.map((item, index) => (
                      <li key={`${item.cityName}-${index}`}>
                        <Link
                          className="footer-text text-decoration-none"
                          href={`/city/${item.slugURL}`}
                          prefetch={false}
                          title={`${item.cityName} properties`}
                        >
                          {item.cityName}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container-fluid py-3">
        <div className="container padding border-bottom footer-keywords">
          <div className="row">
            <div className="col-12 col-md-6 col-lg-3 col-xl-3">
              {/* <ul> */}
                <CityList prefix={"Apartments in "} cityList={cityList} cat={"apartments"}/>
              {/* </ul> */}
            </div>
            <div className="col-12 col-md-6 col-lg-3 col-xl-3">
              {/* <ul> */}
                <CityList prefix={"New Projects in "} cityList={cityList.filter(item => !["Agra"].includes(item.cityName))} cat={"new-projects"}/>
              {/* </ul> */}
            </div>
            <div className="col-12 col-md-6 col-lg-3 col-xl-3">
              {/* <ul> */}
                <CityList prefix={"Flats in "} cityList={cityList} cat={"flats"}/>
              {/* </ul> */}
            </div>

            <div className="col-12 col-md-6 col-lg-3 col-xl-3">
              {/* <ul> */}
                <CityList
                  prefix={"Commercial Property in "}
                  cityList={cityList.filter(item => !["Agra", "Bareilly", "Chennai", "Dehradun", "Kochi", "Thiruvananthapuram", "Vrindavan"].includes(item.cityName))}
                  cat={"commercial"}
                />
              {/* </ul> */}
            </div>
          </div>
        </div>
        <div className="container px-3 px-md-0 pt-5">
          <div className="row">
            <div className="col-6 col-md-3 col-sm-6">
              <p className="text-golden">Projects</p>
              <ul className="p-0 list-unstyled">
                {projectTypes.map((item, index) => (
                  <li key={`${item.name}-${index}`}>
                    <Link
                      className="footer-text text-decoration-none"
                      href={`/projects/${item.slugUrl}`}
                      title={`${item.projectTypeName} projects`}
                    >
                      {item.projectTypeName}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-6 col-md-3 col-sm-6">
              <p className="text-golden">Company</p>
              <ul className="p-0 list-unstyled">
                {companyArr.map((item, index) => (
                  <li key={`${item.id}-${index}`}>
                    <Link
                      className="footer-text text-decoration-none"
                      href={item.slugUrl}
                      scroll={true}
                      title={item.name}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    className="footer-text text-decoration-none"
                    href="/privacy-policy"
                    title="Privacy Policy"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div className="col-6 col-md-3 col-sm-6">
              <p className="text-golden">Media</p>
              <ul className="p-0 list-unstyled">
                {mediaArr.map((item, index) => (
                  <li key={`${item.id}-${index}`}>
                    <Link className="footer-text text-decoration-none" href={item.slugUrl} title={item.name}>
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-6 col-md-3 col-sm-6">
              <div>
                <p className="text-golden">Get Social</p>
                <ul className="d-flex gap-3 p-0 list-unstyled flex-wrap">
                  <li className="">
                    <Link
                      className="fs-4 text-golden hover-green text-decoration-none"
                      href="https://www.facebook.com/mypropertyfact1/"
                      target="_blank"
                      title="facebook"
                    >
                      <Image
                        src="/static/icon/facebook.png"
                        alt="Facebook"
                        title="Facebook"
                        width={24}
                        height={24}
                      />
                    </Link>
                  </li>
                  <li className="">
                    <Link
                      className="fs-4 text-golden"
                      href="https://www.instagram.com/my.property.fact/"
                      target="_blank"
                      title="instagram"
                    >
                      <Image
                        src="/static/icon/instagram.png"
                        alt="Instagram"
                        title="Instagram"
                        width={24}
                        height={24}
                      />
                    </Link>
                  </li>
                  <li className="">
                    <Link
                      className="fs-4 text-golden"
                      href="https://www.linkedin.com/company/my-property-fact/"
                      target="_blank"
                      title="linkedin"
                    >
                      <Image
                        src="/static/icon/linkedin.png"
                        alt="LinkedIn"
                        title="LinkedIn"
                        width={24}
                        height={24}
                      />
                    </Link>
                  </li>
                  <li className="">
                    <Link
                      className="fs-4 text-golden"
                      href="https://www.youtube.com/@my.propertyfact/"
                      target="_blank"
                      title="youtube"
                    >
                      <Image
                        src="/static/icon/youtube.png"
                        alt="YouTube"
                        title="YouTube"
                        width={24}
                        height={24}
                      />
                    </Link>
                  </li>
                  <li className="">
                    <Link
                      className="fs-4 text-golden"
                      href="https://x.com/my_propertyfact/"
                      target="_blank"
                      title="X"
                    >
                      <Image
                        src="/static/icon/twitter.png"
                        alt="X (Twitter)"
                        title="X (Twitter)"
                        width={24}
                        height={24}
                      />
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <p className="pb-3 footer-text text-center m-0">
          The content and data are for informative purposes only and may be
          prone to inaccuracy and inconsistency. We do not take any
          responsibility for data mismatches and strongly advise the viewers to
          conduct their detailed research before making any investment or
          purchase-related decisions.
        </p>
        <div className="text-center pb-3">
          <Link
            className="footer-text text-decoration-none"
            href="/privacy-policy"
            title="Privacy Policy"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
