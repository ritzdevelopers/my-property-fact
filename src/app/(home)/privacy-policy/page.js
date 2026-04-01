import CommonBreadCrum from "../components/common/breadcrum";
import CommonHeaderBanner from "../components/common/commonheaderbanner";
import styles from "./privacy-policy.module.css";

export const metadata = {
  title: "Privacy Policy | My Property Fact",
  description:
    "Read the My Property Fact privacy policy and data handling practices.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_UI_URL}/privacy-policy`,
  },
};

const privacySections = [
  {
    id: "1",
    title: "Scope and Roles",
    content:
      "This policy applies to personal data collected through our website/app, APIs, WhatsApp and phone interactions, marketing campaigns, events, and offline forms later digitized by MPF. MPF acts as Data Fiduciary where it determines purpose and means, and selected vendors act as Data Processors under contract.",
  },
  {
    id: "2",
    title: "Data We Collect",
    content:
      "We may collect identity and contact details, role/professional details, listing and inquiry details, usage and technical data, communication records, marketing attribution data, and payment/KYC metadata where applicable.",
  },
  {
    id: "3",
    title: "Sources of Data",
    content:
      "Data is collected from you directly, through automated technologies (cookies/SDKs/logs), and from partners based on your activity such as developers, brokers, service providers, and analytics vendors.",
  },
  {
    id: "4",
    title: "Lawful Grounds",
    content:
      "Processing is based on consent, contractual necessity, legal obligations, and certain legitimate uses permitted by applicable law. You can withdraw consent at any time, and we will apply the change prospectively.",
  },
  {
    id: "5",
    title: "Purposes of Processing",
    content:
      "We process data to provide core services, communicate service updates, maintain security and fraud prevention, improve products, personalize experience, perform analytics, and run marketing with consent/opt-out controls.",
  },
  {
    id: "6",
    title: "Sharing and Disclosure",
    content:
      "We do not sell personal data. Data may be shared with counterparties you engage, contracted processors, legal authorities when required, and during corporate restructuring events with appropriate safeguards.",
  },
  {
    id: "7",
    title: "Security and Retention",
    content:
      "We use administrative, technical, and organizational safeguards and retain personal data only as long as necessary for defined purposes or legal compliance, after which data is deleted or anonymized.",
  },
  {
    id: "8",
    title: "Your Rights",
    content:
      "Subject to verification and legal limits, you may request access, correction, completion, deletion, consent withdrawal, grievance redressal, and nomination rights as per applicable law.",
  },
  {
    id: "9",
    title: "Children's Privacy",
    content:
      "Our platform is intended for adults (18+). We do not knowingly collect personal data from children.",
  },
  {
    id: "10",
    title: "Contact and Grievance",
    content:
      "For privacy requests and grievance support, contact us at: social@mypropertyfact.com",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <CommonHeaderBanner
        image={"project-banner.jpg"}
        headerText={"Privacy Policy"}
      />
      <CommonBreadCrum firstPage={"privacy-policy"} pageName={"Privacy Policy"} />

      <section className={styles.privacySection}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-xl-10">
              <div className={styles.introCard}>
                <span className={styles.badge}>Data Protection</span>
                <h2 className={styles.title}>Your privacy matters to us</h2>
                <p className={styles.subtitle}>
                  This page explains how My Property Fact collects, uses, and protects
                  your personal information when you interact with our platform.
                </p>
                <p className={styles.updatedText}>Last updated: 11 November 2025</p>
                <div className={styles.metaGrid}>
                  <div className={styles.metaItem}>
                    <p className={styles.metaLabel}>Legal Entity</p>
                    <p className={styles.metaValue}>My Property Fact (MPF)</p>
                  </div>
                  <div className={styles.metaItem}>
                    <p className={styles.metaLabel}>Effective Date</p>
                    <p className={styles.metaValue}>11 November 2025</p>
                  </div>
                  <div className={styles.metaItem}>
                    <p className={styles.metaLabel}>Coverage</p>
                    <p className={styles.metaValue}>
                      mypropertyfact.in and related channels
                    </p>
                  </div>
                </div>
              </div>

              <div className={styles.quickNav}>
                <p className={styles.quickNavLabel}>Quick jump</p>
                <div className={styles.quickNavChips}>
                  {privacySections.map((section) => (
                    <a
                      key={section.id}
                      href={`#privacy-section-${section.id}`}
                      className={styles.quickNavChip}
                    >
                      {section.id}. {section.title}
                    </a>
                  ))}
                </div>
              </div>

              <div className={styles.sectionsWrap}>
                {privacySections.map((section) => (
                  <article
                    key={section.id}
                    id={`privacy-section-${section.id}`}
                    className={styles.policyCard}
                  >
                    <div className={styles.policyIndex}>{section.id}</div>
                    <div>
                      <h3 className={styles.policyTitle}>{section.title}</h3>
                      <p className={styles.policyText}>{section.content}</p>
                    </div>
                  </article>
                ))}
              </div>

              <div className={styles.contactCard}>
                <h3 className={styles.contactTitle}>Need help with your privacy request?</h3>
                <p className={styles.contactText}>
                  Write to us for access, correction, deletion, consent withdrawal, or
                  grievance support. Our team will respond as per applicable timelines.
                </p>
                <div className={styles.contactActions}>
                  <a href="mailto:social@mypropertyfact.com" className={styles.primaryAction}>
                    social@mypropertyfact.com
                  </a>
                  {/* <a href="mailto:grievance@mypropertyfact.in" className={styles.secondaryAction}>
                    grievance@mypropertyfact.in
                  </a> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
