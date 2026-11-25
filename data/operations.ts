import { Operation, OperationStatus } from "@/types";

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const FULL_STEPS: OperationStatus[] = [
  "Publicado",
  "Match encontrado",
  "Interés confirmado",
  "Acuerdo",
  "Retiro",
  "Material recibido",
  "Operación cerrada",
];

function buildTimeline(completedThrough: OperationStatus, startDaysAgo: number): Operation["timeline"] {
  const idx = FULL_STEPS.indexOf(completedThrough);
  return FULL_STEPS.map((step, i) => ({
    step,
    date: daysAgo(startDaysAgo - i * 2),
    done: i <= idx,
  }));
}

export const operations: Operation[] = [
  {
    id: "op-1",
    matchId: "match-hist-1",
    generatorCompanyId: "gen-envaplast",
    buyerCompanyId: "buy-replast",
    materialType: "HDPE",
    quantity: 540,
    unit: "kg",
    date: daysAgo(20),
    value: 1566,
    status: "Operación cerrada",
    rating: 5,
    timeline: buildTimeline("Operación cerrada", 26),
  },
  {
    id: "op-2",
    matchId: "match-hist-2",
    generatorCompanyId: "gen-metaloriente",
    buyerCompanyId: "buy-acero-circular",
    materialType: "Chatarra ferrosa",
    quantity: 1800,
    unit: "kg",
    date: daysAgo(35),
    value: 2340,
    status: "Operación cerrada",
    rating: 4.5,
    timeline: buildTimeline("Operación cerrada", 40),
  },
  {
    id: "op-3",
    matchId: "match-hist-3",
    generatorCompanyId: "gen-empaques-scz",
    buyerCompanyId: "buy-cartopack",
    materialType: "Cartón corrugado",
    quantity: 900,
    unit: "kg",
    date: daysAgo(12),
    value: 810,
    status: "Retiro",
    timeline: buildTimeline("Retiro", 14),
  },
  {
    id: "op-4",
    matchId: "match-hist-4",
    generatorCompanyId: "gen-dist-norte",
    buyerCompanyId: "buy-politransform",
    materialType: "Film stretch",
    quantity: 180,
    unit: "kg",
    date: daysAgo(6),
    value: 288,
    status: "Acuerdo",
    timeline: buildTimeline("Acuerdo", 6),
  },
  {
    id: "op-5",
    matchId: "match-hist-5",
    generatorCompanyId: "gen-centro-verde",
    buyerCompanyId: "buy-replast",
    materialType: "HDPE",
    quantity: 300,
    unit: "kg",
    date: daysAgo(50),
    value: 840,
    status: "Operación cerrada",
    rating: 4.8,
    timeline: buildTimeline("Operación cerrada", 55),
  },
];

export const getOperationsForCompany = (companyId: string) =>
  operations.filter((o) => o.generatorCompanyId === companyId || o.buyerCompanyId === companyId);
