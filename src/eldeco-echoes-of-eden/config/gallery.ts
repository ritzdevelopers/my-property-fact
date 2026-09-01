export type GalleryImage = {
  id: string;
  src: string;
  alt: string;
  objectPosition?: string;
};

export const galleryConfig = {
  id: "gallery",
  eyebrow: "BEAUTIFULLY DESIGNED",
  title: "Gallery",
  images: [
    {
      id: "towers-day",
      src: "/eldeco-echoes-of-eden/images/gallery-1.png",
      alt: "Eldeco Echoes of Eden towers daytime view",
      objectPosition: "center center",
    },
    {
      id: "towers-sunset",
      src: "/eldeco-echoes-of-eden/images/gallery-2.png",
      alt: "Eldeco Echoes of Eden towers at sunset",
      objectPosition: "center 20%",
    },
    {
      id: "towers-close",
      src: "/eldeco-echoes-of-eden/images/gallery-3.png",
      alt: "Close-up view of residential towers",
      objectPosition: "60% center",
    },
    {
      id: "pool-area",
      src: "/eldeco-echoes-of-eden/images/gallery-4.png",
      alt: "Swimming pool and amenity area",
      objectPosition: "center bottom",
    },
  ] satisfies GalleryImage[],
} as const;
