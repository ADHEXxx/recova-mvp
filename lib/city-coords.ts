import { City } from "@/types";

export const CITY_COORDS: Record<City, { lat: number; lng: number }> = {
  "Santa Cruz de la Sierra": { lat: -17.7833, lng: -63.1821 },
  Cochabamba: { lat: -17.3895, lng: -66.1568 },
  "La Paz": { lat: -16.5, lng: -68.15 },
  "El Alto": { lat: -16.5104, lng: -68.1633 },
  Warnes: { lat: -17.5136, lng: -63.1633 },
  Montero: { lat: -17.3394, lng: -63.2528 },
};

export function jitterCoords(lat: number, lng: number) {
  return { lat: lat + (Math.random() - 0.5) * 0.05, lng: lng + (Math.random() - 0.5) * 0.05 };
}
