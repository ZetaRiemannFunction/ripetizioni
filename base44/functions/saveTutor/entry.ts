import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from "base44:runtime";

export default async function (req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const pin = (secrets.get("ADMIN_PIN") || "").trim();
    if (!pin || String(body.pin).trim() !== pin) return Response.json({ error: "Non autorizzato" }, { status: 401 });
    const base44 = createClientFromRequest(req);
    const tutor = body.tutor || {};
    if (tutor.id) {
      const { id, ...data } = tutor;
      await base44.asServiceRole.entities.Tutor.update(id, data);
    } else {
      await base44.asServiceRole.entities.Tutor.create(tutor);
    }
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}