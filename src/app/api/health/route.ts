export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    { status: "ok", service: "acm-training-agent" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
