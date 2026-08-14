import Image from "next/image";

const EMBLEM = {
  src: "/static/banners/mpf-i80-emblem.webp",
  width: 670,
  height: 542,
};

/**
 * "80th" Independence Day emblem for the home hero.
 */
export default function IndependenceEmblem({ className = "" }) {
  return (
    <div className={`i80-emblem ${className}`.trim()}>
      <Image
        className="i80-emblem__mark"
        src={EMBLEM.src}
        width={EMBLEM.width}
        height={EMBLEM.height}
        alt="Celebrating 80 years of Indian independence, 1947 to 2027"
        priority
      />
      <p className="i80-emblem__label">INDEPENDENCE DAY</p>
    </div>
  );
}
