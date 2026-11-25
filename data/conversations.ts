import { ChatMessage, Conversation } from "@/types";

function hoursAgo(n: number) {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d.toISOString();
}

export const conversationSeeds: Conversation[] = [
  {
    id: "conv-1",
    matchId: "match-seed-1",
    participantIds: ["gen-envaplast", "buy-replast"],
    lastMessageAt: hoursAgo(1),
  },
];

export const messageSeeds: ChatMessage[] = [
  {
    id: "msg-1",
    conversationId: "conv-1",
    senderCompanyId: "buy-replast",
    text: "Hola, vimos tu lote de HDPE limpio. ¿Sigue disponible?",
    createdAt: hoursAgo(5),
  },
  {
    id: "msg-2",
    conversationId: "conv-1",
    senderCompanyId: "gen-envaplast",
    text: "Hola Andrea, sí, tenemos 620 kg disponibles ahora mismo.",
    createdAt: hoursAgo(4),
  },
  {
    id: "msg-3",
    conversationId: "conv-1",
    senderCompanyId: "buy-replast",
    text: "Perfecto, nos interesa. ¿Podrían coordinar el retiro esta semana?",
    createdAt: hoursAgo(1),
  },
];
