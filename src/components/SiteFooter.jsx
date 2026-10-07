import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Phone, MapPin, Instagram } from "lucide-react";
import ZetaMark from "@/components/ZetaMark";
import { base44 } from "@/api/base44Client";

export default function SiteFooter() {
  const [tutors, setTutors] = useState([]);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [t, l] = await Promise.all([
          base44.entities.Tutor.filter({}, { sort: "ordine", limit: 10 }),
          base44.entities.Location.filter({}, { sort: "ordine", limit: 10 }),
        ]);
        setTutors(t.items || []);
        setLocations(l.items || []);
      } catch (e) {
        /* ignore */
      }
    })();
  }, []);

  return (
    <footer id="contatti" className="bg-onyx text-parchment">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <ZetaMark className="h-5 w-5" />
              </span>
              <span className="font-heading text-xl">Ripetizioni<span className="text-primary">.</span></span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-parchment/70">
              Matematica e Fisica con tutor laureati all'Università di Pisa.
              Lezioni individuali e di gruppo, in presenza.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-parchment/50">Sedi</h3>
            <ul className="mt-4 space-y-3">
              {locations.map((l) => (
                <li key={l.id} className="flex items-start gap-2 text-sm text-parchment/80">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    <span className="font-medium text-parchment">{l.nome}</span>
                    <br />
                    {l.indirizzo || "Indirizzo da definire"}
                  </span>
                </li>
              ))}
              {locations.length === 0 && (
                <li className="text-sm text-parchment/60">Sedi da configurare</li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-parchment/50">Contatti</h3>
            <ul className="mt-4 space-y-3">
              {tutors.map((t) => (
                <li key={t.id} className="flex items-center gap-2 text-sm text-parchment/80">
                  <Phone className="h-4 w-4 shrink-0 text-primary" />
                  <a href={`tel:${t.telefono}`} className="hover:text-primary">
                    {t.nome} — {t.telefono || "—"}
                  </a>
                </li>
              ))}
            </ul>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Instagram className="h-4 w-4" /> Seguici su Instagram
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-parchment/10 pt-6 text-xs text-parchment/50 sm:flex-row">
          <span>© {new Date().getFullYear()} Ripetizioni Matematica & Fisica</span>
          <Link to="/admin" className="hover:text-primary">Area gestione</Link>
        </div>
      </div>
    </footer>
  );
}