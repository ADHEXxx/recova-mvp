"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { RoleSelectStep } from "./role-select-step";
import { CompanyBasicsStep } from "./company-basics-step";
import { AccountCredentialsStep } from "./account-credentials-step";
import { GeneratorOnboardingStep } from "@/features/generator/onboarding-step";
import { BuyerOnboardingStep } from "@/features/buyer/onboarding-step";
import { EvaProcessingStep } from "./eva-processing-step";
import { emptyRegisterState, RegisterState } from "./types";
import { useStore, useStoreActions } from "@/lib/store";
import { CITY_COORDS, jitterCoords } from "@/lib/city-coords";
import { Company, Material, Requirement } from "@/types";
import { classifyMaterial } from "@/lib/eva/classify";
import { categoryForMaterialType } from "@/lib/material-category";
import { generateLogoDataUri, pickBrandColor } from "@/lib/logo-mark";

const STEP_LABELS = ["Rol", "Perfil", "Cuenta", "Detalles"];

export function RegisterWizard() {
  const router = useRouter();
  const { state: { hydrated } } = useStore();
  const { registerCompany, addMaterial, addRequirement } = useStoreActions();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<RegisterState>(emptyRegisterState);

  const isIndividual = form.basics.accountType === "INDIVIDUAL";
  const canAdvanceBasics = Boolean(
    form.basics.accountType &&
    form.basics.name.trim().length > 1 &&
    form.basics.city &&
    (form.role === "BUYER" ? form.basics.materialUse : isIndividual || form.basics.sector),
  );
  const canAdvanceCredentials = /^\S+@\S+\.\S+$/.test(form.credentials.email) && form.credentials.password.length >= 8 && form.credentials.password === form.credentials.confirmPassword;

  function initials(name: string) {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("");
  }

  function buildCompany(): Company | null {
    if (!form.role || !form.basics.city || !form.basics.accountType) return null;
    const accountType = form.role === "BUYER" ? "COMPANY" : form.basics.accountType;
    const individual = accountType === "INDIVIDUAL";
    const displayName = form.basics.name.trim() || (individual ? "Recolector independiente" : "Mi empresa");
    const coords = jitterCoords(CITY_COORDS[form.basics.city].lat, CITY_COORDS[form.basics.city].lng);
    return {
      id: `${form.role === "GENERATOR" ? "gen" : "buy"}-${Date.now()}`,
      name: displayName,
      accountType,
      authEmail: form.credentials.email.trim().toLowerCase(),
      authPassword: form.credentials.password,
      role: form.role,
      sector: individual ? "Reciclaje y gestión de residuos" : form.basics.sector || "Reciclaje y gestión de residuos",
      materialUse: form.role === "BUYER" ? form.basics.materialUse || undefined : undefined,
      city: form.basics.city,
      address: form.basics.address,
      phone: form.basics.phone ? `+591${form.basics.phone}` : "",
      contactName: individual ? displayName : form.basics.contactName,
      memberSince: new Date().toISOString(),
      verified: false,
      rating: 0,
      complianceRate: 100,
      qualityComplianceRate: 100,
      punctualityRate: 100,
      operationsCount: 0,
      hasTransport: form.generator.hasTransport,
      acceptsGrouping: form.role === "GENERATOR" ? form.generator.acceptsGrouping : true,
      lat: coords.lat,
      lng: coords.lng,
      logoInitials: initials(displayName),
      contactPhotoUrl: generateLogoDataUri(initials(displayName) || "RC", pickBrandColor(displayName)),
    };
  }

  function finish() {
    const newCompany = buildCompany();
    if (!newCompany) return;
    registerCompany(newCompany);

    if (newCompany.role === "GENERATOR" && form.generator.materials.length > 0) {
      const mainType = form.generator.materials[0];
      const classification = classifyMaterial(mainType, "Plásticos");
      const material: Material = {
        id: `mat-${Date.now()}`,
        companyId: newCompany.id,
        name: `${mainType} disponible`,
        materialType: mainType,
        category: categoryForMaterialType(mainType),
        description: `Material generado por ${newCompany.name}.`,
        quantity: Number(form.generator.avgVolume) || 100,
        unit: "kg",
        condition: "Usado - reciclable",
        cleanliness: "Regular",
        city: newCompany.city,
        availability: (form.generator.availability as Material["availability"]) || "En 3-7 días",
        frequency: form.generator.frequency || "Mensual",
        photos: [{ id: "p1", color: "#e8ecef" }],
        acceptsGrouping: form.generator.acceptsGrouping,
        status: "active",
        createdAt: new Date().toISOString(),
        aiClassification: { suggested: classification.material, confidence: classification.confidence },
      };
      addMaterial(material);
    }

    if (newCompany.role === "BUYER" && form.buyer.materials.length > 0) {
      const mainType = form.buyer.materials[0];
      const requirement: Requirement = {
        id: `req-${Date.now()}`,
        companyId: newCompany.id,
        materialType: mainType,
        category: categoryForMaterialType(mainType),
        specifications: form.buyer.specifications || "Sin especificaciones adicionales.",
        minQuantity: Number(form.buyer.minVolume) || 100,
        idealQuantity: Number(form.buyer.idealVolume) || Number(form.buyer.minVolume) || 200,
        unit: "kg",
        frequency: form.buyer.purchaseFrequency || "Mensual",
        minQuality: (form.buyer.minQuality as Requirement["minQuality"]) || "Regular",
        city: newCompany.city,
        radiusKm: Number(form.buyer.radiusKm) || 30,
        neededBy: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
        alternativeMaterials: form.buyer.alternativeMaterials,
        status: "active",
        createdAt: new Date().toISOString(),
      };
      addRequirement(requirement);
    }
  }

  function goNext() {
    if (step === 3) finish();
    setStep((s) => s + 1);
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-6 sm:py-10">
      <div className="flex items-center justify-between">
        <Logo />
        {step > 0 && step < 4 && (
          <Button variant="ghost" size="sm" onClick={() => setStep((s) => s - 1)} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Atrás
          </Button>
        )}
      </div>

      {step < 4 && (
        <div className="mt-6 flex gap-1.5">
          {STEP_LABELS.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-secondary"}`} />
          ))}
        </div>
      )}

      <div className="mt-8 flex-1">
        {step === 0 && (
          <RoleSelectStep
            ready={hydrated}
            onSelect={(role) => {
              setForm((f) => ({
                ...f,
                role,
                basics: {
                  ...f.basics,
                  accountType: role === "BUYER" ? "COMPANY" : f.role === "GENERATOR" ? f.basics.accountType : "",
                },
              }));
              setStep(1);
            }}
          />
        )}

        {step === 1 && (
          <CompanyBasicsStep
            role={form.role}
            value={form.basics}
            onChange={(patch) => setForm((f) => ({ ...f, basics: { ...f.basics, ...patch } }))}
          />
        )}

        {step === 2 && (
          <AccountCredentialsStep value={form.credentials} onChange={(patch) => setForm((f) => ({ ...f, credentials: { ...f.credentials, ...patch } }))} />
        )}

        {step === 3 && form.role === "GENERATOR" && (
          <GeneratorOnboardingStep
            value={form.generator}
            onChange={(patch) => setForm((f) => ({ ...f, generator: { ...f.generator, ...patch } }))}
          />
        )}

        {step === 3 && form.role === "BUYER" && (
          <BuyerOnboardingStep
            value={form.buyer}
            onChange={(patch) => setForm((f) => ({ ...f, buyer: { ...f.buyer, ...patch } }))}
          />
        )}

        {step === 4 && form.role && (
          <EvaProcessingStep role={form.role} onDone={() => router.push("/dashboard")} />
        )}
      </div>

      {step === 1 && (
        <Button className="mt-6 w-full" size="lg" disabled={!canAdvanceBasics} onClick={() => setStep(2)}>
          Continuar
        </Button>
      )}
      {step === 2 && (
        <Button className="mt-6 w-full" size="lg" disabled={!canAdvanceCredentials} onClick={() => setStep(3)}>
          Continuar
        </Button>
      )}
      {step === 3 && (
        <Button className="mt-6 w-full" size="lg" onClick={goNext}>
          Finalizar
        </Button>
      )}
    </div>
  );
}
