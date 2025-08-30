// Supabase Edge Function (Deno) - MOCK
// Retorna {status:"aprovado", score:98} e, se tiver secrets, grava na tabela.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const ALLOWED_ORIGINS = ["*"];            // troque p/ domínio do app em produção
const TABELA_KYC = "kycverificacoes";     // use o nome exato da sua tabela

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors() });

  try {
    if (req.method !== "POST") return json({ error: "Use POST" }, 405);

    const { usuario_id, selfie_url } = await req.json();
    if (!usuario_id || !selfie_url) {
      return json({ error: "Campos obrigatórios: usuario_id, selfie_url" }, 400);
    }

    // resultado simulado
    const status = "aprovado";
    const score = 98;

    // grava no banco SE você já configurar os secrets abaixo
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (SUPABASE_URL && SERVICE_ROLE_KEY) {
      await fetch(`${SUPABASE_URL}/rest/v1/${TABELA_KYC}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SERVICE_ROLE_KEY,
          "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
          "Prefer": "return=representation",
        },
        body: JSON.stringify({
          usuario_id,
          tipo: "selfie",
          arquivo_url: selfie_url,
          status,
          observacao: "MOCK aprovado",
        }),
      });
    }

    return json({ status, score }, 200);
  } catch (e) {
    console.error(e);
    return json({ error: "Erro interno" }, 500);
  }
});

function cors() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.join(","),
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}
function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", ...cors() } });
}
