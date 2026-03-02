import Image from "next/image";
import Link from "next/link";
import "./common.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { RiArrowRightSLine } from "react-icons/ri";

export default function MpfTopPicks({ topProject }) {
  // If no top project is provided, return null
  if (!topProject) {
    return null;
  }
  // Extracting data from top project
  const {
    builderName,
    builderSlug,
    projectName,
    projectAddress,
    projectConfiguration,
    projectPrice,
    projectLogo,
    projectBannerImage,
    slugURL,
  } = topProject;

  // Generating price in lakh & cr
  const generatePrice = (price) => {
    if (/[a-zA-Z]/.test(price)) {
      return price;
    }
    return price < 1
      ? "₹ " + Math.round(parseFloat(price) * 100) + " Lakh* Onwards"
      : "₹ " + parseFloat(price) + " Cr* Onwards";
  };
  
  // Base URL for project images (avoid "undefined" in path)
  const imageBase =
    (typeof process.env.NEXT_PUBLIC_IMAGE_URL === "string" &&
      process.env.NEXT_PUBLIC_IMAGE_URL) ||
    "";
  const canBuildImageUrl = imageBase && slugURL;

  // Generating banner image source (use full URL if backend sent one)
  const bannerImageSrc =
    projectBannerImage && canBuildImageUrl && !projectBannerImage.startsWith("http")
      ? `${imageBase}properties/${slugURL}/${projectBannerImage}`
      : projectBannerImage?.startsWith("http")
        ? projectBannerImage
        : "/static/no_image.png";

  // Generating logo source
  const logoSrc =
    projectLogo && canBuildImageUrl && !projectLogo.startsWith("http")
      ? `${imageBase}properties/${slugURL}/${projectLogo}`
      : projectLogo?.startsWith("http")
        ? projectLogo
        : "/logo.webp";

  // Returning the MPF top picks section
  return (
    <>
      <div className="container-fluid position-relative mpf-top-picks-section-container">
        <section className="container pt-0 pt-lg-2 top-space">
          <div className="mpf-top-picks-section">
            <div className="mpf-top-picks-header">
              <div>
                <h2 className="plus-jakarta-sans-semi-bold">
                  My Property Fact&apos;s Top Picks
                </h2>
                <p className="plus-jakarta-sans-semi-bold text-muted">
                  Explore Top Living Options With Us
                </p>
              </div>
            </div>

            <div className="mpf-top-picks-card">
              <div className="mpf-top-picks-card__info">
                <div className="mpf-top-picks-card__builder">
                  <div className="project-logo-container">
                    <Image
                      src={logoSrc}
                      alt={builderName || "Builder logo"}
                      width={56}
                      height={56}
                      className="img-fluid"
                      priority
                      sizes="56px"
                    />
                  </div>
                  <div className="mpf-top-picks-card__builder-info">
                    <h4 className="mpf-top-pic-project-name plus-jakarta-sans-semi-bold">{builderName}</h4>
                    {builderSlug && (
                      <Link
                        href={`/builder/${builderSlug}`}
                        className="text-decoration-none plus-jakarta-sans-semi-bold fs-6 d-flex gap-2 align-items-center hover-underline"
                        aria-label={`View projects by ${builderName}`}
                      >
                        View Projects by {builderName} <RiArrowRightSLine />
                      </Link>
                    )}
                  </div>
                </div>

                <div className="mpf-top-picks-card__project">
                  <h3 className="mpf-top-picks-card__project-name">{projectName}</h3>
                  <div className="mpf-top-pic-address-container">
                    <FontAwesomeIcon icon={faLocationDot} />
                    <span>{projectAddress}</span>
                  </div>
                </div>

                <div className="mpf-top-picks-card__meta">
                  <div className="mpf-top-picks-card__meta-block1">
                    <span className="mpf-top-picks-card__meta-label1 d-flex gap-2 align-items-center">
                      <Image src="/static/icon/arrow.png" alt="Starting From" width={16} height={16} />
                      Starting From
                    </span>
                    <p className="mpf-top-picks-card__meta-value1">
                      {generatePrice(projectPrice)}
                    </p>
                  </div>
                  <div className="mpf-top-picks-card__meta-block2">
                    <p className="mpf-top-picks-card__meta-value2 text-uppercase plus-jakarta-sans-semi-bold d-flex gap-2 align-items-center">
                    <Image src="/static/icon/home.png" alt="Starting From" width={20} height={20} />
                      {projectConfiguration}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/${slugURL}`}
                  className="mpf-top-picks-card__cta btn-normal-color plus-jakarta-sans-semi-bold"
                  aria-label={`More about ${projectName}`}
                >
                  More About {projectName}
                </Link>
              </div>

              <div className="mpf-top-picks-card__media">
                <Image
                  src={bannerImageSrc}
                  alt={projectName || "Project banner"}
                  fill
                  sizes="(max-width: 992px) 100vw, 50vw"
                  priority
                  className="mpf-top-picks-card__media-img"
                />
                <div className="mpf-top-picks-card__tag">
                  <span className="mpf-top-picks-card__tag-eyebrow">
                    Premium Living Spaces
                  </span>
                  <span className="mpf-top-picks-card__tag-title">
                    Ready to Move In
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
