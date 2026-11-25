import { MaterialCategory, MaterialType } from "@/types";

export const MATERIAL_TYPE_CATEGORY: Record<string, MaterialCategory> = {
  HDPE: "Plásticos",
  PET: "Plásticos",
  PP: "Plásticos",
  LDPE: "Plásticos",
  "Film stretch": "Plásticos",
  "Cartón corrugado": "Papel y cartón",
  "Papel mixto": "Papel y cartón",
  "Chatarra ferrosa": "Metales",
  Aluminio: "Metales",
  Cobre: "Metales",
  Pallets: "Madera",
  Madera: "Madera",
};

export function categoryForMaterialType(type: MaterialType): MaterialCategory {
  return MATERIAL_TYPE_CATEGORY[type] ?? "Orgánicos";
}
