"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCurrentCompany, useStore, useStoreActions } from "@/lib/store";
import { getCompanyById } from "@/data/companies";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, MessageSquare, Send } from "lucide-react";
import { formatRelativeDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CompanyAvatar } from "@/components/shared/company-avatar";

export function MessagesView() {
  const company = useCurrentCompany();
  const { state } = useStore();
  const { sendMessage } = useStoreActions();
  const router = useRouter();
  const params = useSearchParams();
  const [draft, setDraft] = useState("");

  const myConversations = useMemo(
    () => state.conversations.filter((c) => company && c.participantIds.includes(company.id)),
    [state.conversations, company],
  );

  const activeId = params.get("conversation") ?? myConversations[0]?.id ?? null;
  const activeConversation = myConversations.find((c) => c.id === activeId) ?? null;

  useEffect(() => {
    if (!params.get("conversation") && myConversations[0]) {
      router.replace(`/messages?conversation=${myConversations[0].id}` as never);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myConversations.length]);

  if (!company) return null;

  const messages = activeConversation
    ? state.messages
        .filter((m) => m.conversationId === activeConversation.id)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    : [];

  function otherParty(convParticipantIds: string[]) {
    const otherId = convParticipantIds.find((id) => id !== company!.id);
    return otherId ? getCompanyById(otherId) ?? state.companies.find((c) => c.id === otherId) : null;
  }

  function handleSend() {
    if (!draft.trim() || !activeConversation) return;
    sendMessage(activeConversation.id, draft.trim());
    setDraft("");
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Mensajes" subtitle="Conversaciones habilitadas tras un interés mutuo confirmado." />

      {myConversations.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Todavía no tenés conversaciones"
          description="El chat se habilita automáticamente cuando confirmás interés mutuo en un match."
          actionLabel="Ver matches"
          actionHref="/matches"
        />
      ) : (
        <div className="grid overflow-hidden rounded-xl border border-border lg:grid-cols-[300px_1fr]">
          <div className={cn("border-border lg:border-r", activeConversation ? "hidden lg:block" : "block")}>
            {myConversations.map((c) => {
              const other = otherParty(c.participantIds);
              const isActive = c.id === activeId;
              return (
                <button
                  key={c.id}
                  onClick={() => router.push(`/messages?conversation=${c.id}` as never)}
                  className={cn(
                    "flex w-full items-center gap-3 border-b border-border p-3.5 text-left transition-colors",
                    isActive ? "bg-secondary" : "bg-card hover:bg-secondary/50",
                  )}
                >
                  <CompanyAvatar photoUrl={other?.contactPhotoUrl} initials={other?.logoInitials ?? "?"} name={other?.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{other?.name ?? "Empresa"}</p>
                    <p className="text-xs text-muted-foreground">{formatRelativeDate(c.lastMessageAt)}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className={cn("flex flex-col bg-card", activeConversation ? "block" : "hidden lg:flex")}>
            {activeConversation ? (
              <>
                <div className="flex items-center gap-2 border-b border-border p-3.5">
                  <Button size="icon" variant="ghost" className="lg:hidden" onClick={() => router.push("/messages" as never)}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <p className="text-sm font-semibold text-foreground">{otherParty(activeConversation.participantIds)?.name}</p>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto p-4" style={{ minHeight: 320, maxHeight: 480 }}>
                  {messages.map((m) => {
                    const mine = m.senderCompanyId === company.id;
                    return (
                      <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                        <div
                          className={cn(
                            "max-w-[75%] rounded-lg px-3 py-2 text-sm",
                            mine ? "rounded-tr-sm bg-primary text-primary-foreground" : "rounded-tl-sm bg-secondary text-secondary-foreground",
                          )}
                        >
                          {m.text}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 border-t border-border p-3">
                  <Input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Escribí un mensaje..."
                  />
                  <Button size="icon" onClick={handleSend}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center p-10 text-sm text-muted-foreground">
                Seleccioná una conversación
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
