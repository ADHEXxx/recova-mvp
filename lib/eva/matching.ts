import { Company, Material, Match, Requirement } from "@/types";
import { calculateMatchScore } from "./scoring";
import { getCompanyById } from "@/data/companies";

const MIN_RECOMMENDED_SCORE = 50;

export interface ComputedMatch {
  material: Material;
  requirement: Requirement;
  generatorCompany: Company;
  buyerCompany: Company;
  score: ReturnType<typeof calculateMatchScore>;
}

export function findMatchesForRequirement(
  requirement: Requirement,
  materials: Material[],
  companies?: Company[],
): ComputedMatch[] {
  const findCompany = (id: string) => companies?.find((company) => company.id === id) ?? getCompanyById(id);
  const buyerCompany = findCompany(requirement.companyId);
  if (!buyerCompany) return [];

  const candidates = materials.filter(
    (m) =>
      m.status === "active" &&
      (!requirement.targetMaterialId || requirement.targetMaterialId === m.id) &&
      (m.materialType === requirement.materialType ||
        requirement.alternativeMaterials.includes(m.materialType)),
  );

  const scored = candidates
    .map((material) => {
      const generatorCompany = findCompany(material.companyId);
      if (!generatorCompany) return null;
      const score = calculateMatchScore(material, requirement, generatorCompany, buyerCompany);
      return { material, requirement, generatorCompany, buyerCompany, score };
    })
    .filter((m): m is ComputedMatch => m !== null && m.score.overall >= MIN_RECOMMENDED_SCORE);

  return scored.sort((a, b) => b.score.overall - a.score.overall);
}

export function findMatchesForMaterial(
  material: Material,
  requirements: Requirement[],
  companies?: Company[],
): ComputedMatch[] {
  const findCompany = (id: string) => companies?.find((company) => company.id === id) ?? getCompanyById(id);
  const generatorCompany = findCompany(material.companyId);
  if (!generatorCompany) return [];

  const candidates = requirements.filter(
    (r) =>
      r.status === "active" &&
      (!r.targetMaterialId || r.targetMaterialId === material.id) &&
      (r.materialType === material.materialType || r.alternativeMaterials.includes(material.materialType)),
  );

  const scored = candidates
    .map((requirement) => {
      const buyerCompany = findCompany(requirement.companyId);
      if (!buyerCompany) return null;
      const score = calculateMatchScore(material, requirement, generatorCompany, buyerCompany);
      return { material, requirement, generatorCompany, buyerCompany, score };
    })
    .filter((m): m is ComputedMatch => m !== null && m.score.overall >= MIN_RECOMMENDED_SCORE);

  return scored.sort((a, b) => b.score.overall - a.score.overall);
}

export function findMatches(
  requirements: Requirement[],
  materials: Material[],
  companies?: Company[],
): ComputedMatch[] {
  const all: ComputedMatch[] = [];
  for (const requirement of requirements.filter((r) => r.status === "active")) {
    all.push(...findMatchesForRequirement(requirement, materials, companies));
  }
  return all.sort((a, b) => b.score.overall - a.score.overall);
}

export function computedMatchToMatch(cm: ComputedMatch, id: string, status: Match["status"] = "available"): Match {
  const priceMid = (cm.material.expectedPriceMin ?? 1) + (cm.material.expectedPriceMax ?? 2);
  return {
    id,
    materialId: cm.material.id,
    requirementId: cm.requirement.id,
    generatorCompanyId: cm.generatorCompany.id,
    buyerCompanyId: cm.buyerCompany.id,
    score: { overall: cm.score.overall, breakdown: cm.score.breakdown, reasoning: cm.score.reasoning },
    distanceKm: cm.score.distanceKm,
    priceMin: cm.material.expectedPriceMin ?? Math.round((priceMid / 2) * 0.85 * 10) / 10,
    priceMax: cm.material.expectedPriceMax ?? Math.round((priceMid / 2) * 1.15 * 10) / 10,
    status,
    createdAt: new Date().toISOString(),
  };
}
