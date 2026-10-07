import React, { useEffect, useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { GIORNI } from "@/lib/tutoring";

const DAYS = [1, 2, 3, 4, 5, 6, 0]; // lun→dom

export default function AvailabilityEditor({ pin }) {
  const [tutors, setTutors] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState("");
  const [ranges, setRanges] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.entities.Tutor.filter({}, { sort: "ordine", limit: 10, fields: ["nome", "ordine"] });
        const items = res.items || [];
        setTutors(items);
        if (items.length > 0) setSelectedTutor(items[0].nome);
      } catch (e) {
        /* ignore */
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!selectedTutor) return;
    setLoading(true);
    (async () => {
      try {
        const res = await base44.entities.Availability.filter({ tutor_nome: selectedTutor }, { limit: 100 });
        const map = {};
        (res.items || []).forEach((a) => {
          if (!map[a.giorno_settimana]) map[a.giorno_settimana] = [];
          map[a.giorno_settimana].push({ ora_inizio: a.ora_inizio, ora_fine: a.ora_fine });
        });
        setRanges(map);
      } catch (e) {
        setRanges({});
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedTutor]);

  function addRange(giorno) {
    setRanges((prev) => ({
      ...prev,
      [giorno]: [...(prev[giorno] || []), { ora_inizio: "16:00", ora_fine: "19:00" }],
    }));
  }

  function updateRange(giorno, idx, field, value) {
    setRanges((prev) => {
      const arr = [...(prev[giorno] || [])];
      arr[idx] = { ...arr[idx], [field]: value };
      return { ...prev, [giorno]: arr };
    });
  }

  function removeRange(giorno, idx) {
    setRanges((prev) => {
      const arr = [...(prev[giorno] || [])];
      arr.splice(idx, 1);
      return { ...prev, [giorno]: arr };
    });
  }

  async function save() {
    setSaving(true);
    setMsg("");
    const items = [];
    Object.entries(ranges).forEach(([giorno, arr]) => {
      arr.forEach((r) => {
        items.push({ giorno_settimana: Number(giorno), ora_inizio: r.ora_inizio, ora_fine: r.ora_fine });
      });
    });
    try {
      await base44.functions.invoke("saveAvailability", { pin, tutor_nome: selectedTutor, availability: items });
      setMsg("Disponibilità salvata ✓");
    } catch (e) {
      setMsg("Errore nel salvataggio");
    } finally {
      setSaving(false);
    }
  }

  if (loading && !selectedTutor) return <p className="text-foreground/50">Caricamento...</p>;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-3xl text-foreground">Disponibilità settimanale</h2>
          <p className="mt-1 text-sm text-foreground/60">Imposta gli orari di ciascun tutor. Gli studenti vedono tutti gli slot in cui almeno un tutor è libero.</p>
        </div>
        {tutors.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tutors.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTutor(t.nome)}
                className={selectedTutor === t.nome
                  ? "rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                  : "rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground/70 hover:border-primary"}
              >
                {t.nome}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedTutor && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-foreground/60">Stai modificando: <span className="font-medium text-foreground">{selectedTutor}</span></p>
          <button onClick={save} disabled={saving} className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">
            <Save className="h-4 w-4" /> {saving ? "Salvataggio..." : "Salva"}
          </button>
        </div>
      )}

      {msg && <p className="mb-4 text-sm font-medium text-success">{msg}</p>}

      <div className="space-y-3">
        {DAYS.map((g) => (
          <div key={g} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-xl text-foreground">{GIORNI[g]}</h3>
              <button onClick={() => addRange(g)} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                <Plus className="h-4 w-4" /> Aggiungi fascia
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {(ranges[g] || []).length === 0 && <p className="text-sm text-foreground/40">Non disponibile</p>}
              {(ranges[g] || []).map((r, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-sm text-foreground/60">dalle</span>
                  <input type="time" value={r.ora_inizio} onChange={(e) => updateRange(g, idx, "ora_inizio", e.target.value)} className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm" />
                  <span className="text-sm text-foreground/60">alle</span>
                  <input type="time" value={r.ora_fine} onChange={(e) => updateRange(g, idx, "ora_fine", e.target.value)} className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm" />
                  <button onClick={() => removeRange(g, idx)} className="ml-1 text-destructive hover:text-destructive/80">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}