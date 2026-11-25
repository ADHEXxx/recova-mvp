import { City, Frequency, MaterialType, MaterialUse, Role, Sector } from "@/types";

export interface CompanyBasicsForm {
  accountType: "INDIVIDUAL" | "COMPANY" | "";
  name: string;
  sector: Sector | "";
  materialUse: MaterialUse | "";
  city: City | "";
  address: string;
  phone: string;
  contactName: string;
}

export interface GeneratorOnboardingForm {
  materials: MaterialType[];
  frequency: Frequency | "";
  avgVolume: string;
  storageCapacity: string;
  availability: string;
  hasTransport: boolean;
  acceptsGrouping: boolean;
}

export interface BuyerOnboardingForm {
  materials: MaterialType[];
  alternativeMaterials: MaterialType[];
  specifications: string;
  minVolume: string;
  idealVolume: string;
  purchaseFrequency: Frequency | "";
  minQuality: string;
  radiusKm: string;
  desiredAvailability: string;
}

export interface RegisterState {
  role: Role | null;
  basics: CompanyBasicsForm;
  credentials: { email: string; password: string; confirmPassword: string };
  generator: GeneratorOnboardingForm;
  buyer: BuyerOnboardingForm;
}

export const emptyRegisterState: RegisterState = {
  role: null,
  basics: { accountType: "", name: "", sector: "", materialUse: "", city: "", address: "", phone: "", contactName: "" },
  credentials: { email: "", password: "", confirmPassword: "" },
  generator: {
    materials: [],
    frequency: "",
    avgVolume: "",
    storageCapacity: "",
    availability: "",
    hasTransport: false,
    acceptsGrouping: true,
  },
  buyer: {
    materials: [],
    alternativeMaterials: [],
    specifications: "",
    minVolume: "",
    idealVolume: "",
    purchaseFrequency: "",
    minQuality: "",
    radiusKm: "",
    desiredAvailability: "",
  },
};
