// Edge Functions main entry point for Supabase Edge Runtime
// See: https://supabase.com/docs/guides/functions

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const path = url.pathname;

  // Health check
  if (path === "/" || path === "/health") {
    return new Response(JSON.stringify({ status: "ok" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // Route to specific functions
  if (path.startsWith("/telegram-webhook")) {
    const mod = await import("../telegram-webhook/index.ts");
    return mod.default(req);
  }

  if (path.startsWith("/google-calendar-sync")) {
    const mod = await import("../google-calendar-sync/index.ts");
    return mod.default(req);
  }

  return new Response("Not Found", { status: 404 });
});
