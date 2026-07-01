export const TOTAL_FRAMES = 121;

export type TimeOfDay =
  | "day"
  | "noon"
  | "dusk"
  | "night";

export const frames: Record<TimeOfDay, string[]> = {
  day: Array.from(
    { length: TOTAL_FRAMES },
    (_, i) => `/assets/3d/day/${i}.avif`
  ),

  noon: Array.from(
    { length: TOTAL_FRAMES },
    (_, i) => `/assets/3d/noon/${i}.avif`
  ),

  dusk: Array.from(
    { length: TOTAL_FRAMES },
    (_, i) => `/assets/3d/dusk/${i}.avif`
  ),

  night: Array.from(
    { length: TOTAL_FRAMES },
    (_, i) => `/assets/3d/night/${i}.avif`
  ),
};