import React, { useEffect, useState } from "react";
import { Save, Phone } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { computeCurrentAnno, TIPOLOGIE_LABEL } from "@/lib/tutoring";

export default function StudentList({ pin }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [overrideValue, setOverrideValue] = useState("");
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.entities.Student.filter({}, { sort: "-created_date", limit: 200 });
        setStudents(res.items || []);
      } catch (e) {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function saveOverride(s) {
    setSavingId(s.id);
    try {
      const anno_override = overrideValue === "" ? null : Number(overrideValue);
      await base44.functions.invoke("saveStudent", { pin, student: { id: s.id, anno_override } });
      setStudents((prev) => prev.map((x) => (x.id === s.id ? { ...x, anno_override } : x)));
      setEditingId(null);
    } catch (e) {
      alert("Errore nel salvataggio");
    } finally {
      setSavingId(null);
    }
  }

  if (loading) return <p className="text-foreground/50">Caricamento...</p>;

  return (
    <div>
      <h2 className="mb-1 font-heading text-3xl text-foreground">Studenti iscritti</h2>
      <p className="mb-6 text-sm text-foreground/60">
        L'anno si aggiorna automaticamente a settembre. Puoi modificarlo manualmente per casi particolari.
      </p>

      {students.length === 0 ? (
        <p className="rounded-xl border border-border bg-card p-8 text-center text-foreground/50">Nessuno studente iscritto.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-foreground/50">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Telefono</th>
                <th className="px-4 py-3">Scuola</th>
                <th className="px-4 py-3">Anno</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {students.map((s) => {
                const annoNow = computeCurrentAnno(s);
                const editing = editingId === s.id;
                return (
                  <tr key={s.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium text-foreground">{s.nome} {s.cognome}</td>
                    <td className="px-4 py-3 text-foreground/70">
                      <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-primary" /> {s.telefono}</span>
                    </td>
                    <td className="px-4 py-3 text-foreground/70">{TIPOLOGIE_LABEL[s.tipologia] || s.tipologia}</td>
                    <td className="px-4 py-3">
                      {editing ? (
                        <span className="flex items-center gap-1">
                          <input
                            type="number"
                            value={overrideValue}
                            onChange={(e) => setOverrideValue(e.target.value)}
                            placeholder={String(annoNow)}
                            className="w-16 rounded border border-border bg-background px-2 py-1 text-sm"
                          />
                          <button onClick={() => saveOverride(s)} disabled={savingId === s.id} className="text-primary hover:opacity-70">
                            <Save className="h-4 w-4" />
                          </button>
                        </span>
                      ) : (
                        <span className="text-foreground">
                          {annoNow}°
                          {s.anno_override != null && <span className="ml-1 text-xs text-primary">(manuale)</span>}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!editing && (
                        <button onClick={() => { setEditingId(s.id); setOverrideValue(s.anno_override != null ? String(s.anno_override) : ""); }} className="text-xs font-medium text-primary hover:underline">
                          Modifica anno
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}