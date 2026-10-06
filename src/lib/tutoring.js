// Logica condivisa per anno scolastico e prezzi (frontend)

export function currentSchoolYear(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-11
  const startYear = month >= 8 ? year : year - 1; // settembre = inizio anno
  return `${startYear}/${startYear + 1}`;
}

function schoolYearStart(sy) {
  if (!sy) return 0;
  return parseInt(sy.split("/")[0], 10);
}

// Anno corrente: auto-aggiornato annualmente, a meno di un override manuale
export function computeCurrentAnno(student, date = new Date()) {
  if (student?.anno_override != null) return student.anno_override;
  if (!student?.anno_scolastico_registrazione) return student?.anno ?? 1;
  const regIdx = schoolYearStart(student.anno_scolastico_registrazione);
  const curIdx = schoolYearStart(currentSchoolYear(date));
  const delta = curIdx - regIdx;
  return Math.max(1, (student.anno ?? 1) + delta);
}

// Prezzo orario
// - individuale: 25€ liceo scientifico, 20€ per gli altri (tecnici, professionali, licei non scientifici, media)
// - gruppo (2-3 persone): 18€ a testa
export function computePrice(tipologia, tipoLezione) {
  if (tipoLezione === "gruppo") return 18;
  if (tipologia === "liceo_scientifico") return 25;
  return 20;
}

export const TIPOLOGIE_LABEL = {
  media: "Scuola media",
  liceo_scientifico: "Liceo Scientifico",
  liceo_non_scientifico: "Liceo (non scientifico)",
  tecnico: "Istituto Tecnico",
  professionale: "Istituto Professionale"
};

export const GIORNI = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];

export const GIORNI_BREVI = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];

// Genera slot orari da un range (es. "16:00"-"20:00") con step di 1 ora
export function generateSlots(oraInizio, oraFine) {
  const slots = [];
  let [h] = oraInizio.split(":").map(Number);
  const [endH] = oraFine.split(":").map(Number);
  while (h < endH) {
    const start = String(h).padStart(2, "0") + ":00";
    const end = String(h + 1).padStart(2, "0") + ":00";
    slots.push({ inizio: start, fine: end });
    h += 1;
  }
  return slots;
}

export function formatDateIt(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
}

export function formatShortDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("it-IT", { day: "numeric", month: "short" });
}

// Pacchetti di lezioni prepagati: ore + sconto percentuale
export const PACCHETTI = [
  { ore: 10, sconto: 15 },
  { ore: 15, sconto: 15 },
  { ore: 20, sconto: 20 },
];

export function computePackagePrice(prezzoOra, ore, sconto) {
  return Math.round(prezzoOra * ore * (1 - sconto / 100) * 100) / 100;
}