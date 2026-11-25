import { Material, MaterialType, ValueEstimate } from "@/types";

const BASE_PRICE_TABLE: Record<MaterialType, { min: number; max: number }> = {
  HDPE: { min: 2.0, max: 3.4 },
  PET: { min: 1.8, max: 2.9 },
  PP: { min: 1.6, max: 2.6 },
  LDPE: { min: 1.3, max: 2.1 },
  "Cartón corrugado": { min: 0.6, max: 1.1 },
  "Papel mixto": { min: 0.4, max: 0.8 },
  "Film stretch": { min: 1.1, max: 1.9 },
  "Chatarra ferrosa": { min: 0.9, max: 1.6 },
  Aluminio: { min: 4.0, max: 5.8 },
  Cobre: { min: 18, max: 26 },
  Pallets: { min: 10, max: 20 },
  Madera: { min: 0.4, max: 0.9 },
};

const CLEANLINESS_MULTIPLIER: Record<Material["cleanliness"], number> = {
  "Muy limpio": 1.12,
  Limpio: 1.0,
  Regular: 0.85,
  "Con impurezas": 0.65,
};

export function estimateMaterialValue(material: Material, demandCount = 0): ValueEstimate {
  const base = BASE_PRICE_TABLE[material.materialType];
  const mult = CLEANLINESS_MULTIPLIER[material.cleanliness];
  const demandBoost = 1 + Math.min(demandCount, 5) * 0.02;

  const minPrice = Math.round(base.min * mult * 100) / 100;
  const maxPrice = Math.round(base.max * mult * demandBoost * 100) / 100;

  let confidence = 65;
  if (material.aiClassification && material.aiClassification.confidence >= 90) confidence += 15;
  if (demandCount > 0) confidence += Math.min(demandCount * 4, 20);
  confidence = Math.min(96, confidence);

  const explanation = `Estimación basada en tipo de material (${material.materialType}), calidad (${material.cleanliness}), volumen disponible (${material.quantity} ${material.unit}) y ${
    demandCount > 0 ? `${demandCount} empresa(s) con demanda activa compatible` : "demanda histórica del mercado"
  }.`;

  return { minPrice, maxPrice, confidence, explanation };
}

export function projectVolumeGrowth(historicalAvgPerWeek: number, daysAhead: number) {
  const projected = Math.round((historicalAvgPerWeek / 7) * daysAhead);
  return projected;
}

export function betterQualityUpside(material: Material): { deltaMax: number; message: string } | null {
  const rankOrder: Material["cleanliness"][] = ["Con impurezas", "Regular", "Limpio", "Muy limpio"];
  const idx = rankOrder.indexOf(material.cleanliness);
  if (idx >= rankOrder.length - 1) return null;
  const nextLevel = rankOrder[idx + 1];
  const current = estimateMaterialValue(material);
  const improved = estimateMaterialValue({ ...material, cleanliness: nextLevel });
  return {
    deltaMax: Math.round((improved.maxPrice - current.maxPrice) * 100) / 100,
    message: `Mejorar la limpieza de "${material.cleanliness}" a "${nextLevel}" podría aumentar el valor hasta Bs ${improved.maxPrice}/${material.unit}.`,
  };
}
