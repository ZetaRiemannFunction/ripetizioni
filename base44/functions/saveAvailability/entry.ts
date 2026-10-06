import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from "base44:runtime";

export default async function (req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const pin = secrets.get("ADMIN_PIN");
    if (!pin || body.pin !== pin) return Response.json({ error: "Non autorizzato" }, { status: 401 });
    const base44 = createClientFromRequest(req);
    // Sostituisce tutta la disponibilità settimanale
    await base44.asServiceRole.entities.Availability.deleteMany({});
    const items = Array.isArray(body.availability) ? body.availability : [];
    if (items.length > 0) {
      await base44.asServiceRole.entities.Availability.bulkCreate(items);
    }
    return Response.json({ ok: true, salvate: items.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}