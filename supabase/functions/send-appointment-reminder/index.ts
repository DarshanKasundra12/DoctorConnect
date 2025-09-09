// Supabase Edge Function: send-appointment-reminder
// Uses Resend to send simple text email reminders

// deno-lint-ignore no-explicit-any
type ReminderRequest = { to: string; subject: string; text: string } & Record<string, any>

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    if (req.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      return json({ error: "Missing RESEND_API_KEY" }, 500);
    }

    const body = (await req.json()) as ReminderRequest;
    const { to, subject, text } = body || {};

    if (!to || !subject || !text) {
      return json({ error: "Missing required fields: to, subject, text" }, 400);
    }

    const fromAddress = Deno.env.get("RESEND_FROM") || "no-reply@vita-hub.example";

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [to],
        subject,
        text,
      }),
    });

    const payload = await safeJson(resendResponse);

    if (!resendResponse.ok) {
      return json({ error: "Resend API error", details: payload }, resendResponse.status);
    }

    return json({ ok: true, id: payload?.id ?? null });
  } catch (err) {
    return json({ error: "Unhandled error", details: String(err) }, 500);
  }
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch (_) {
    return null;
  }
}


