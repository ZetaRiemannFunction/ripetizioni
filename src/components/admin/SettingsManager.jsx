import React, { useEffect, useState } from "react";
import { Video, Save, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function SettingsManager({ pin }) {
  const [tutors, setTutors] = useState([]);
  const [links, setLinks] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.entities.Tutor.filter({}, { sort: "ordine", limit: 10, fields: ["nome", "ordine", "link_meet"] });
        const items = res.items || [];
        setTutors(items);
        const map = {};
        items.forEach((t) => { map[t.nome] = t.link_meet || ""; });
        setLinks(map);
      } catch (e) {
        /* ignore */
      }
      setLoading(false);
    })();
  }, []);

  async function save() {
    setSaving(true);
    setMsg("");
    try {
      for (const t of tutors) {
        const link = (links[t.nome] || "").trim();
        if ((t.link_meet || "") !== link) {
          await base44.functions.invoke("saveTutor", { pin, tutor: { id: t.id, link_meet: link } });
        }
      }
      setMsg("Link salvati");
    } catch (e) {
      setMsg("Errore nel salvataggio");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h2 className="flex items-center gap-2 font-heading text-2xl text-foreground">
        <Video className="h-5 w-5 text-primary" /> Aule virtuali (Meet)
      </h2>
      <p className="mt-1 text-sm text-foreground/60">
        Ogni tutor ha la sua aula virtuale Google Meet. Crea una stanza ricorrente su Meet per ciascun tutor e incolla qui il link: viene mostrato agli studenti quando prenotano una lezione online con quel tutor.
      </p>
      {loading ? (
        <p className="mt-4 text-sm text-foreground/50">Caricamento...</p>
      ) : (
        <>
          <div className="mt-5 space-y-4">
            {tutors.map((t) => (
              <label key={t.id} className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/50">Aula di {t.nome}</span>
                <input
                  value={links[t.nome] || ""}
                  onChange={(e) => setLinks((prev) => ({ ...prev, [t.nome]: e.target.value }))}
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  className="h-11 w-full rounded-lg border border-border bg-background px-3 text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </label>
            ))}
            {tutors.length === 0 && <p className="text-sm text-foreground/50">Nessun tutor. Aggiungili dalla scheda Tutor.</p>}
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Salvataggio..." : "Salva link"} <Save className="h-4 w-4" />
          </button>
          {msg && (
            <p className={`mt-3 flex items-center gap-1.5 text-sm ${msg === "Link salvati" ? "text-success" : "text-destructive"}`}>
              {msg === "Link salvati" && <Check className="h-4 w-4" />} {msg}
            </p>
          )}
        </>
      )}
    </div>
  );
}