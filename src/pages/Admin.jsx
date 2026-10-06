import React, { useState } from "react";
import { Lock, Calendar, Clock, Users, GraduationCap, ArrowRight, Settings } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AdminCalendar from "@/components/admin/AdminCalendar";
import AvailabilityEditor from "@/components/admin/AvailabilityEditor";
import TutorManager from "@/components/admin/TutorManager";
import StudentList from "@/components/admin/StudentList";
import SettingsManager from "@/components/admin/SettingsManager";

export default function Admin() {
  const [pin, setPin] = useState("");
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("calendario");

  async function checkPin() {
    setError("");
    setChecking(true);
    try {
      const res = await base44.functions.invoke("verifyAdmin", { pin });
      if (res.data?.ok) {
        setVerified(true);
      } else {
        setError("PIN errato");
      }
    } catch (e) {
      setError("PIN errato");
    } finally {
      setChecking(false);
    }
  }

  if (!verified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Lock className="h-6 w-6" />
          </span>
          <h1 className="mt-5 text-center font-heading text-3xl text-foreground">Area gestione</h1>
          <p className="mt-2 text-center text-sm text-foreground/60">Inserisci il PIN per accedere</p>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && checkPin()}
            className="mt-6 h-12 w-full rounded-lg border border-border bg-background px-4 text-center text-lg tracking-widest outline-none focus:border-primary"
            placeholder="••••"
            autoFocus
          />
          {error && <p className="mt-3 text-center text-sm text-destructive">{error}</p>}
          <button
            onClick={checkPin}
            disabled={checking || !pin}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {checking ? "Verifica..." : "Accedi"} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "calendario", label: "Calendario", icon: <Calendar className="h-4 w-4" /> },
    { id: "disponibilita", label: "Disponibilità", icon: <Clock className="h-4 w-4" /> },
    { id: "tutor", label: "Tutor & Foto", icon: <GraduationCap className="h-4 w-4" /> },
    { id: "studenti", label: "Studenti", icon: <Users className="h-4 w-4" /> },
    { id: "impostazioni", label: "Impostazioni", icon: <Settings className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <h1 className="font-heading text-2xl text-foreground">Area gestione</h1>
            <button onClick={() => { setVerified(false); setPin(""); }} className="text-sm text-foreground/60 hover:text-primary">
              Esci
            </button>
          </div>
          <div className="mt-4 flex gap-1 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={tab === t.id
                  ? "flex items-center gap-2 whitespace-nowrap rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                  : "flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium text-foreground/60 hover:text-primary"}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {tab === "calendario" && <AdminCalendar pin={pin} />}
        {tab === "disponibilita" && <AvailabilityEditor pin={pin} />}
        {tab === "tutor" && <TutorManager pin={pin} />}
        {tab === "studenti" && <StudentList pin={pin} />}
        {tab === "impostazioni" && <SettingsManager pin={pin} />}
      </div>
    </div>
  );
}