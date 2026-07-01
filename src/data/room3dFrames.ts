export const ROOM3D_TOTAL_FRAMES = 120;

export const room3dFrames = Array.from(
  { length: ROOM3D_TOTAL_FRAMES },
  (_, i) => `/assets/floorplan/${i}.webp`
);
