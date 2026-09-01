export type FloorPlan = {
  id: string;
  label: string;
  previewSrc: string;
  fullSrc: string;
  alt: string;
};

export const floorPlansConfig = {
  id: "floor-plan",
  eyebrow: "WELL CONSTRUCTED",
  title: "Floor Plans",
  ctaLabel: "View Plan",
  plans: [
    {
      id: "3bhk",
      label: "3 BHK",
      previewSrc: "/eldeco-echoes-of-eden/images/floor-plan.jpg",
      fullSrc: "/eldeco-echoes-of-eden/images/floor-plan.jpg",
      alt: "3 BHK floor plan layout",
    },
  ] satisfies FloorPlan[],
} as const;
