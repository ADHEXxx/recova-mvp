import { Cleanliness, Company, Frequency, Material, Requirement, ScoreBreakdown, MatchScore } from "@/types";
import { haversineKm } from "@/lib/geo";

const CLEANLINESS_RANK: Record<Cleanliness, number> = {
  "Muy limpio": 4,
  Limpio: 3,
  Regular: 2,
  "Con impurezas": 1,
};

const AVAILABILITY_SCORE: Record<Material["availability"], number> = {
  Inmediata: 100,
  "En 3-7 días": 85,
  "En 1-2 semanas": 65,
};

const FREQUENCY_RANK: Record<Frequency, number> = {
  "Única vez": 1,
  Semanal: 4,
  Quincenal: 3,
  Mensual: 2,
  Continua: 5,
};

function scoreMaterialMatch(material: Material, requirement: Requirement): number {
  if (material.materialType === requirement.materialType) return 100;
  if (requirement.alternativeMaterials.includes(material.materialType)) return 72;
  return 0;
}

function scoreQuality(material: Material, requirement: Requirement): number {
  const rank = CLEANLINESS_RANK[material.cleanliness];
  const minRank = CLEANLINESS_RANK[requirement.minQuality];
  if (rank >= minRank) {
    return Math.min(100, 70 + (rank - minRank) * 15);
  }
  return Math.max(20, 60 - (minRank - rank) * 25);
}

function scoreVolume(material: Material, requirement: Requirement): number {
  const { quantity } = material;
  const { minQuantity, idealQuantity } = requirement;
  if (quantity >= idealQuantity) return 100;
  if (quantity >= minQuantity) {
    const ratio = (quantity - minQuantity) / Math.max(1, idealQuantity - minQuantity);
    return Math.round(70 + ratio * 30);
  }
  return Math.round(Math.max(15, (quantity / minQuantity) * 65));
}

function scoreDistance(distanceKm: number, radiusKm: number): number {
  if (distanceKm <= radiusKm * 0.3) return 100;
  if (distanceKm >= radiusKm * 1.5) return Math.max(10, 40 - Math.round(distanceKm - radiusKm));
  const ratio = (distanceKm - radiusKm * 0.3) / (radiusKm * 1.2);
  return Math.round(100 - ratio * 60);
}

function scoreAvailability(material: Material): number {
  return AVAILABILITY_SCORE[material.availability];
}

function scoreFrequency(material: Material, requirement: Requirement): number {
  const matRank = FREQUENCY_RANK[material.frequency];
  const reqRank = FREQUENCY_RANK[requirement.frequency];
  if (matRank >= reqRank) return 100;
  const gap = reqRank - matRank;
  return Math.max(40, 100 - gap * 18);
}

function scoreReliability(company: Company): number {
  return Math.round(company.rating * 12 + company.complianceRate * 0.4);
}

const WEIGHTS: ScoreBreakdown = {
  material: 0.22,
  quality: 0.15,
  volume: 0.2,
  distance: 0.15,
  availability: 0.1,
  frequency: 0.08,
  reliability: 0.1,
};

export function calculateMatchScore(
  material: Material,
  requirement: Requirement,
  generatorCompany: Company,
  buyerCompany: Company,
): MatchScore & { distanceKm: number } {
  const distanceKm = haversineKm(generatorCompany.lat, generatorCompany.lng, buyerCompany.lat, buyerCompany.lng);

  const breakdown: ScoreBreakdown = {
    material: scoreMaterialMatch(material, requirement),
    quality: scoreQuality(material, requirement),
    volume: scoreVolume(material, requirement),
    distance: scoreDistance(distanceKm, requirement.radiusKm),
    availability: scoreAvailability(material),
    frequency: scoreFrequency(material, requirement),
    reliability: scoreReliability(generatorCompany),
  };

  const overall = Math.round(
    breakdown.material * WEIGHTS.material +
      breakdown.quality * WEIGHTS.quality +
      breakdown.volume * WEIGHTS.volume +
      breakdown.distance * WEIGHTS.distance +
      breakdown.availability * WEIGHTS.availability +
      breakdown.frequency * WEIGHTS.frequency +
      breakdown.reliability * WEIGHTS.reliability,
  );

  return {
    overall,
    breakdown,
    reasoning: buildReasoning(breakdown, material, requirement, distanceKm),
    distanceKm,
  };
}

function buildReasoning(
  breakdown: ScoreBreakdown,
  material: Material,
  requirement: Requirement,
  distanceKm: number,
): string {
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (breakdown.material >= 90) strengths.push("el material coincide exactamente con lo requerido");
  else if (breakdown.material > 0) strengths.push("el material es un sustituto aceptado");
  else weaknesses.push("el tipo de material no coincide con lo solicitado");

  if (breakdown.volume >= 85) strengths.push("el volumen disponible cubre el requerimiento ideal");
  else if (breakdown.volume >= 60) strengths.push("el volumen disponible supera el mínimo requerido");
  else weaknesses.push("el volumen disponible está por debajo del mínimo requerido");

  if (breakdown.distance >= 80) strengths.push(`la distancia (${distanceKm} km) está dentro del radio configurado`);
  else if (breakdown.distance >= 50) strengths.push("la distancia se encuentra dentro de un rango razonable");
  else weaknesses.push("la distancia supera el radio de búsqueda preferido");

  if (breakdown.quality >= 80) strengths.push("la calidad cumple o supera el mínimo exigido");
  else weaknesses.push("la calidad está en el límite de lo aceptado");

  if (breakdown.availability >= 85) strengths.push("la disponibilidad es inmediata");

  let text = "Este match tiene alta compatibilidad porque " + strengths.slice(0, 3).join(", ") + ".";
  if (strengths.length === 0) {
    text = "Este match tiene compatibilidad limitada.";
  }
  if (weaknesses.length > 0) {
    text += " Se recomienda revisar que " + weaknesses.join(" y ") + ".";
  }
  return text;
}
