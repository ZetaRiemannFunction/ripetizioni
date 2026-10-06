import { secrets } from "base44:runtime";

export default async function (req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const pin = secrets.get("ADMIN_PIN");
    if (!pin) return Response.json({ ok: false, error: "PIN non configurato" }, { status: 500 });
    if (body && body.pin === pin) return Response.json({ ok: true });
    return Response.json({ ok: false }, { status: 401 });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}