// Core domain types for Recova

export type Role = "GENERATOR" | "BUYER";

export type MaterialUse =
  | "Usarlos en producción"
  | "Reciclarlos o transformarlos"
  | "Acopiarlos y clasificarlos"
  | "Comercializarlos o exportarlos"
  | "Otro uso";

export type Sector =
  | "Plásticos y empaques"
  | "Metalmecánica"
  | "Papel y cartón"
  | "Madera y forestal"
  | "Logística y distribución"
  | "Reciclaje y gestión de residuos"
  | "Construcción"
  | "Textil"
  | "Alimentos y bebidas";

export const CITIES = [
  "Santa Cruz de la Sierra",
  "Cochabamba",
  "La Paz",
  "El Alto",
  "Warnes",
  "Montero",
  "Viacha",
  "Sucre",
] as const;
export type City = (typeof CITIES)[number];

export const MATERIAL_CATEGORIES = [
  "Plásticos",
  "Papel y cartón",
  "Metales",
  "Madera",
  "Textiles",
  "Orgánicos",
] as const;
export type MaterialCategory = (typeof MATERIAL_CATEGORIES)[number];

export const MATERIAL_TYPES = [
  "HDPE",
  "PET",
  "PP",
  "LDPE",
  "Cartón corrugado",
  "Papel mixto",
  "Film stretch",
  "Chatarra ferrosa",
  "Aluminio",
  "Cobre",
  "Pallets",
  "Madera",
] as const;
export type MaterialType = string;

export type Frequency = "Única vez" | "Semanal" | "Quincenal" | "Mensual" | "Continua";

export type Cleanliness = "Muy limpio" | "Limpio" | "Regular" | "Con impurezas";

export type Condition = "Nuevo excedente" | "Usado - buen estado" | "Usado - reciclable" | "Procesado";

export type MaterialStatus = "active" | "grouped" | "sold" | "paused";

export type RequirementStatus = "active" | "completed" | "paused";

export type MatchStatus =
  | "available"
  | "interest_sent"
  | "mutual_interest"
  | "negotiation"
  | "confirmed"
  | "completed"
  | "cancelled";

export interface Company {
  id: string;
  name: string;
  accountType?: "INDIVIDUAL" | "COMPANY";
  authEmail?: string;
  authPassword?: string;
  role: Role;
  sector: Sector;
  materialUse?: MaterialUse;
  city: City;
  address: string;
  phone: string;
  contactName: string;
  memberSince: string; // ISO date
  verified: boolean;
  rating: number; // 0-5
  complianceRate: number; // 0-100
  qualityComplianceRate: number; // 0-100
  punctualityRate: number; // 0-100
  operationsCount: number;
  hasTransport: boolean;
  acceptsGrouping: boolean;
  lat: number;
  lng: number;
  logoInitials: string;
  bio?: string;
  contactPhotoUrl?: string;
}

export interface MaterialPhoto {
  id: string;
  color: string; // placeholder swatch color for mock image
}

export interface Material {
  id: string;
  companyId: string;
  name: string;
  materialType: MaterialType;
  category: MaterialCategory;
  description: string;
  quantity: number;
  unit: "kg" | "ton" | "unidades";
  condition: Condition;
  cleanliness: Cleanliness;
  humidity?: number;
  city: City;
  availability: "Inmediata" | "En 3-7 días" | "En 1-2 semanas";
  frequency: Frequency;
  photos: MaterialPhoto[];
  expectedPriceMin?: number;
  expectedPriceMax?: number;
  acceptsGrouping: boolean;
  status: MaterialStatus;
  createdAt: string;
  aiClassification?: {
    suggested: MaterialType;
    confidence: number;
  };
}

export interface Requirement {
  id: string;
  companyId: string;
  materialType: MaterialType;
  category: MaterialCategory;
  specifications: string;
  minQuantity: number;
  idealQuantity: number;
  unit: "kg" | "ton" | "unidades";
  frequency: Frequency;
  minQuality: Cleanliness;
  city: City;
  radiusKm: number;
  neededBy: string;
  alternativeMaterials: MaterialType[];
  status: RequirementStatus;
  createdAt: string;
  targetMaterialId?: string;
}

export interface ScoreBreakdown {
  material: number;
  quality: number;
  volume: number;
  distance: number;
  availability: number;
  frequency: number;
  reliability: number;
}

export interface MatchScore {
  overall: number;
  breakdown: ScoreBreakdown;
  reasoning: string;
}

export interface Match {
  id: string;
  materialId: string;
  requirementId: string;
  generatorCompanyId: string;
  buyerCompanyId: string;
  score: MatchScore;
  distanceKm: number;
  priceMin: number;
  priceMax: number;
  status: MatchStatus;
  createdAt: string;
}

export interface GroupedLotMember {
  materialId: string;
  companyId: string;
  quantity: number;
}

export interface GroupedLot {
  id: string;
  requirementId: string;
  materialType: MaterialType;
  members: GroupedLotMember[];
  totalQuantity: number;
  minRequired: number;
  city: City;
  status: "proposed" | "confirmed";
}

export type OperationStatus =
  | "Publicado"
  | "Match encontrado"
  | "Interés confirmado"
  | "Acuerdo"
  | "Retiro"
  | "Material recibido"
  | "Operación cerrada";

export interface TimelineStep {
  step: OperationStatus;
  date: string;
  done: boolean;
}

export interface Operation {
  id: string;
  matchId: string;
  generatorCompanyId: string;
  buyerCompanyId: string;
  materialType: MaterialType;
  quantity: number;
  unit: "kg" | "ton" | "unidades";
  date: string;
  value: number;
  status: OperationStatus;
  rating?: number;
  timeline: TimelineStep[];
}

export type NotificationType =
  | "match"
  | "grouping"
  | "interest"
  | "listing_expiring"
  | "message"
  | "system";

export interface AppNotification {
  id: string;
  companyId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderCompanyId: string;
  text: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  matchId: string;
  participantIds: string[]; // company ids
  lastMessageAt: string;
}

export type RecommendationPriority = "ALTA" | "MEDIA" | "BAJA";

export interface EvaRecommendation {
  id: string;
  priority: RecommendationPriority;
  text: string;
  actionLabel: string;
  href: string;
}

export interface ValueEstimate {
  minPrice: number;
  maxPrice: number;
  confidence: number;
  explanation: string;
}

export interface ClassificationResult {
  material: MaterialType;
  confidence: number;
  alternatives: MaterialType[];
}
