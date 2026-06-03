import { Fragment } from "react";

/**
 * Mirrors FAQ JSON-LD as plain HTML text (visually hidden) to improve text-to-HTML ratio
 * without changing visible UI.
 */
export default function SeoFaqNarrative({ items, heading = "Frequently asked questions" }) {
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <section className="mpf-seo-sr" aria-label={heading}>
      <h2>{heading}</h2>
      <dl>
        {items.map((item) => {
          const key = item?.id ?? item?.question;
          const question = String(
            item?.question ?? item?.q ?? item?.faqQuestion ?? "",
          ).trim();
          const answer = String(
            item?.answer ?? item?.a ?? item?.faqAnswer ?? "",
          ).trim();
          if (!question || !answer) return null;
          return (
            <Fragment key={key}>
              <dt>{question}</dt>
              <dd>{answer}</dd>
            </Fragment>
          );
        })}
      </dl>
    </section>
  );
}
