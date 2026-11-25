"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import {
  AppNotification,
  ChatMessage,
  Company,
  Conversation,
  Material,
  MatchStatus,
  Requirement,
} from "@/types";
import { companies as seedCompanies, getCompanyById } from "@/data/companies";
import { materials as seedMaterials } from "@/data/materials";
import { requirements as seedRequirements } from "@/data/requirements";
import { notificationSeeds } from "@/data/notifications";
import { conversationSeeds, messageSeeds } from "@/data/conversations";

const STORAGE_KEY = "recova-state-v1";

export interface StoreState {
  companies: Company[];
  materials: Material[];
  requirements: Requirement[];
  matchOverrides: Record<string, MatchStatus>;
  savedMatchKeys: string[];
  notifications: AppNotification[];
  conversations: Conversation[];
  messages: ChatMessage[];
  currentCompanyId: string | null;
  hydrated: boolean;
}

const initialState: StoreState = {
  companies: seedCompanies,
  materials: seedMaterials,
  requirements: seedRequirements,
  matchOverrides: {},
  savedMatchKeys: [],
  notifications: notificationSeeds,
  conversations: conversationSeeds,
  messages: messageSeeds,
  currentCompanyId: null,
  hydrated: false,
};

type Action =
  | { type: "HYDRATE"; payload: Partial<StoreState> }
  | { type: "LOGIN"; companyId: string }
  | { type: "LOGOUT" }
  | { type: "REGISTER_COMPANY"; company: Company }
  | { type: "ADD_MATERIAL"; material: Material }
  | { type: "UPDATE_MATERIAL"; id: string; patch: Partial<Material> }
  | { type: "ADD_REQUIREMENT"; requirement: Requirement }
  | { type: "UPDATE_REQUIREMENT"; id: string; patch: Partial<Requirement> }
  | { type: "SET_MATCH_STATUS"; key: string; status: MatchStatus }
  | { type: "TOGGLE_SAVED_MATCH"; key: string }
  | { type: "MARK_NOTIFICATION_READ"; id: string }
  | { type: "MARK_ALL_NOTIFICATIONS_READ" }
  | { type: "SEND_MESSAGE"; conversationId: string; text: string }
  | { type: "ENSURE_CONVERSATION"; conversation: Conversation }
  | { type: "UPDATE_COMPANY"; id: string; patch: Partial<Company> };

function reducer(state: StoreState, action: Action): StoreState {
  switch (action.type) {
    case "HYDRATE": {
      const hydratedCompanies = (action.payload.companies ?? state.companies).map((company) => {
        const seed = getCompanyById(company.id);
        const name = company.name.trim().toLocaleLowerCase("es");
        if (seed && company.id === "gen-envaplast" && name === "envaplast srl") {
          return {
            ...company,
            authEmail: company.authEmail ?? seed.authEmail,
            authPassword: company.authPassword ?? seed.authPassword,
            name: seed.name,
            logoInitials: seed.logoInitials,
            contactPhotoUrl: seed.contactPhotoUrl,
            bio: seed.bio,
            verified: seed.verified,
            address: company.address === "Parque Industrial, Manzana 12" ? seed.address : company.address,
            phone: company.phone === "+591 700 11 222" ? seed.phone : company.phone,
            contactName: company.contactName === "Marcelo Rojas" ? seed.contactName : company.contactName,
          };
        }
        return {
          ...company,
          authEmail: company.authEmail ?? seed?.authEmail,
          authPassword: company.authPassword ?? seed?.authPassword,
          name: name === "fudnares" ? "Fundares" : company.name,
          accountType: company.role === "BUYER" ? "COMPANY" as const : company.accountType,
        };
      });
      const notifications = (action.payload.notifications ?? state.notifications).map((notification) =>
        notification.body.includes("Envaplast SRL")
          ? { ...notification, body: notification.body.replace("Envaplast SRL", "Matriplast") }
          : notification,
      );
      return { ...state, ...action.payload, companies: hydratedCompanies, notifications, hydrated: true };
    }
    case "LOGIN":
      return { ...state, currentCompanyId: action.companyId };
    case "LOGOUT":
      return { ...state, currentCompanyId: null };
    case "REGISTER_COMPANY":
      return {
        ...state,
        companies: [...state.companies, action.company],
        currentCompanyId: action.company.id,
      };
    case "UPDATE_COMPANY":
      return {
        ...state,
        companies: state.companies.map((c) => (c.id === action.id ? { ...c, ...action.patch } : c)),
      };
    case "ADD_MATERIAL":
      return { ...state, materials: [action.material, ...state.materials] };
    case "UPDATE_MATERIAL":
      return {
        ...state,
        materials: state.materials.map((m) => (m.id === action.id ? { ...m, ...action.patch } : m)),
      };
    case "ADD_REQUIREMENT":
      return { ...state, requirements: [action.requirement, ...state.requirements] };
    case "UPDATE_REQUIREMENT":
      return {
        ...state,
        requirements: state.requirements.map((r) => (r.id === action.id ? { ...r, ...action.patch } : r)),
      };
    case "SET_MATCH_STATUS":
      return { ...state, matchOverrides: { ...state.matchOverrides, [action.key]: action.status } };
    case "TOGGLE_SAVED_MATCH": {
      const has = state.savedMatchKeys.includes(action.key);
      return {
        ...state,
        savedMatchKeys: has
          ? state.savedMatchKeys.filter((k) => k !== action.key)
          : [...state.savedMatchKeys, action.key],
      };
    }
    case "MARK_NOTIFICATION_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) => (n.id === action.id ? { ...n, read: true } : n)),
      };
    case "MARK_ALL_NOTIFICATIONS_READ":
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) };
    case "ENSURE_CONVERSATION": {
      const exists = state.conversations.some((c) => c.id === action.conversation.id);
      if (exists) return state;
      return { ...state, conversations: [...state.conversations, action.conversation] };
    }
    case "SEND_MESSAGE": {
      const msg: ChatMessage = {
        id: `msg-${Date.now()}`,
        conversationId: action.conversationId,
        senderCompanyId: state.currentCompanyId ?? "unknown",
        text: action.text,
        createdAt: new Date().toISOString(),
      };
      return {
        ...state,
        messages: [...state.messages, msg],
        conversations: state.conversations.map((c) =>
          c.id === action.conversationId ? { ...c, lastMessageAt: msg.createdAt } : c,
        ),
      };
    }
    default:
      return state;
  }
}

