import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from "base44:runtime";

export default async function (req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const pin = secrets.get("ADMIN_PIN");
    if (!pin || body.pin !== pin) return Response.json({ error: "Non autorizzato" }, { status: 401 });
    const base44 = createClientFromRequest(req);
    if (!body.bookingId) return Response.json({ error: "bookingId mancante" }, { status: 400 });
    await base44.asServiceRole.entities.Booking.update(body.bookingId, { status: "annullata" });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}