export type AmenityIcon =
  | "gamepad"
  | "yoga"
  | "squash"
  | "pool"
  | "gym"
  | "cycling"
  | "playground"
  | "plaza"
  | "open_gym"
  | "power_backup";

export type Amenity = {
  id: string;
  label: string;
  icon: AmenityIcon;
};

export const amenitiesConfig = {
  id: "amenities",
  eyebrow: "INTERNATIONAL STANDARD",
  title: "Amenities",
  items: [
    { id: "convenience-retail", label: "Convenience Retail", icon: "gamepad" },
    { id: "landscape-hangout-area", label: "Landscape Hangout Area", icon: "yoga" },
    { id: "multipurpose-hall", label: "Multipurpose Hall", icon: "squash" },
    { id: "ampthitheatre", label: "Ampthitheatre", icon: "pool" },
    { id: "peripheral-greens", label: "Peripheral Greens", icon: "gym" },
    { id: "palm-tree-avenue", label: "Palm Tree Avenue", icon: "cycling" },
    { id: "kids-swing-area", label: "Kid's swing area", icon: "playground" },
    { id: "cctv-security", label: "CCTV Security", icon: "plaza" },
    { id: "open-gym", label: "Open Gym", icon: "open_gym" },
    { id: "power-backup", label: "Power Backup", icon: "power_backup" },
    // { id: "school-bus-waiting-area", label: "School Bus Waiting Area", icon: "plaza" },
  ] satisfies Amenity[],
} as const;
