export type LocationAdvantage = {
  id: string;
  destination: string;
  travelTime: string;
};

export const locationConfig = {
  id: "location",
  eyebrow: "",
  title: "Well Connected Location Advantages",
  map: {
    src: "/eldeco-echoes-of-eden/images/location-map.png",
    alt: "Eldeco Echoes of Eden location map",
  },
  advantages: [
    { id: "expressway", destination: "Yamuna Expressway", travelTime: "2 Mins" },
    { id: "galgotias", destination: "Galgotias University", travelTime: "10 Mins" },
    {
      id: "airport",
      destination: "Noida International Airport (Jewar)",
      travelTime: "15 Mins",
    },
    { id: "sharda", destination: "Sharda University", travelTime: "20 Mins" },
    { id: "omaxe", destination: "Omaxe Connaught Place", travelTime: "20 Mins" },
    {
      id: "radisson",
      destination: "Radisson Blu Greater Noida",
      travelTime: "25 Mins",
    },
  ] satisfies LocationAdvantage[],
} as const;
