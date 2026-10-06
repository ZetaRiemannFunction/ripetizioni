import React, { useState } from "react";
import { Phone, User, ArrowRight, LogOut } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { currentSchoolYear, computeCurrentAnno, TIPOLOGIE_LABEL } from "@/lib/tutoring";

export default function StudentAuth({ onAuth }) {
  const [step, setStep] = useState("phone"); // phone | register | profile
  const [telefono, setTelefono] = useState("");
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // registration fields
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [scuola, setScuola] = useState("superiore");
  const [tipologia, setTipologia] = useState("liceo_scientifico");
  const [anno, setAnno] = useState(1);

  async function lookup() {
    setError("");
    if (!telefono.trim()) {
      setError("Inserisci il tuo numero di telefono");
      return;
    }
    setLoading(true);
    try {
      const res = await base44.entities.Student.filter({ telefono: telefono.trim() }, { limit: 1 });
      if (res.items && res.items.length > 0) {
        setStudent(res.items[0]);
        setStep("profile");
        onAuth && onAuth(res.items[0]);
      } else {
        setStep("register");
      }
    } catch (e) {
      setError("Errore di ricerca. Riprova.");
    } finally {
      setLoading(false);
    }
  }

  async function register() {
    setError("");
    if (!nome.trim() || !cognome.trim() || !telefono.trim()) {
      setError("Compila tutti i campi");
      return;
    }
    setLoading(true);
    try {
      const created = await base44.entities.Student.create({
        nome: nome.trim(),
        cognome: cognome.trim(),
        telefono: telefono.trim(),
        scuola,
        tipologia: scuola === "media" ? "media" : tipologia,
        anno: Number(anno),
        anno_scolastico_registrazione: currentSchoolYear(),
      });
      setStudent(created);
      setStep("profile");
      onAuth && onAuth(created);
    } catch (e) {
      setError("Errore nella registrazione. Riprova.");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setStudent(null);
    setStep("phone");
    setTelefono("");
    onAuth && onAuth(null);
  }

  if (step === "profile" && student) {
    const annoNow = computeCurrentAnno(student);
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <User className="h-5 w-5" />
          </span>
          <div>
            <p className="font-heading text-xl text-foreground">{student.nome} {student.cognome}</p>
            <p className="text-sm text-foreground/60">
              {TIPOLOGIE_LABEL[student.tipologia] || student.tipologia} · Anno {annoNow}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-primary"
        >
          <LogOut className="h-4 w-4" /> Esci e cambia utente
        </button>
      </div>
    );
  }

  if (step === "register") {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="font-heading text-2xl text-foreground">Crea il tuo profilo</h3>
        <p className="mt-1 text-sm text-foreground/60">
          Telefono: {telefono} · lo userai per accedere in futuro
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Nome">
            <input value={nome} onChange={(e) => setNome(e.target.value)} className={inputCls} placeholder="Mario" />
          </Field>
          <Field label="Cognome">
            <input value={cognome} onChange={(e) => setCognome(e.target.value)} className={inputCls} placeholder="Rossi" />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Scuola">
            <div className="flex gap-2">
              {["media", "superiore"].map((s) => (
                <Chip key={s} active={scuola === s} onClick={() => { setScuola(s); if (s === "media") setTipologia("media"); }}>
                  {s === "media" ? "Media" : "Superiore"}
                </Chip>
              ))}
            </div>
          </Field>
        </div>
        {scuola === "superiore" && (
          <div className="mt-4">
            <Field label="Tipologia">
              <div className="flex flex-wrap gap-2">
                {Object.entries(TIPOLOGIE_LABEL).filter(([k]) => k !== "media").map(([k, label]) => (
                  <Chip key={k} active={tipologia === k} onClick={() => setTipologia(k)}>{label}</Chip>
                ))}
              </div>
            </Field>
          </div>
        )}
        <div className="mt-4">
          <Field label="Anno">
            <select value={anno} onChange={(e) => setAnno(e.target.value)} className={inputCls}>
              {scuola === "media"
                ? [1, 2, 3].map((n) => <option key={n} value={n}>{n}°</option>)
                : [1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}°</option>)}
            </select>
          </Field>
          <p className="mt-1 text-xs text-foreground/50">
            L'anno si aggiornerà automaticamente a settembre di ogni anno.
          </p>
        </div>
        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
        <button
          onClick={register}
          disabled={loading}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Creazione..." : "Crea profilo e prenota"} <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h3 className="font-heading text-2xl text-foreground">Accedi o registrati</h3>
      <p className="mt-1 text-sm text-foreground/60">
        Inserisci il tuo numero di telefono per prenotare le lezioni.
      </p>
      <div className="mt-5">
        <Field label="Numero di telefono">
          <div className="flex items-center gap-2">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-muted text-foreground/60">
              <Phone className="h-5 w-5" />
            </span>
            <input
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && lookup()}
              className={inputCls}
              placeholder="333 1234567"
            />
          </div>
        </Field>
      </div>
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      <button
        onClick={lookup}
        disabled={loading}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Ricerca..." : "Continua"} <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

const inputCls = "h-11 w-full rounded-lg border border-border bg-background px-3 text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary";

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/50">{label}</span>
      {children}
    </label>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={active
        ? "rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        : "rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground/70 hover:border-primary"}
    >
      {children}
    </button>
  );
}