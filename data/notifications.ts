import { AppNotification } from "@/types";

function hoursAgo(n: number) {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d.toISOString();
}

export const notificationSeeds: AppNotification[] = [
  {
    id: "not-1",
    companyId: "gen-envaplast",
    type: "match",
    title: "Nuevo match de EVA",
    body: "EVA encontró un match de 93% para tu lote de HDPE limpio.",
    read: false,
    createdAt: hoursAgo(2),
    link: "/matches",
  },
  {
    id: "not-2",
    companyId: "gen-envaplast",
    type: "grouping",
    title: "Agrupación disponible",
    body: "Tu material PET puede agruparse con otros 2 generadores para alcanzar 700 kg.",
    read: false,
    createdAt: hoursAgo(9),
    link: "/eva",
  },
  {
    id: "not-3",
    companyId: "gen-envaplast",
    type: "listing_expiring",
    title: "Publicación por expirar",
    body: "Tu publicación de HDPE mixto expirará en 3 días.",
    read: true,
    createdAt: hoursAgo(30),
    link: "/materials",
  },
  {
    id: "not-4",
    companyId: "buy-replast",
    type: "match",
    title: "Material compatible encontrado",
    body: "Nueva empresa interesada: Matriplast tiene 620 kg de HDPE compatibles.",
    read: false,
    createdAt: hoursAgo(3),
    link: "/matches",
  },
  {
    id: "not-5",
    companyId: "buy-replast",
    type: "grouping",
    title: "Lote agrupado disponible",
    body: "Nuevo lote compatible disponible cerca de tu ubicación (6.2 km).",
    read: false,
    createdAt: hoursAgo(14),
    link: "/eva",
  },
  {
    id: "not-6",
    companyId: "buy-replast",
    type: "interest",
    title: "Interés mutuo confirmado",
    body: "Matriplast confirmó interés en negociar contigo.",
    read: true,
    createdAt: hoursAgo(48),
    link: "/matches",
  },
];

export const getNotificationsForCompany = (companyId: string) =>
  notificationSeeds.filter((n) => n.companyId === companyId);
