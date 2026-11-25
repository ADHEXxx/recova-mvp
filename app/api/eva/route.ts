import OpenAI from "openai";

export const runtime = "nodejs";
type EvaMessage = { role: "user" | "assistant"; content: string };

function isMessage(value: unknown): value is EvaMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Record<string, unknown>;
  return (message.role === "user" || message.role === "assistant") && typeof message.content === "string";
}

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: "EVA aún no tiene configurada una clave de OpenAI en el servidor." }, { status: 503 });
  }

  let body: { messages?: unknown; context?: unknown };
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 24_000) {
    return Response.json({ error: "La solicitud es demasiado grande." }, { status: 413 });
  }
  try {
    body = (await request.json()) as { messages?: unknown; context?: unknown };
  } catch {
    return Response.json({ error: "La solicitud no es válida." }, { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages.filter(isMessage).slice(-8) : [];
  const contextText = JSON.stringify(body.context ?? {});
  if (!messages.length || messages.some((message) => message.content.length > 600) || contextText.length > 16_000) {
    return Response.json({ error: "Escribí una pregunta de hasta 600 caracteres." }, { status: 400 });
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 20_000, maxRetries: 1 });
    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5-mini",
      store: false,
      max_output_tokens: 600,
      reasoning: { effort: "low" },
      instructions: "Sos EVA, la asistente de Recova, una plataforma boliviana de simbiosis industrial y aprovechamiento de materiales. Respondé siempre en español claro, cercano y profesional, usando voseo. Ayudá a generadores, recolectores, intermediarios y empresas compradoras a valorizar materiales y evaluar oportunidades. Basá la respuesta en el contexto proporcionado; distinguí los datos reales de las recomendaciones. No inventes empresas, precios, certificaciones, normativa ni matches. Si falta información, decilo y sugerí el próximo paso concreto. No des asesoramiento legal ni garantices resultados. Sé breve: máximo 140 palabras, con listas solo cuando realmente ayuden.",
      input: [
        { role: "developer", content: `Contexto actual de la cuenta en Recova:\n${contextText}` },
        ...messages.map((message) => ({ role: message.role, content: message.content })),
      ],
    });
    const answer = response.output_text?.trim();
    if (!answer) throw new Error("empty_response");
    return Response.json({ answer });
  } catch (error) {
    console.error("EVA OpenAI request failed", error);
    return Response.json({ error: "EVA no pudo responder ahora. Revisá la configuración o intentá nuevamente." }, { status: 502 });
  }
}
