type QrCodePlaceholderProps = {
  alt: string;
  src?: string;
  size?: number;
};

export function QrCodePlaceholder({
  alt,
  src,
  size = 120,
}: QrCodePlaceholderProps) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="mx-auto block rounded-sm bg-[#F5F7F5] p-1"
      />
    );
  }

  return (
    <div
      className="mx-auto grid grid-cols-8 gap-0.5 rounded-sm bg-[#F5F7F5] p-2 shadow-sm"
      style={{ width: size, height: size }}
      role="img"
      aria-label={alt}
    >
      {Array.from({ length: 64 }).map((_, index) => (
        <span
          key={index}
          className={`aspect-square ${
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 15, 16, 23, 24, 31, 32, 39, 40, 47, 48, 55, 56, 63].includes(
              index,
            ) ||
            (index > 10 && index < 14) ||
            (index > 18 && index < 22) ||
            (index > 42 && index < 46) ||
            index % 9 === 0
              ? "bg-black"
              : "bg-transparent"
          }`}
        />
      ))}
    </div>
  );
}
