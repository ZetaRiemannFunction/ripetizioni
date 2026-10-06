import React, { useEffect, useMemo, useState } from "react";
import { MapPin, Clock, Users, User, Calendar, Check, ArrowRight, Home, Video, Wallet, Package as PackageIcon } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { generateSlots, computePrice, formatDateIt, GIORNI } from "@/lib/tutoring";

export default function BookingForm({ student, packages = [], onPackagesChange }) {
  const [locations, setLocations] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [materia, setMateria] = useState("matematica");
  const [location, setLocation] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [bookings, setBookings] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [tipoLezione, setTipoLezione] = useState("individuale");
  const [durata, setDurata] = useState(1);
  const [modalitaPagamento, setModalitaPagamento] = useState("volta_per_volta");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  const activePackages = (packages || []).filter((p) => p.status === "attivo" && p.ore_residuali > 0);
  const bestPackage = activePackages.sort((a, b) => b.ore_residuali - a.ore_residuali)[0];
  const usingPackage = modalitaPagamento === "pacchetto" && !!bestPackage;

  const days = useMemo(() => {
    const arr = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [loc, av] = await Promise.all([
          base44.entities.Location.filter({}, { sort: "ordine", limit: 10 }),
          base44.entities.Availability.filter({}, { limit: 50 }),
        ]);
        setLocations(loc.items || []);
        setAvailability(av.items || []);
        if ((loc.items || []).length > 0) setLocation(loc.items[0].chiave);
      } catch (e) {
        setError("Errore nel caricamento. Riprova.");
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    setSelectedSlot("");
    (async () => {
      setLoading(true);
      try {
        const res = await base44.entities.Booking.filter(
          { data: selectedDate, status: "confermata" },
          { limit: 100 }
        );
        setBookings(res.items || []);
      } catch (e) {
        setBookings([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedDate]);

  const daySlots = useMemo(() => {
    if (!selectedDate) return [];
    const dow = new Date(selectedDate + "T00:00:00").getDay();
    const dayAvail = availability.filter((a) => a.giorno_settimana === dow);
    let slots = [];
    dayAvail.forEach((a) => {
      slots = slots.concat(generateSlots(a.ora_inizio, a.ora_fine));
    });
    return slots;
  }, [selectedDate, availability]);

  function overlaps(b, slot) {
    const bStart = parseInt((b.ora_inizio || "").split(":")[0], 10);
    const bEnd = bStart + (b.durata || 1);
    const sStart = parseInt(slot.inizio.split(":")[0], 10);
    const sEnd = sStart + 1;
    return bStart < sEnd && sStart < bEnd;
  }

  function slotStatus(slot) {
    const atSlot = bookings.filter((b) => overlaps(b, slot));
    const hasIndividual = atSlot.some((b) => b.tipo_lezione === "individuale");
    const groupCount = atSlot.filter((b) => b.tipo_lezione === "gruppo").length;
    if (hasIndividual) return { state: "full", label: "Occupato" };
    if (groupCount >= 3) return { state: "full", label: "Completo" };
    if (groupCount > 0) return { state: "group", label: `Gruppo ${groupCount}/3`, remaining: 3 - groupCount };
    return { state: "free", label: "Libero" };
  }

  function canSelectSlot(slot) {
    const st = slotStatus(slot);
    if (st.state === "full") return false;
    if (st.state === "group" && tipoLezione === "individuale") return false;
    return true;
  }

  function maxBookableFrom(slot) {
    const idx = daySlots.findIndex((s) => s.inizio === slot.inizio);
    if (idx < 0) return 1;
    if (!canSelectSlot(slot)) return 0;
    let count = 1;
    for (let i = idx + 1; i < daySlots.length && count < 3; i++) {
      const nst = slotStatus(daySlots[i]);
      if (nst.state === "free") count++;
      else break;
    }
    return count;
  }

  // pacchetto => solo individuale
  useEffect(() => {
    if (usingPackage) setTipoLezione("individuale");
  }, [usingPackage]);

  const prezzoOra = computePrice(student?.tipologia, tipoLezione);

  const maxDurata = useMemo(() => {
    if (!selectedSlot) return 1;
    let m = maxBookableFrom(daySlots.find((s) => s.inizio === selectedSlot) || { inizio: selectedSlot });
    if (usingPackage) m = Math.min(m, bestPackage.ore_residuali);
    return Math.max(1, Math.min(3, m));
  }, [selectedSlot, bookings, availability, usingPackage, bestPackage, daySlots]);

  useEffect(() => {
    if (durata > maxDurata) setDurata(maxDurata);
  }, [maxDurata]);

  const totale = prezzoOra * durata;

  async function confirm() {
    setError("");
    if (!location || !selectedDate || !selectedSlot) {
      setError("Seleziona sede, data e orario");
      return;
    }
    if (usingPackage && durata > bestPackage.ore_residuali) {
      setError("Ore residue del pacchetto insufficienti");
      return;
    }
    setSubmitting(true);
    try {
      const loc = locations.find((l) => l.chiave === location);
      const isOnline = location === "online";
      const payload = {
        student_id: student.id,
        nome_studente: `${student.nome} ${student.cognome}`,
        telefono_studente: student.telefono,
        materia,
        location,
        data: selectedDate,
        ora_inizio: selectedSlot,
        durata,
        tipo_lezione: tipoLezione,
        prezzo: usingPackage ? 0 : totale,
        gruppo_size: 1,
        status: "confermata",
        modalita_pagamento: modalitaPagamento,
        link_meet: isOnline ? (loc?.link_meet || "") : "",
        package_id: usingPackage ? bestPackage.id : "",
      };
      const booking = await base44.entities.Booking.create(payload);
      let residualAfter = null;
      if (usingPackage) {
        residualAfter = bestPackage.ore_residuali - durata;
        await base44.entities.Package.update(bestPackage.id, {
          ore_residuali: residualAfter,
          status: residualAfter <= 0 ? "esaurito" : "attivo",
        });
        onPackagesChange && onPackagesChange();
      }
      setSuccess({
        materia,
        location: loc?.nome || location,
        isOnline,
        linkMeet: loc?.link_meet || "",
        data: selectedDate,
        ora: selectedSlot,
        durata,
        totale: usingPackage ? 0 : totale,
        tipo: tipoLezione,
        usingPackage,
        residual: residualAfter,
        modalita: modalitaPagamento,
      });
      setBookings((prev) => [...prev, { ...booking, durata }]);
      setSelectedSlot("");
      setDurata(1);
    } catch (e) {
      setError("Errore nella prenotazione. Riprova.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    const endHour = parseInt(success.ora.split(":")[0], 10) + success.durata;
    return (
      <div className="rounded-2xl border border-success/30 bg-success/5 p-8 text-center shadow-sm">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success text-success-foreground">
          <Check className="h-7 w-7" />
        </span>
        <h3 className="mt-4 font-heading text-3xl text-foreground">Prenotazione confermata!</h3>
        <p className="mt-2 text-foreground/70">
          {success.materia === "matematica" ? "Matematica" : "Fisica"} · {success.tipo === "individuale" ? "Lezione individuale" : "Lezione di gruppo"} · {success.durata} {success.durata === 1 ? "ora" : "ore"}
        </p>
        <div className="mx-auto mt-5 max-w-sm rounded-xl border border-border bg-card p-4 text-left text-sm">
          <Row icon={<MapPin className="h-4 w-4" />} label="Sede" value={success.location} />
          <Row icon={<Calendar className="h-4 w-4" />} label="Giorno" value={formatDateIt(success.data)} />
          <Row icon={<Clock className="h-4 w-4" />} label="Orario" value={`${success.ora} – ${String(endHour).padStart(2, "0")}:00`} />
          <Row
            icon={<Wallet className="h-4 w-4" />}
            label="Pagamento"
            value={
              success.usingPackage
                ? `Pacchetto (${success.residual} ore residue)`
                : success.modalita === "anticipato" ? "Anticipato" : "Volta per volta"
            }
          />
          <Row icon={<Euro className="h-4 w-4" />} label="Totale" value={success.usingPackage ? "Coperto dal pacchetto" : `${success.totale}€`} />
        </div>
        {success.isOnline && (
          <div className="mx-auto mt-4 max-w-sm rounded-xl border border-primary/30 bg-primary/5 p-4 text-left">
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Video className="h-4 w-4 text-primary" /> Aula virtuale
            </p>
            {success.linkMeet ? (
              <a href={success.linkMeet} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
                Apri l'aula <ArrowRight className="h-4 w-4" />
              </a>
            ) : (
              <p className="mt-1 text-xs text-foreground/60">Ti invieremo il link dell'aula virtuale prima della lezione.</p>
            )}
          </div>
        )}
        <button
          onClick={() => setSuccess(null)}
          className="mt-6 rounded-full border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:border-primary"
        >
          Prenota un'altra lezione
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Materia */}
      <Section title="Materia" icon={<Calendar className="h-4 w-4" />}>
        <div className="flex gap-2">
          {["matematica", "fisica"].map((m) => (
            <Chip key={m} active={materia === m} onClick={() => setMateria(m)}>
              {m === "matematica" ? "Matematica" : "Fisica"}
            </Chip>
          ))}
        </div>
      </Section>

      {/* Sede */}
      <Section title="Sede della lezione" icon={<Home className="h-4 w-4" />}>
        {locations.length === 0 ? (
          <p className="text-sm text-foreground/50">Nessuna sede configurata. Contattaci per prenotare.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {locations.map((l) => {
              const isOnline = l.chiave === "online";
              return (
                <button
                  key={l.id}
                  onClick={() => setLocation(l.chiave)}
                  className={location === l.chiave
                    ? "rounded-xl border-2 border-primary bg-primary/5 p-4 text-left"
                    : "rounded-xl border border-border bg-background p-4 text-left hover:border-primary/50"}
                >
                  <span className="flex items-center gap-2 font-medium text-foreground">
                    {isOnline ? <Video className="h-4 w-4 text-primary" /> : <MapPin className="h-4 w-4 text-primary" />} {l.nome}
                  </span>
                  {isOnline
                    ? <p className="mt-1 text-sm text-foreground/60">Lezione online · stesso costo · aula virtuale (Meet)</p>
                    : (l.indirizzo && <p className="mt-1 text-sm text-foreground/60">{l.indirizzo}</p>)}
                </button>
              );
            })}
          </div>
        )}
      </Section>

      {/* Data */}
      <Section title="Giorno" icon={<Calendar className="h-4 w-4" />}>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {days.map((d) => {
            const iso = d.toISOString().split("T")[0];
            const active = selectedDate === iso;
            return (
              <button
                key={iso}
                onClick={() => setSelectedDate(iso)}
                className={active
                  ? "min-w-[68px] rounded-xl border-2 border-primary bg-primary px-3 py-3 text-center text-primary-foreground"
                  : "min-w-[68px] rounded-xl border border-border bg-background px-3 py-3 text-center hover:border-primary/50"}
              >
                <span className="block text-xs uppercase tracking-wide opacity-70">{GIORNI[d.getDay()].slice(0, 3)}</span>
                <span className="block text-lg font-semibold">{d.getDate()}</span>
                <span className="block text-xs capitalize opacity-70">{d.toLocaleDateString("it-IT", { month: "short" })}</span>
              </button>
            );
          })}
        </div>
      </Section>

      {/* Slot */}
      {selectedDate && (
        <Section title="Orario disponibile" icon={<Clock className="h-4 w-4" />}>
          {loading ? (
            <p className="text-sm text-foreground/50">Caricamento orari...</p>
          ) : daySlots.length === 0 ? (
            <p className="text-sm text-foreground/50">Nessuna disponibilità per questo giorno. Scegli un altro giorno.</p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                {daySlots.map((slot) => {
                  const st = slotStatus(slot);
                  const selectable = canSelectSlot(slot);
                  const active = selectedSlot === slot.inizio;
                  return (
                    <button
                      key={slot.inizio}
                      disabled={!selectable}
                      onClick={() => { setSelectedSlot(slot.inizio); setDurata(1); }}
                      className={active
                        ? "rounded-lg border-2 border-primary bg-primary px-2 py-2.5 text-center text-primary-foreground"
                        : selectable
                          ? "rounded-lg border border-border bg-background px-2 py-2.5 text-center hover:border-primary"
                          : "cursor-not-allowed rounded-lg border border-border/50 bg-muted px-2 py-2.5 text-center text-foreground/40"}
                    >
                      <span className="block text-sm font-semibold">{slot.inizio}</span>
                      <span className={active ? "block text-[10px] opacity-90" : "block text-[10px] text-foreground/50"}>
                        {st.state === "free" ? "libero" : st.state === "group" ? `${st.remaining} posti` : "occupato"}
                      </span>
                    </button>
                  );
                })}
              </div>
              {daySlots.length > 0 && (
                <p className="mt-3 text-xs text-foreground/50">
                  Slot "libero" = disponibile per individuale o gruppo · "N posti" = gruppo con posti rimanenti
                </p>
              )}
            </>
          )}
        </Section>
      )}

      {/* Tipo lezione */}
      {selectedSlot && (
        <Section title="Tipo di lezione" icon={<Users className="h-4 w-4" />}>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => setTipoLezione("individuale")}
              className={tipoLezione === "individuale"
                ? "rounded-xl border-2 border-primary bg-primary/5 p-4 text-left"
                : "rounded-xl border border-border bg-background p-4 text-left hover:border-primary/50"}
            >
              <span className="flex items-center gap-2 font-medium text-foreground">
                <User className="h-4 w-4 text-primary" /> Individuale
              </span>
              <p className="mt-1 text-sm text-foreground/60">Solo tu con il tutor · {student?.tipologia === "liceo_scientifico" ? "25€" : "20€"} / ora</p>
            </button>
            <button
              disabled={usingPackage}
              onClick={() => setTipoLezione("gruppo")}
              className={tipoLezione === "gruppo"
                ? "rounded-xl border-2 border-primary bg-primary/5 p-4 text-left disabled:opacity-50"
                : "rounded-xl border border-border bg-background p-4 text-left hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"}
            >
              <span className="flex items-center gap-2 font-medium text-foreground">
                <Users className="h-4 w-4 text-primary" /> Gruppo (2–3)
              </span>
              <p className="mt-1 text-sm text-foreground/60">{usingPackage ? "Non disponibile con il pacchetto" : "Condividi lo slot con altri · 18€ / ora a testa"}</p>
            </button>
          </div>
        </Section>
      )}

      {/* Durata */}
      {selectedSlot && (
        <Section title="Quante ore" icon={<Clock className="h-4 w-4" />}>
          <div className="flex gap-2">
            {[1, 2, 3].map((n) => {
              const ok = n <= maxDurata;
              return (
                <button
                  key={n}
                  disabled={!ok}
                  onClick={() => setDurata(n)}
                  className={durata === n
                    ? "rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
                    : ok
                      ? "rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground/70 hover:border-primary"
                      : "cursor-not-allowed rounded-full border border-border/50 bg-muted px-5 py-2.5 text-sm font-medium text-foreground/30"}
                >
                  {n} {n === 1 ? "ora" : "ore"}
                </button>
              );
            })}
          </div>
          {maxDurata < 3 && <p className="mt-2 text-xs text-foreground/50">Massimo {maxDurata} {maxDurata === 1 ? "ora" : "ore"} consecutive disponibili per questo orario.</p>}
        </Section>
      )}

      {/* Pagamento */}
      {selectedSlot && (
        <Section title="Pagamento" icon={<Wallet className="h-4 w-4" />}>
          <div className="flex flex-wrap gap-2">
            <Chip active={modalitaPagamento === "anticipato"} onClick={() => setModalitaPagamento("anticipato")}>Anticipato</Chip>
            <Chip active={modalitaPagamento === "volta_per_volta"} onClick={() => setModalitaPagamento("volta_per_volta")}>Volta per volta</Chip>
            {bestPackage && (
              <Chip active={modalitaPagamento === "pacchetto"} onClick={() => setModalitaPagamento("pacchetto")}>
                <span className="inline-flex items-center gap-1.5"><PackageIcon className="h-3.5 w-3.5" /> Pacchetto ({bestPackage.ore_residuali} ore)
              </span>
              </Chip>
            )}
          </div>
          {usingPackage && (
            <p className="mt-2 text-xs text-foreground/50">Le ore vengono scalate dal tuo pacchetto. Le lezioni col pacchetto sono individuali.</p>
          )}
        </Section>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Riepilogo + conferma */}
      {selectedSlot && (
        <div className="sticky bottom-4 rounded-2xl border border-border bg-card p-5 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm">
              <p className="font-heading text-xl text-foreground">
                {usingPackage ? "Coperto dal pacchetto" : <>{totale}€ <span className="text-base font-normal text-foreground/50"> / {durata} {durata === 1 ? "ora" : "ore"}</span></>}
              </p>
              <p className="text-foreground/60">
                {materia === "matematica" ? "Matematica" : "Fisica"} · {tipoLezione === "individuale" ? "Individuale" : "Gruppo"} · {selectedSlot} · {durata} {durata === 1 ? "ora" : "ore"}
              </p>
            </div>
            <button
              onClick={confirm}
              disabled={submitting}
              className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Prenotazione..." : "Conferma prenotazione"} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-foreground/50">
        <span className="text-primary">{icon}</span> {title}
      </h3>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={active
        ? "rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
        : "rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground/70 hover:border-primary"}
    >
      {children}
    </button>
  );
}

function Row({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 py-1.5 last:border-0">
      <span className="flex items-center gap-2 text-foreground/60">{icon} {label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function Euro(props) {
  return <span {...props}>€</span>;
}