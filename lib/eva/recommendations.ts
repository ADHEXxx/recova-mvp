import { Company, EvaRecommendation, Material, Requirement } from "@/types";
import { findMatchesForMaterial, findMatchesForRequirement } from "./matching";
import { buildGroupedLot } from "./grouping";
import { betterQualityUpside } from "./valuation";

export function generatorRecommendations(
  company: Company,
  myMaterials: Material[],
  allRequirements: Requirement[],
  allMaterials: Material[],
): EvaRecommendation[] {
  const recs: EvaRecommendation[] = [];
  const activeMaterials = myMaterials.filter((m) => m.status === "active");

  for (const material of activeMaterials) {
    const matches = findMatchesForMaterial(material, allRequirements);
    const best = matches[0];
    if (best && best.requirement.minQuantity > material.quantity && material.acceptsGrouping) {
      const lot = buildGroupedLot(best.requirement, allMaterials, material.id);
      if (lot && lot.totalQuantity >= best.requirement.minQuantity) {
        recs.push({
          id: `rec-group-${material.id}`,
          priority: "ALTA",
          text: `Unirte a un lote agrupado de "${material.materialType}" permitiría superar el volumen mínimo requerido por ${best.buyerCompany.name} (${lot.totalQuantity} kg vs ${best.requirement.minQuantity} kg mínimos).`,
          actionLabel: "Ver agrupación",
          href: `/grouping/${lot.id}`,
        });
      }
    }

    if (best && best.score.overall >= 85) {
      recs.push({
        id: `rec-match-${material.id}`,
        priority: "ALTA",
        text: `Tu material "${material.name}" tiene ${best.score.overall}% de compatibilidad con ${best.buyerCompany.name}. Es un buen momento para enviar tu interés.`,
        actionLabel: "Ver oportunidad",
        href: `/matches?material=${material.id}`,
      });
    }

    const upside = betterQualityUpside(material);
    if (upside && matches.length > 0 && matches[0].score.breakdown.quality < 90) {
      recs.push({
        id: `rec-quality-${material.id}`,
        priority: "MEDIA",
        text: `Tu lote "${material.name}" tendría mejor compatibilidad si mejorás su clasificación de calidad. ${upside.message}`,
        actionLabel: "Editar material",
        href: `/materials/${material.id}`,
      });
    }
  }

  if (activeMaterials.length === 0) {
    recs.push({
      id: "rec-empty",
      priority: "MEDIA",
      text: "Todavía no tenés materiales publicados. Publicá tu primer lote para que EVA empiece a encontrar oportunidades.",
      actionLabel: "Publicar material",
      href: "/materials/new",
    });
  }

  if (!company.acceptsGrouping) {
    recs.push({
      id: "rec-enable-grouping",
      priority: "BAJA",
      text: "Activar la agrupación con otros generadores podría ayudarte a alcanzar los volúmenes mínimos que piden las empresas más grandes.",
      actionLabel: "Editar perfil",
      href: "/profile",
    });
  }

  return dedupePriority(recs).slice(0, 6);
}

export function buyerRecommendations(
  company: Company,
  myRequirements: Requirement[],
  allMaterials: Material[],
): EvaRecommendation[] {
  const recs: EvaRecommendation[] = [];
  const activeRequirements = myRequirements.filter((r) => r.status === "active");

  for (const requirement of activeRequirements) {
    const matches = findMatchesForRequirement(requirement, allMaterials);
    const totalAvailable = matches.reduce((sum, m) => sum + m.material.quantity, 0);

    if (matches.length > 0 && totalAvailable < requirement.minQuantity) {
      const lot = buildGroupedLot(requirement, allMaterials);
      if (lot) {
        recs.push({
          id: `rec-group-req-${requirement.id}`,
          priority: "ALTA",
          text: `Encontramos ${matches.length} generadores con ${totalAvailable} kg combinados de "${requirement.materialType}". Existe una agrupación potencial que puede completar tu requerimiento de ${requirement.minQuantity} kg.`,
          actionLabel: "Ver agrupación",
          href: `/grouping/${lot.id}`,
        });
      }
    }

    const best = matches[0];
    if (best && best.score.overall >= 90) {
      recs.push({
        id: `rec-best-${requirement.id}`,
        priority: "ALTA",
        text: `"${best.material.name}" de ${best.generatorCompany.name} tiene ${best.score.overall}% de compatibilidad con tu necesidad de ${requirement.materialType}.`,
        actionLabel: "Ver oportunidad",
        href: `/matches?requirement=${requirement.id}`,
      });
    } else if (matches.length === 0) {
      recs.push({
        id: `rec-none-${requirement.id}`,
        priority: "MEDIA",
        text: `Todavía no encontramos generadores compatibles con "${requirement.materialType}" en tu radio de búsqueda. Te avisaremos apenas aparezca una opción.`,
        actionLabel: "Ajustar necesidad",
        href: `/requirements/${requirement.id}`,
      });
    }
  }

  if (activeRequirements.length === 0) {
    recs.push({
      id: "rec-empty-req",
      priority: "MEDIA",
      text: "Todavía no publicaste una necesidad. Contale a EVA qué materiales buscás para empezar a recibir coincidencias.",
      actionLabel: "Crear necesidad",
      href: "/requirements/new",
    });
  }

  return dedupePriority(recs).slice(0, 6);
}

function dedupePriority(recs: EvaRecommendation[]): EvaRecommendation[] {
  const order = { ALTA: 0, MEDIA: 1, BAJA: 2 };
  return [...recs].sort((a, b) => order[a.priority] - order[b.priority]);
}
