import React, { useEffect, useState } from "react";
import { Video, Save, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function SettingsManager({ pin }) {
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.entities.Location.filter({ chiave: "online" }, { limit: 1 });
        setLink(res.items?.[0]?.link_meet || "");
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
      await base44.functions.invoke("saveSettings", { pin, link_meet: link.trim() });
      setMsg("Link salvato");
    } catch (e) {
      setMsg("Errore nel salvataggio");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h2 className="flex items-center gap-2 font-heading text-2xl text-foreground">
        <Video className="h-5 w-5 text-primary" /> Aula virtuale
      </h2>
      <p className="mt-1 text-sm text-foreground/60">
        Link della stanza Google Meet (o Teams) mostrato agli studenti quando prenotano una lezione online.
        Crea una stanza ricorrente su Meet e incolla qui il link.
      </p>
      {loading ? (
        <p className="mt-4 text-sm text-foreground/50">Caricamento...</p>
      ) : (
        <>
          <label className="mt-5 block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/50">Link dell'aula</span>
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
              className="h-11 w-full rounded-lg border border-border bg-background px-3 text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </label>
          <button
            onClick={save}
            disabled={saving}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Salvataggio..." : "Salva link"} <Save className="h-4 w-4" />
          </button>
          {msg && (
            <p className={`mt-3 flex items-center gap-1.5 text-sm ${msg === "Link salvato" ? "text-success" : "text-destructive"}`}>
              {msg === "Link salvato" && <Check className="h-4 w-4" />} {msg}
            </p>
          )}
        </>
      )}
    </div>
  );
}