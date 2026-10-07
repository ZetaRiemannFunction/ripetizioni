import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calculator, Atom, Users, User, MapPin, Phone, Sparkles } from "lucide-react";
import SiteNavbar from "@/components/SiteNavbar";
import SiteFooter from "@/components/SiteFooter";
import TutorCard from "@/components/TutorCard";
import { base44 } from "@/api/base44Client";

export default function Home() {
  const [tutors, setTutors] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.entities.Tutor.filter({}, { sort: "ordine", limit: 10 });
        setTutors(res.items || []);
      } catch (e) {
        /* ignore */
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteNavbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Matematica & Fisica · In presenza e online
            </span>
            <h1 className="mt-6 font-heading text-5xl leading-[1.05] text-foreground sm:text-7xl">
              Matematica e Fisica, <span className="text-primary italic">finalmente chiare</span>.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-foreground/70">
              Siamo due studenti universitari laureati all'Università di Pisa,
               impegnati nelle rispettive magistrali. Ti aiutiamo a capire, non solo a memorizzare.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/prenota"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Prenota una lezione <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#storia"
                className="inline-flex items-center gap-2 rounded-full border border-border px-7 py-3.5 font-semibold text-foreground hover:border-primary"
              >
                La nostra storia
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* MATERIE */}
      <section className="border-y border-border/60 bg-card/50">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:px-6 md:grid-cols-2">
          <SubjectCard
            icon={<Calculator className="h-7 w-7" />}
            title="Matematica"
            text="Algebra, geometria, analisi, probabilità. Dalle scuole medie fino al superiore, con metodo e pazienza."
          />
          <SubjectCard
            icon={<Atom className="h-7 w-7" />}
            title="Fisica"
            text="Meccanica, termodinamica, elettromagnetismo. Capire i fenomeni partendo dai principi, non dalle formule."
          />
        </div>
      </section>

      {/* STORIA */}
      <section id="storia" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-heading text-4xl text-foreground sm:text-5xl">La nostra storia</h2>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-foreground/70">
              <p>
                Siamo due amici che hanno scelto di studiare materie scientifiche e ora vogliono
                mettere la loro passione al servizio di chi ha bisogno di una mano.
              </p>
              <p>
                Abbiamo affrontato gli stessi dubbi e le stesse difficoltà che affronti tu oggi,
                e sappiamo che con la spiegazione giusta tutto diventa chiaro.
              </p>
              <p>
                Offriamo lezioni <span className="font-semibold text-foreground">individuali</span> e
                di <span className="font-semibold text-foreground">gruppo</span> (massimo 3 persone),
                in presenza presso la nostra sede o online.
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <h3 className="font-heading text-2xl text-foreground">Perché scegliere noi</h3>
            <ul className="mt-5 space-y-4">
              <Perk text="Tutor laureati in discipline scientifiche, in corso di magistrale" />
              <Perk text="Lezioni individuali o di gruppo (max 3 persone)" />
              <Perk text="In presenza a Pisa o online, allo stesso costo" />
              <Perk text="Prenotazione online semplice e veloce" />
            </ul>
          </div>
        </div>
      </section>

      {/* TUTOR */}
      <section className="border-t border-border/60 bg-card/30">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="font-heading text-4xl text-foreground sm:text-5xl">I nostri tutor</h2>
          <p className="mt-3 max-w-xl text-foreground/70">
            Due studenti, tre percorsi, una sola missione: aiutarti a raggiungere i tuoi obiettivi.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tutors.map((t) => (
              <TutorCard key={t.id} tutor={t} />
            ))}
            {tutors.length === 0 && (
              <p className="text-foreground/50">Le foto e i profili dei tutor saranno caricati a breve.</p>
            )}
          </div>
        </div>
      </section>

      {/* PREZZI */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="text-center font-heading text-4xl text-foreground sm:text-5xl">Tariffa</h2>
        <p className="mt-3 text-center text-foreground/70">Tariffe orarie, senza sorprese.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <PriceCard
            title="Individuale"
            subtitle="Liceo scientifico"
            price="25€"
            icon={<User className="h-5 w-5" />}
          />
          <PriceCard
            title="Individuale"
            subtitle="Tecnici, professionali, licei non scientifici"
            price="20€"
            icon={<User className="h-5 w-5" />}
          />
          <PriceCard
            title="Gruppo (2–3)"
            subtitle="A testa, qualsiasi indirizzo"
            price="18€"
            icon={<Users className="h-5 w-5" />}
            highlight
          />
        </div>
        <div className="mt-12">
          <h3 className="text-center font-heading text-3xl text-foreground">Pacchetti di lezioni</h3>
          <p className="mt-2 text-center text-foreground/70">Prepaghi un blocco di ore e risparmi. Le usi quando vuoi.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
              <p className="font-heading text-2xl text-foreground">10 ore</p>
              <p className="text-sm font-medium text-primary">-15%</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
              <p className="font-heading text-2xl text-foreground">15 ore</p>
              <p className="text-sm font-medium text-primary">-15%</p>
            </div>
            <div className="rounded-2xl border-2 border-primary bg-primary/5 p-6 text-center shadow-sm">
              <p className="font-heading text-2xl text-foreground">20 ore</p>
              <p className="text-sm font-medium text-primary">-20%</p>
            </div>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-foreground/50">
          Lezioni in presenza a Pisa o online allo stesso costo. Pagamento anticipato o volta per volta, a tua scelta.
        </p>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6">
          <h2 className="font-heading text-4xl sm:text-5xl">Pronto a iniziare?</h2>
          <p className="max-w-xl text-primary-foreground/80">
            Prenota la tua lezione in pochi click. Scegli materia, sede e orario disponibile.
          </p>
          <Link
            to="/prenota"
            className="inline-flex items-center gap-2 rounded-full bg-primary-foreground px-7 py-3.5 font-semibold text-primary transition-opacity hover:opacity-90"
          >
            Prenota ora <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function SubjectCard({ icon, title, text }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </span>
      <div>
        <h3 className="font-heading text-2xl text-foreground">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-foreground/70">{text}</p>
      </div>
    </div>
  );
}

function Perk({ text }) {
  return (
    <li className="flex items-start gap-3 text-foreground/80">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
      <span className="leading-relaxed">{text}</span>
    </li>
  );
}

function PriceCard({ title, subtitle, price, icon, highlight }) {
  return (
    <div className={highlight
      ? "rounded-2xl border-2 border-primary bg-primary/5 p-8 shadow-sm"
      : "rounded-2xl border border-border bg-card p-8 shadow-sm"}>
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </span>
      <h3 className="mt-4 font-heading text-2xl text-foreground">{title}</h3>
      <p className="text-sm text-foreground/60">{subtitle}</p>
      <p className="mt-4 font-heading text-5xl text-primary">{price}<span className="text-lg text-foreground/50"> / ora</span></p>
    </div>
  );
}