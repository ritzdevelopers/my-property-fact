export default function ListingCardSkeleton({ count = 3 }) {
  return (
    <div className="mpf-listings-list mpf-listings-skel" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <article key={index} className="mpf-listing-card mpf-lux-card mpf-listing-card--skel">
          <div className="mpf-lux-card__frame">
            <div className="mpf-skel-lux" />
          </div>
        </article>
      ))}
    </div>
  );
}
