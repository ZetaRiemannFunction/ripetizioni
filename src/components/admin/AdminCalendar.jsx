import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X, MapPin, Clock, User, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { formatDateIt, GIORNI } from "@/lib/tutoring";

export default function AdminCalendar({ pin }) {
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day; // lunedì
    d.setDate(d.getDate() + diff);
    return d;
  });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState({});

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  async function load() {
    setLoading(true);
    const start = weekDates[0].toISOString().split("T")[0];
    const end = weekDates[6].toISOString().split("T")[0];
    try {
      const [bRes, lRes] = await Promise.all([
        base44.entities.Booking.filter({ data: { $gte: start, $lte: end }, status: "confermata" }, { sort: "data", limit: 200, fields: ["data", "ora_inizio", "materia", "location", "tipo_lezione", "prezzo", "nome_studente", "telefono_studente", "student_id"] }),
        base44.entities.Location.filter({}, { limit: 10 }),
      ]);
      setBookings(bRes.items || []);
      const map = {};
      (lRes.items || []).forEach((l) => (map[l.chiave] = l.nome));
      setLocations(map);
    } catch (e) {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [weekStart]);

  async function cancel(id) {
    if (!confirm("Annullare questa prenotazione?")) return;
    try {
      await base44.functions.invoke("cancelBooking", { pin, bookingId: id });
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch (e) {
      alert("Errore nell'annullamento");
    }
  }

  const byDay = weekDates.map((d) => {
    const iso = d.toISOString().split("T")[0];
    return { date: d, iso, items: bookings.filter((b) => b.data === iso) };
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-heading text-3xl text-foreground">Calendario completo</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); }} className="rounded-lg border border-border p-2 hover:border-primary">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium text-foreground/70">
            {weekDates[0].toLocaleDateString("it-IT", { day: "numeric", month: "short" })} – {weekDates[6].toLocaleDateString("it-IT", { day: "numeric", month: "short" })}
          </span>
          <button onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); }} className="rounded-lg border border-border p-2 hover:border-primary">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-foreground/50">Caricamento...</p>
      ) : bookings.length === 0 ? (
        <p className="rounded-xl border border-border bg-card p-8 text-center text-foreground/50">
          Nessuna lezione prenotata per questa settimana.
        </p>
      ) : (
        <div className="space-y-4">
          {byDay.map(({ date, iso, items }) => (
            <div key={iso} className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <h3 className="mb-3 font-heading text-xl text-foreground capitalize">
                {GIORNI[date.getDay()]} {date.getDate()} {date.toLocaleDateString("it-IT", { month: "long" })}
                <span className="ml-2 text-sm font-normal text-foreground/50">{items.length} lezione/i</span>
              </h3>
              {items.length === 0 ? (
                <p className="text-sm text-foreground/40">—</p>
              ) : (
                <div className="space-y-2">
                  {items.sort((a, b) => a.ora_inizio.localeCompare(b.ora_inizio)).map((b) => (
                    <div key={b.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-background px-3 py-2.5">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                        <span className="flex items-center gap-1.5 font-semibold text-foreground">
                          <Clock className="h-4 w-4 text-primary" /> {b.ora_inizio}
                        </span>
                        <span className="flex items-center gap-1.5 text-foreground/80">
                          {b.tipo_lezione === "individuale" ? <User className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                          {b.nome_studente}
                        </span>
                        <span className="text-foreground/60">{b.materia === "matematica" ? "Matematica" : "Fisica"}</span>
                        <span className="flex items-center gap-1.5 text-foreground/60">
                          <MapPin className="h-3.5 w-3.5" /> {locations[b.location] || b.location}
                        </span>
                        <span className="text-foreground/60">{b.prezzo}€</span>
                      </div>
                      <button onClick={() => cancel(b.id)} className="flex items-center gap-1 text-xs font-medium text-destructive hover:underline">
                        <X className="h-3.5 w-3.5" /> Annulla
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}