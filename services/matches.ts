import { StoreState, matchKey } from "@/lib/store";
import { Company, MatchStatus } from "@/types";
import { ComputedMatch, findMatchesForMaterial, findMatchesForRequirement } from "@/lib/eva/matching";

export interface EnrichedMatch {
  key: string;
  computed: ComputedMatch;
  status: MatchStatus;
  saved: boolean;
}

export function getMatchesForCompany(state: StoreState, company: Company): EnrichedMatch[] {
  const results: ComputedMatch[] = [];

  if (company.role === "GENERATOR") {
    const myMaterials = state.materials.filter((m) => m.companyId === company.id && m.status === "active");
    for (const material of myMaterials) {
      results.push(...findMatchesForMaterial(material, state.requirements, state.companies));
    }
  } else {
    const myRequirements = state.requirements.filter((r) => r.companyId === company.id && r.status === "active");
    for (const requirement of myRequirements) {
      results.push(...findMatchesForRequirement(requirement, state.materials, state.companies));
    }
  }

  const seen = new Set<string>();
  const enriched: EnrichedMatch[] = [];
  for (const computed of results) {
    const key = matchKey(computed.material.id, computed.requirement.id);
    if (seen.has(key)) continue;
    seen.add(key);
    enriched.push({
      key,
      computed,
      status: state.matchOverrides[key] ?? "available",
      saved: state.savedMatchKeys.includes(key),
    });
  }

  return enriched.sort((a, b) => b.computed.score.overall - a.computed.score.overall);
}

export function findEnrichedMatchByKey(state: StoreState, key: string): EnrichedMatch | null {
  const [materialId, requirementId] = key.split("__");
  const material = state.materials.find((m) => m.id === materialId);
  const requirement = state.requirements.find((r) => r.id === requirementId);
  if (!material || !requirement) return null;
  const generatorCompany = state.companies.find((c) => c.id === material.companyId);
  const buyerCompany = state.companies.find((c) => c.id === requirement.companyId);
  if (!generatorCompany || !buyerCompany) return null;

  const matches = findMatchesForRequirement(requirement, [material], state.companies);
  const computed = matches[0];
  if (!computed) return null;

  return {
    key,
    computed,
    status: state.matchOverrides[key] ?? "available",
    saved: state.savedMatchKeys.includes(key),
  };
}
