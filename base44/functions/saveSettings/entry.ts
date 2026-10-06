import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from "base44:runtime";

export default async function (req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const pin = secrets.get("ADMIN_PIN");
    if (!pin || body.pin !== pin) return Response.json({ error: "Non autorizzato" }, { status: 401 });
    const base44 = createClientFromRequest(req);
    const res = await base44.asServiceRole.entities.Location.filter({ chiave: "online" }, { limit: 1 });
    const items = res.items || [];
    if (items.length === 0) return Response.json({ error: "Sede online non trovata" }, { status: 404 });
    await base44.asServiceRole.entities.Location.update(items[0].id, { link_meet: body.link_meet || "" });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}