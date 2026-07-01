export type SceneKey =
  | "hall"
  | "bedroom"
  | "bathroom"
  | "kitchen"
  | "balcony";

export interface Hotspot {
  id: string;
  target: SceneKey;
  yaw: number;
  pitch: number;
  label: string;
}

export interface SceneData {
  image: string;
  hotspots: Hotspot[];
}
export const scenes: Record<SceneKey, SceneData> = {
  hall: {
    image: "/assets/panoramas/hall.avif",
    hotspots: [
      {
        id: "hall-bedroom",
        target: "bedroom",
        label: "Bedroom",
        yaw: 76.8,
        pitch: -5.5,
      },
      {
        id: "hall-balcony",
        target: "balcony",
        label: "Balcony",
        yaw: 169.1,
        pitch: 4.8,
      },
      {
        id: "hall-kitchen",
        target: "kitchen",
        label: "Kitchen",
        yaw: -28.3,
        pitch: -7.5,
      },
    ],
  },

  bedroom: {
    image: "/assets/panoramas/bedroom.avif",
    hotspots: [
      {
        id: "bedroom-bathroom",
        target: "bathroom",
        label: "Bathroom",
        yaw: 17,
        pitch: -6,
      },
      {
        id: "bedroom-kitchen",
        target: "kitchen",
        label: "Kitchen",
        yaw: -62.3,
        pitch: 3.5,
      },
      {
        id: "bedroom-balcony",
        target: "balcony",
        label: "Balcony",
        yaw: 191.3,
        pitch: 2.9,
      },
      {
        id: "bedroom-hall",
        target: "hall",
        label: "Hall",
        yaw: -112,
        pitch: -12.3,
      },
    ],
  },

  bathroom: {
    image: "/assets/panoramas/bathroom.avif",
    hotspots: [
      {
        id: "bathroom-bedroom",
        target: "bedroom",
        label: "Bedroom",
        yaw: -4.9,
        pitch: -5.3,
      },
    ],
  },

  kitchen: {
    image: "/assets/panoramas/kitchen.avif",
    hotspots: [
      {
        id: "kitchen-hall",
        target: "hall",
        label: "Hall",
        yaw: 180,
        pitch: -5,
      },
    ],
  },

  balcony: {
    image: "/assets/panoramas/balcony_day.avif",
    hotspots: [
      {
        id: "balcony-hall",
        target: "hall",
        label: "Hall",
        yaw: -34.4,
        pitch: -10.5,
      },
    ],
  },
};