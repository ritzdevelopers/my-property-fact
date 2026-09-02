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
      alt: "Close-up view of Eldeco Echoes of Eden residential towers",
      objectPosition: "60% center",
    },
    {
      id: "pool-area-1",
      src: "/eldeco-echoes-of-eden/images/gallery-4.png",
      alt: "Eldeco Echoes of Eden swimming pool and amenity area",
      objectPosition: "center bottom",
    },
    {
      id: "pool-area-2",
      src: "/eldeco-echoes-of-eden/images/gallery-5.png",
      alt: "Eldeco Echoes of Eden swimming pool and landscaped area",
      objectPosition: "center bottom",
    },
    {
      id: "pool-area-3",
      src: "/eldeco-echoes-of-eden/images/gallery-6.png",
      alt: "Eldeco Echoes of Eden residential amenities",
      objectPosition: "center bottom",
    },
    {
      id: "pool-area-4",
      src: "/eldeco-echoes-of-eden/images/gallery-7.png",
      alt: "Eldeco Echoes of Eden lifestyle and amenity area",
      objectPosition: "center bottom",
    },
    {
      id: "pool-area-5",
      src: "/eldeco-echoes-of-eden/images/gallery-8.png",
      alt: "Eldeco Echoes of Eden landscaped amenity area",
      objectPosition: "center bottom",
    },
    {
      id: "pool-area-6",
      src: "/eldeco-echoes-of-eden/images/gallery-9.png",
      alt: "Eldeco Echoes of Eden premium residential amenities",
      objectPosition: "center bottom",
    },
    {
      id: "pool-area-7",
      src: "/eldeco-echoes-of-eden/images/gallery-10.png",
      alt: "Eldeco Echoes of Eden modern lifestyle amenities",
      objectPosition: "center bottom",
    },
  ] satisfies GalleryImage[],
} as const;