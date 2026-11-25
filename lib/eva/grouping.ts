import { Company, GroupedLot, Material, Requirement } from "@/types";
import { getCompanyById } from "@/data/companies";
import { haversineKm } from "@/lib/geo";

/**
 * Proposes a grouped lot for a requirement by combining compatible materials
 * from different generators until the minimum required volume is reached.
 * Only groups materials that share type, meet minimum quality and fall
 * within a reasonable distance of the requirement's city.
 */
export function buildGroupedLot(
  requirement: Requirement,
  materials: Material[],
  anchorMaterialId?: string,
  companies?: Company[],
): GroupedLot | null {
  const findCompany = (id: string) => companies?.find((company) => company.id === id) ?? getCompanyById(id);
  const buyerCompany = findCompany(requirement.companyId);
  if (!buyerCompany) return null;

  const cleanlinessRank: Record<string, number> = {
    "Muy limpio": 4,
    Limpio: 3,
    Regular: 2,
    "Con impurezas": 1,
  };
  const minRank = cleanlinessRank[requirement.minQuality];

  const eligible = materials
    .filter(
      (m) =>
        m.status === "active" &&
        m.acceptsGrouping &&
        (m.materialType === requirement.materialType || requirement.alternativeMaterials.includes(m.materialType)) &&
        cleanlinessRank[m.cleanliness] >= minRank,
    )
    .map((m) => {
      const company = findCompany(m.companyId);
      if (!company) return null;
      const distanceKm = haversineKm(company.lat, company.lng, buyerCompany.lat, buyerCompany.lng);
      return { material: m, company, distanceKm };
    })
    .filter((x): x is { material: Material; company: NonNullable<ReturnType<typeof getCompanyById>>; distanceKm: number } => !!x)
    .filter((x) => x.distanceKm <= requirement.radiusKm * 1.4)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  if (eligible.length < 2) return null;

  const anchorIndex = anchorMaterialId ? eligible.findIndex((e) => e.material.id === anchorMaterialId) : -1;
  const ordered = anchorIndex >= 0 ? [eligible[anchorIndex], ...eligible.filter((_, i) => i !== anchorIndex)] : eligible;

  const members: GroupedLot["members"] = [];
  let total = 0;
  for (const item of ordered) {
    if (total >= requirement.idealQuantity) break;
    members.push({ materialId: item.material.id, companyId: item.company.id, quantity: item.material.quantity });
    total += item.material.quantity;
  }

  if (members.length < 2 || total < requirement.minQuantity) return null;

  return {
    id: `grp-${requirement.id}`,
    requirementId: requirement.id,
    materialType: requirement.materialType,
    members,
    totalQuantity: total,
    minRequired: requirement.minQuantity,
    city: requirement.city,
    status: "proposed",
  };
}