interface StoreContextValue {
  state: StoreState;
  dispatch: React.Dispatch<Action>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        dispatch({ type: "HYDRATE", payload: parsed });
      } else {
        dispatch({ type: "HYDRATE", payload: {} });
      }
    } catch {
      dispatch({ type: "HYDRATE", payload: {} });
    }
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    try {
      const { hydrated, ...persisted } = state;
      void hydrated;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    } catch {
      // ignore quota errors in demo mode
    }
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function useCurrentCompany(): Company | null {
  const { state } = useStore();
  return useMemo(
    () => state.companies.find((c) => c.id === state.currentCompanyId) ?? null,
    [state.companies, state.currentCompanyId],
  );
}

export function matchKey(materialId: string, requirementId: string) {
  return `${materialId}__${requirementId}`;
}

export function useStoreActions() {
  const { dispatch } = useStore();
  return {
    login: useCallback((companyId: string) => dispatch({ type: "LOGIN", companyId }), [dispatch]),
    logout: useCallback(() => dispatch({ type: "LOGOUT" }), [dispatch]),
    registerCompany: useCallback((company: Company) => dispatch({ type: "REGISTER_COMPANY", company }), [dispatch]),
    updateCompany: useCallback(
      (id: string, patch: Partial<Company>) => dispatch({ type: "UPDATE_COMPANY", id, patch }),
      [dispatch],
    ),
    addMaterial: useCallback((material: Material) => dispatch({ type: "ADD_MATERIAL", material }), [dispatch]),
    updateMaterial: useCallback(
      (id: string, patch: Partial<Material>) => dispatch({ type: "UPDATE_MATERIAL", id, patch }),
      [dispatch],
    ),
    addRequirement: useCallback(
      (requirement: Requirement) => dispatch({ type: "ADD_REQUIREMENT", requirement }),
      [dispatch],
    ),
    updateRequirement: useCallback(
      (id: string, patch: Partial<Requirement>) => dispatch({ type: "UPDATE_REQUIREMENT", id, patch }),
      [dispatch],
    ),
    setMatchStatus: useCallback(
      (key: string, status: MatchStatus) => dispatch({ type: "SET_MATCH_STATUS", key, status }),
      [dispatch],
    ),
    toggleSavedMatch: useCallback((key: string) => dispatch({ type: "TOGGLE_SAVED_MATCH", key }), [dispatch]),
    markNotificationRead: useCallback((id: string) => dispatch({ type: "MARK_NOTIFICATION_READ", id }), [dispatch]),
    markAllNotificationsRead: useCallback(() => dispatch({ type: "MARK_ALL_NOTIFICATIONS_READ" }), [dispatch]),
    ensureConversation: useCallback(
      (conversation: Conversation) => dispatch({ type: "ENSURE_CONVERSATION", conversation }),
      [dispatch],
    ),
    sendMessage: useCallback(
      (conversationId: string, text: string) => dispatch({ type: "SEND_MESSAGE", conversationId, text }),
      [dispatch],
    ),
  };
}
