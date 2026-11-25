import { ClassificationResult, MaterialType } from "@/types";

const KEYWORD_MAP: { type: MaterialType; keywords: string[] }[] = [
  { type: "PET", keywords: ["pet", "botella", "transparente", "bidon transparente", "gaseosa", "agua mineral"] },
  { type: "HDPE", keywords: ["hdpe", "bidon", "blanco grueso", "tapa rosca", "envase rigido", "galon", "detergente"] },
  { type: "PP", keywords: ["pp", "polipropileno", "tapa", "cuchara", "envase yogurt"] },
  { type: "LDPE", keywords: ["ldpe", "bolsa", "bolsas plasticas", "manga"] },
  { type: "Film stretch", keywords: ["film", "stretch", "paletizado", "rollo plastico", "envoltura"] },
  { type: "Cartón corrugado", keywords: ["carton", "caja", "corrugado", "embalaje carton"] },
  { type: "Papel mixto", keywords: ["papel", "hojas", "archivo", "oficina"] },
  { type: "Chatarra ferrosa", keywords: ["chatarra", "fierro", "acero", "hierro", "plancha metalica", "metal ferroso"] },
  { type: "Aluminio", keywords: ["aluminio", "lata", "perfil aluminio"] },
  { type: "Cobre", keywords: ["cobre", "cable"] },
  { type: "Pallets", keywords: ["pallet", "tarima", "parihuela"] },
  { type: "Madera", keywords: ["madera", "tabla", "encofrado", "aserrin"] },
];

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function classifyMaterial(description: string, category?: string): ClassificationResult {
  const text = normalize(description);
  const scores = KEYWORD_MAP.map(({ type, keywords }) => {
    const hits = keywords.filter((k) => text.includes(normalize(k))).length;
    return { type, hits };
  }).sort((a, b) => b.hits - a.hits);

  const top = scores[0];

  if (!top || top.hits === 0) {
    return {
      material: category === "Metales" ? "Chatarra ferrosa" : "HDPE",
      confidence: 35,
      alternatives: scores.slice(0, 3).map((s) => s.type),
    };
  }

  const confidence = Math.min(96, 55 + top.hits * 20);
  const alternatives = scores.slice(1, 4).filter((s) => s.hits > 0).map((s) => s.type);

  return { material: top.type, confidence, alternatives };
}
