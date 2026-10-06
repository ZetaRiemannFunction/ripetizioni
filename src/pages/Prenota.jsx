import React, { useEffect, useState } from "react";
import { Calendar, ArrowRight, Video, Wallet } from "lucide-react";
import SiteNavbar from "@/components/SiteNavbar";
import SiteFooter from "@/components/SiteFooter";
import StudentAuth from "@/components/StudentAuth";
import BookingForm from "@/components/BookingForm";
import PackagePurchase from "@/components/PackagePurchase";
import { base44 } from "@/api/base44Client";
import { formatDateIt } from "@/lib/tutoring";

export default function Prenota() {
  const [student, setStudent] = useState(null);
  const [myBookings, setMyBookings] = useState([]);
  const [packages, setPackages] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  async function loadPackages() {
    if (!student) return;
    try {
      const res = await base44.entities.Package.filter({ student_id: student.id }, { sort: "-data_acquisto", limit: 20 });
      setPackages(res.items || []);
    } catch (e) {
      setPackages([]);
    }
  }

  useEffect(() => {
    if (!student) return;
    (async () => {
      try {
        const res = await base44.entities.Booking.filter(
          { student_id: student.id, status: "confermata" },
          { sort: "data", limit: 50 }
        );
        setMyBookings(res.items || []);
      } catch (e) {
        setMyBookings([]);
      }
    })();
    loadPackages();
  }, [student, refreshKey]);

  return (
    <div className="min-h-screen bg-background">
      <SiteNavbar />

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="font-heading text-4xl text-foreground sm:text-5xl">Prenota una lezione</h1>
        <p className="mt-3 text-foreground/70">
          Accedi con il tuo telefono, scegli materia, sede (in presenza o online) e orario. Tutto in pochi passaggi.
        </p>

        {!student ? (
          <div className="mt-8">
            <StudentAuth onAuth={setStudent} />
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            <StudentAuth onAuth={setStudent} />

            <div>
              <h2 className="mb-4 flex items-center gap-2 font-heading text-2xl text-foreground">
                <Calendar className="h-5 w-5 text-primary" /> Scegli la tua lezione
              </h2>
              <BookingForm
                student={student}
                packages={packages}
                onPackagesChange={() => { loadPackages(); setRefreshKey((k) => k + 1); }}
              />
            </div>

            <div>
              <h2 className="mb-4 font-heading text-2xl text-foreground">Risparmia con un pacchetto</h2>
              <PackagePurchase
                student={student}
                onPurchased={() => { loadPackages(); setRefreshKey((k) => k + 1); }}
              />
            </div>

            {myBookings.length > 0 && (
              <div>
                <h2 className="mb-4 font-heading text-2xl text-foreground">Le mie prossime lezioni</h2>
                <div className="space-y-3">
                  {myBookings.map((b) => {
                    const isOnline = b.location === "online";
                    return (
                      <div key={b.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-foreground">
                            {b.materia === "matematica" ? "Matematica" : "Fisica"} · {b.ora_inizio}
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            {b.modalita_pagamento === "pacchetto" ? "Pacchetto" : b.modalita_pagamento === "anticipato" ? "Anticipato" : "Volta per volta"}
                          </p>
                        </div>
                        <p className="text-sm text-foreground/60 capitalize">{formatDateIt(b.data)}</p>
                        <p className="text-xs text-foreground/50">
                          {b.tipo_lezione === "individuale" ? "Individuale" : "Gruppo"} · {b.durata || 1} {(b.durata || 1) === 1 ? "ora" : "ore"} · {isOnline ? "Online" : "In presenza"} · {b.prezzo}€
                        </p>
                        {isOnline && b.link_meet && (
                          <a href={b.link_meet} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                            <Video className="h-4 w-4" /> Apri l'aula virtuale
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}