import React, { useEffect, useState } from "react";
import { Save, Upload, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";

export default function TutorManager({ pin }) {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.entities.Tutor.filter({}, { sort: "ordine", limit: 10 });
        setTutors(res.items || []);
      } catch (e) {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function update(id, field, value) {
    setTutors((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  }

  async function uploadPhoto(id, file) {
    if (!file) return;
    setUploadingId(id);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      update(id, "foto_url", file_url);
    } catch (e) {
      alert("Errore nel caricamento della foto");
    } finally {
      setUploadingId(null);
    }
  }

  async function save(id) {
    setSavingId(id);
    const t = tutors.find((x) => x.id === id);
    try {
      await base44.functions.invoke("saveTutor", { pin, tutor: t });
    } catch (e) {
      alert("Errore nel salvataggio");
    } finally {
      setSavingId(null);
    }
  }

  if (loading) return <p className="text-foreground/50">Caricamento...</p>;

  return (
    <div>
      <h2 className="mb-1 font-heading text-3xl text-foreground">Gestione tutor</h2>
      <p className="mb-6 text-sm text-foreground/60">Modifica le informazioni e carica le foto dei tutor. Le foto sono mostrate pubblicamente sulla home.</p>

      <div className="space-y-5">
        {tutors.map((t) => (
          <div key={t.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex flex-col gap-5 sm:flex-row">
              <div className="shrink-0">
                <div className="h-40 w-32 overflow-hidden rounded-xl border border-border bg-muted">
                  {t.foto_url ? (
                    <Image src={t.foto_url} alt={t.nome} fittingType="fill" className="h-full w-full" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-foreground/30 text-xs text-center px-2">Nessuna foto</div>
                  )}
                </div>
                <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:border-primary">
                  {uploadingId === t.id ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Caricamento...</> : <><Upload className="h-3.5 w-3.5" /> Carica foto</>}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadPhoto(t.id, e.target.files?.[0])} disabled={uploadingId === t.id} />
                </label>
              </div>
              <div className="flex-1 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Labeled label="Nome">
                    <input value={t.nome || ""} onChange={(e) => update(t.id, "nome", e.target.value)} className={inp} />
                  </Labeled>
                  <Labeled label="Telefono">
                    <input value={t.telefono || ""} onChange={(e) => update(t.id, "telefono", e.target.value)} className={inp} />
                  </Labeled>
                </div>
                <Labeled label="Laurea / Percorso">
                  <input value={t.laurea || ""} onChange={(e) => update(t.id, "laurea", e.target.value)} className={inp} placeholder="es. Laurea triennale in Fisica — Unipi" />
                </Labeled>
                <Labeled label="Materia principale">
                  <input value={t.materia || ""} onChange={(e) => update(t.id, "materia", e.target.value)} className={inp} placeholder="es. Matematica e Fisica" />
                </Labeled>
                <Labeled label="Bio">
                  <textarea value={t.bio || ""} onChange={(e) => update(t.id, "bio", e.target.value)} rows={2} className={inp} placeholder="Breve presentazione" />
                </Labeled>
                <button onClick={() => save(t.id)} disabled={savingId === t.id} className="flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">
                  <Save className="h-4 w-4" /> {savingId === t.id ? "Salvataggio..." : "Salva"}
                </button>
              </div>
            </div>
          </div>
        ))}
        {tutors.length === 0 && <p className="text-foreground/50">Nessun tutor. Verranno creati automaticamente.</p>}
      </div>
    </div>
  );
}

const inp = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";

function Labeled({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-foreground/50">{label}</span>
      {children}
    </label>
  );
}