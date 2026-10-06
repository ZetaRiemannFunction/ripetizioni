import React, { useEffect, useState } from "react";
import { Package as PackageIcon, Check, ArrowRight, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { computePrice, PACCHETTI, computePackagePrice } from "@/lib/tutoring";

export default function PackagePurchase({ student, onPurchased }) {
  const [myPackages, setMyPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);

  async function load() {
    if (!student) return;
    try {
      const res = await base44.entities.Package.filter({ student_id: student.id }, { sort: "-data_acquisto", limit: 20 });
      setMyPackages(res.items || []);
    } catch (e) {
      setMyPackages([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    load();
  }, [student]);

  const prezzoOra = computePrice(student?.tipologia, "individuale");

  async function buy(tier) {
    setError("");
    setBuying(tier.ore);
    try {
      const totale = computePackagePrice(prezzoOra, tier.ore, tier.sconto);
      await base44.entities.Package.create({
        student_id: student.id,
        nome_studente: `${student.nome} ${student.cognome}`,
        telefono_studente: student.telefono,
        ore_totali: tier.ore,
        ore_residuali: tier.ore,
        sconto_pct: tier.sconto,
        prezzo_ora: prezzoOra,
        prezzo_totale: totale,
        data_acquisto: new Date().toISOString().split("T")[0],
        status: "attivo",
      });
      setDone({ ore: tier.ore, totale });
      onPurchased && onPurchased();
      load();
    } catch (e) {
      setError("Errore nell'acquisto. Riprova.");
    } finally {
      setBuying(null);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h3 className="flex items-center gap-2 font-heading text-2xl text-foreground">
        <PackageIcon className="h-5 w-5 text-primary" /> Pacchetti di lezioni
      </h3>
      <p className="mt-1 text-sm text-foreground/60">
        Prepaghi un blocco di ore e risparmi. Le usi quando vuoi, una alla volta o più insieme. Pagamento concordato con il tutor.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {PACCHETTI.map((t) => {
          const totale = computePackagePrice(prezzoOra, t.ore, t.sconto);
          const full = prezzoOra * t.ore;
          const highlight = t.ore === 20;
          return (
            <button
              key={t.ore}
              disabled={buying !== null}
              onClick={() => buy(t)}
              className={highlight
                ? "rounded-xl border-2 border-primary bg-primary/5 p-4 text-left disabled:opacity-50"
                : "rounded-xl border border-border bg-background p-4 text-left hover:border-primary/50 disabled:opacity-50"}
            >
              <p className="font-heading text-2xl text-foreground">{t.ore} ore</p>
              <p className="text-sm font-medium text-primary">-{t.sconto}%</p>
              <p className="mt-2 font-heading text-xl text-foreground">{totale}€</p>
              <p className="text-xs text-foreground/40 line-through">{full}€</p>
              <p className="mt-2 text-xs text-foreground/50">{buying === t.ore ? "Creazione..." : "Acquista"}</p>
            </button>
          );
        })}
      </div>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      {done && (
        <div className="mt-4 rounded-xl border border-success/30 bg-success/5 p-4 text-sm text-foreground">
          <span className="flex items-center gap-2 font-medium"><Check className="h-4 w-4 text-success" /> Pacchetto da {done.ore} ore attivato ({done.totale}€). Usa le ore prenotando una lezione e scegliendo "Pacchetto" come pagamento.</span>
        </div>
      )}

      {myPackages.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground/50">I tuoi pacchetti</p>
          <div className="space-y-2">
            {myPackages.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-border/60 bg-background px-3 py-2.5 text-sm">
                <span className="flex items-center gap-2 text-foreground">
                  <Clock className="h-4 w-4 text-primary" /> {p.ore_totali} ore · -{p.sconto_pct}%
                </span>
                <span className={p.status === "attivo" ? "font-medium text-foreground" : "text-foreground/40"}>
                  {p.ore_residuali} ore residue {p.status === "esaurito" && "· esaurito"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}