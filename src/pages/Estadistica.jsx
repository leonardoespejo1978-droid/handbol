import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import * as XLSX from "xlsx";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, LineChart, Line
} from "recharts";

// ─── Paleta ───────────────────────────────────────────────────────────────────
const C = {
  bg: "#0f1117", card: "#1a1d27", border: "#2a2d3a",
  accent: "#e63946", accent2: "#457b9d", accent3: "#2a9d8f",
  text: "#e8eaf0", muted: "#8b8fa8",
  positive: "#2a9d8f", negative: "#e63946", warning: "#e9c46a",
};
const COLORS = ["#e63946","#457b9d","#2a9d8f","#e9c46a","#f4a261","#a8dadc"];

const sum = (arr, key) => arr.reduce((a, r) => a + (r[key] || 0), 0);

// Noms dels porters (en minúscules per comparació)
const PORTEROS_NAMES = new Set(["eudald", "jules", "jan"]);
const getPosicion = (jugador) =>
  jugador && PORTEROS_NAMES.has(String(jugador).toLowerCase()) ? "PORTERO" : "JUGADOR";

// ─── Hook: detectar si es móvil ───────────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

export default function Estadistica() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [rawData, setRawData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("individual");

  const [filtreJornada, setFiltreJornada] = useState("Totes");
  const [filtreRival, setFiltreRival] = useState("Tots");
  const [filtreJugador, setFiltreJugador] = useState("Tots");
  const [filtreGrafic, setFiltreGrafic] = useState("Gols/Lançaments");
  const [ordenarPer, setOrdenarPer] = useState("Goles");
  const [ordenDesc, setOrdenDesc] = useState(true);
  const [vistaMedia, setVistaMedia] = useState(false);
  const [filtreGraficPorter, setFiltreGraficPorter] = useState("Parades/Lançaments");
  const [grafEvoCamp, setGrafEvoCamp] = useState("Gols/Lançaments");
  const [grafEvoMode, setGrafEvoMode] = useState("partit"); // "partit" | "acumulat"
  const [grafEvoTipus, setGrafEvoTipus] = useState("barres"); // "barres" | "linies"


  useEffect(() => {
    const load = async () => {
      try {
        let response = await fetch("/LLIGA INFANTIL MASCULI 3FASE 25_26.xlsm");
        if (!response.ok) response = await fetch("/LLIGA INFANTIL MASCULI 3FASE 25_26.xlsx");
        if (!response.ok) throw new Error(`Arxiu no trobat (${response.status}). Comprova que estigui a /public`);
        const buffer = await response.arrayBuffer();
        const wb = XLSX.read(buffer, { type: "array", cellDates: true });
        const ws = wb.Sheets["Datos"];
        if (!ws) throw new Error('Full "Datos" no trobat');
        const json = XLSX.utils.sheet_to_json(ws, { defval: null });
        setRawData(json.map(r => {
          // Always derive POSICION from player name (Excel column may contain formulas as strings)
          const posicion = getPosicion(r.Jugador);
          let pctLanz = null;
          if (r["Lanzam."] != null && r["Lanzam."] > 0) {
            if (posicion === "JUGADOR") pctLanz = Math.round(((r.Goles || 0) / r["Lanzam."]) * 100);
            else pctLanz = Math.round(((r.Paradas || 0) / r["Lanzam."]) * 100);
          }
          // "goles contra" column in Excel is also a formula string — compute directly
          const gc = posicion === "PORTERO" ? ((r["Lanzam."] || 0) - (r.Paradas || 0)) : 0;
          return { ...r, POSICION: posicion, "% lanz": pctLanz, "_gc": gc };
        }));
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const jornades = useMemo(() => ["Totes", ...Array.from(new Set(rawData.map(r => r.JORNADA))).filter(Boolean).sort((a,b)=>a-b)], [rawData]);
  const rivals   = useMemo(() => ["Tots",  ...Array.from(new Set(rawData.map(r => r.rival))).filter(Boolean).sort()], [rawData]);
  const jugadors = useMemo(() => ["Tots",  ...Array.from(new Set(rawData.map(r => r.Jugador))).filter(Boolean).sort()], [rawData]);

  const filtered = useMemo(() => rawData.filter(r => {
    if (filtreJornada !== "Totes" && r.JORNADA !== Number(filtreJornada)) return false;
    if (filtreRival   !== "Tots"  && r.rival   !== filtreRival)            return false;
    if (filtreJugador !== "Tots"  && r.Jugador  !== filtreJugador)         return false;
    return true;
  }), [rawData, filtreJornada, filtreRival, filtreJugador]);

  const jugadorsFiltered = useMemo(() => filtered.filter(r => r.POSICION === "JUGADOR"), [filtered]);
  const portersFiltered  = useMemo(() => filtered.filter(r => r.POSICION === "PORTERO"),  [filtered]);

  const STAT_FIELDS = ["Goles","Lanzam.","Asistencia","Recup.","Exclusión","Pase","Área","PenaltiProvocado","Exclusión +"];
  const PORTER_FIELDS = ["Paradas","Lanzam.","Goles"];
  const haJugat = (r) => r.POSICION === "PORTERO"
    ? PORTER_FIELDS.some(k => r[k] != null && r[k] !== 0 && r[k] !== "")
    : STAT_FIELDS.some(k => r[k] != null && r[k] !== 0);

  // Stats porteros
  // Nota: per porters, la columna "Goles" del Excel = parades fetes (igual que "Paradas")
  //       "Lanzam." = lançaments rebuts, "Asistencia" = assistències reals
  const statsPerPorter = useMemo(() => {
    const map = {};
    portersFiltered.forEach(r => {
      if (!map[r.Jugador]) map[r.Jugador] = {
        Jugador: r.Jugador, partits: 0, partitsJugats: 0,
        Paradas: 0, "Lanzam.": 0, GC: 0,
        Asistencia: 0, Pase: 0, "Exclusión +": 0,
      };
      const m = map[r.Jugador];
      m.partits++;
      if (haJugat(r)) m.partitsJugats++;
      // "Goles" al Excel del porter = parades (mateix valor que Paradas)
      m.Paradas       += r.Paradas || r.Goles || 0;
      m["Lanzam."]    += r["Lanzam."] || 0;
      m.GC            += r._gc || 0;
      m.Asistencia    += r.Asistencia || 0;
      m.Pase          += r.Pase || 0;
      m["Exclusión +"] += r["Exclusión +"] || 0;
    });
    return Object.values(map).map(m => {
      const pj = m.partitsJugats || 1;
      const avg1 = (v) => +(v / pj).toFixed(1);
      return {
        ...m,
        eficiencia:  m["Lanzam."] ? Math.round((m.Paradas / m["Lanzam."]) * 100) : 0,
        avgParades:  avg1(m.Paradas),
        avgGC:       avg1(m.GC),
        avgLanzReb:  avg1(m["Lanzam."]),
        avgAss:      avg1(m.Asistencia),
        avgPase:     avg1(m.Pase),
      };
    });
  }, [portersFiltered]);

  const statsPerJugador = useMemo(() => {
    const map = {};
    jugadorsFiltered.forEach(r => {
      if (!map[r.Jugador]) map[r.Jugador] = {
        Jugador: r.Jugador, partits: 0, partitsJugats: 0,
        Goles: 0, "Lanzam.": 0, Asistencia: 0, "Recup.": 0,
        Exclusión: 0, Pase: 0, Área: 0, PenaltiProvocado: 0, "Exclusión +": 0,
      };
      const m = map[r.Jugador];
      m.partits++;
      if (haJugat(r)) m.partitsJugats++;
      m.Goles            += r.Goles || 0;
      m["Lanzam."]       += r["Lanzam."] || 0;
      m.Asistencia       += r.Asistencia || 0;
      m["Recup."]        += r["Recup."] || 0;
      m.Exclusión        += r["Exclusión"] || 0;
      m.Pase             += r.Pase || 0;
      m.Área             += r.Área || 0;
      m.PenaltiProvocado += r.PenaltiProvocado || 0;
      m["Exclusión +"]   += r["Exclusión +"] || 0;
    });
    return Object.values(map).map(m => {
      const pj = m.partitsJugats || 1;
      const avg1 = (v) => +(v / pj).toFixed(1);
      return {
        ...m,
        eficiencia: m["Lanzam."] ? Math.round((m.Goles / m["Lanzam."]) * 100) : 0,
        avgGoles:      avg1(m.Goles),
        avgLanzam:     avg1(m["Lanzam."]),
        avgAsistencia: avg1(m.Asistencia),
        avgRecup:      avg1(m["Recup."]),
        avgExclusion:  avg1(m.Exclusión),
        avgPase:       avg1(m.Pase),
        avgPenalti:    avg1(m.PenaltiProvocado),
      };
    });
  }, [jugadorsFiltered]);

  // Sempre sobre tots els jugadors (sense filtre de jugador) — per calcular màxims del radar
  const statsPerJugadorTots = useMemo(() => {
    const allJugs = rawData.filter(r => r.POSICION === "JUGADOR" &&
      (filtreJornada === "Totes" || r.JORNADA === Number(filtreJornada)) &&
      (filtreRival === "Tots" || r.rival === filtreRival));
    const map = {};
    allJugs.forEach(r => {
      if (!map[r.Jugador]) map[r.Jugador] = { Goles:0,"Lanzam.":0,Asistencia:0,"Recup.":0,PenaltiProvocado:0,"Exclusión +":0, partitsJugats:0 };
      const m = map[r.Jugador];
      if (haJugat(r)) m.partitsJugats++;
      m.Goles            += r.Goles || 0;
      m["Lanzam."]       += r["Lanzam."] || 0;
      m.Asistencia       += r.Asistencia || 0;
      m["Recup."]        += r["Recup."] || 0;
      m.PenaltiProvocado += r.PenaltiProvocado || 0;
      m["Exclusión +"]   += r["Exclusión +"] || 0;
    });
    return Object.values(map).map(m => ({
      ...m,
      eficiencia: m["Lanzam."] ? Math.round((m.Goles / m["Lanzam."]) * 100) : 0,
    }));
  }, [rawData, filtreJornada, filtreRival]);

  const statsSorted = useMemo(() =>
    [...statsPerJugador].sort((a,b) => ordenDesc ? b[ordenarPer]-a[ordenarPer] : a[ordenarPer]-b[ordenarPer]),
    [statsPerJugador, ordenarPer, ordenDesc]);

  const graficaIndividual = useMemo(() => {
    const data = filtreJugador !== "Tots"
      ? statsPerJugador.filter(r => r.Jugador === filtreJugador)
      : statsSorted.slice(0, 10);
    const lbl = (total, avg) => vistaMedia ? avg : total;
    if (filtreGrafic === "Gols/Lançaments") return data.map(d => ({ name: d.Jugador, Goles: lbl(d.Goles, d.avgGoles), "Lanzam.": lbl(d["Lanzam."], d.avgLanzam) }));
    if (filtreGrafic === "Eficiència")       return data.map(d => ({ name: d.Jugador, "Efic. %": d.eficiencia }));
    if (filtreGrafic === "Accions positives") return data.map(d => ({ name: d.Jugador, Assistències: lbl(d.Asistencia, d.avgAsistencia), "Recup.": lbl(d["Recup."], d.avgRecup), "Pen. Prov.": lbl(d.PenaltiProvocado, d.avgPenalti) }));
    if (filtreGrafic === "Accions negatives") return data.map(d => ({ name: d.Jugador, "Pèrd. Passe": lbl(d.Pase, d.avgPase), "Pèrd. Àrea": d.Área, Exclusions: lbl(d.Exclusión, d.avgExclusion) }));
    return data;
  }, [statsSorted, statsPerJugador, filtreGrafic, filtreJugador, vistaMedia]);

  const graficaBarsKeys = useMemo(() => {
    if (filtreGrafic === "Gols/Lançaments")   return ["Goles", "Lanzam."];
    if (filtreGrafic === "Eficiència")          return ["Efic. %"];
    if (filtreGrafic === "Accions positives")   return ["Assistències", "Recup.", "Pen. Prov."];
    if (filtreGrafic === "Accions negatives")   return ["Pèrd. Passe", "Pèrd. Àrea", "Exclusions"];
    return [];
  }, [filtreGrafic]);

  const radarData = useMemo(() => {
    if (filtreJugador === "Tots") return [];
    const isPorter = getPosicion(filtreJugador) === "PORTERO";
    if (isPorter) {
      const j = statsPerPorter.find(r => r.Jugador === filtreJugador);
      if (!j) return [];
      // Màxims sobre TOTS els porters (sense filtre de jugador)
      const allPorters = rawData.filter(r => r.POSICION === "PORTERO" &&
        (filtreJornada === "Totes" || r.JORNADA === Number(filtreJornada)) &&
        (filtreRival === "Tots" || r.rival === filtreRival));
      const porterMap = {};
      allPorters.forEach(r => {
        if (!porterMap[r.Jugador]) porterMap[r.Jugador] = { Paradas:0,"Lanzam.":0,GC:0,Asistencia:0,Pase:0 };
        const m = porterMap[r.Jugador];
        m.Paradas += r.Paradas || 0;
        m["Lanzam."] += r["Lanzam."] || 0;
        m.GC += Math.max(0, (r["Lanzam."]||0) - (r.Paradas||0));
        m.Asistencia += r.Asistencia || 0;
        m.Pase += r.Pase || 0;
      });
      const allP = Object.values(porterMap);
      const mx = k => Math.max(...allP.map(x => x[k] || 0), 1);
      return [
        { stat: "Parades",    val: Math.round((j.Paradas / mx("Paradas")) * 100) },
        { stat: "Lanz. reb.", val: Math.round((j["Lanzam."] / mx("Lanzam.")) * 100) },
        { stat: "Efic. %",   val: j.eficiencia },
        { stat: "Assistèn.", val: Math.round((j.Asistencia / Math.max(mx("Asistencia"),1)) * 100) },
        { stat: "GC",        val: mx("GC") > 0 ? Math.round((j.GC / mx("GC")) * 100) : 0 },
        { stat: "Passe",     val: Math.round((j.Pase / Math.max(mx("Pase"),1)) * 100) },
      ];
    }
    // Jugador de camp: màxim sempre sobre tots els jugadors (statsPerJugadorTots)
    const j = statsPerJugador.find(r => r.Jugador === filtreJugador);
    if (!j) return [];
    const mx = k => Math.max(...statsPerJugadorTots.map(x => x[k] || 0), 1);
    return [
      { stat: "Goles",       val: Math.round((j.Goles / mx("Goles")) * 100) },
      { stat: "Lanzam.",     val: Math.round((j["Lanzam."] / mx("Lanzam.")) * 100) },
      { stat: "Efic. %",    val: j.eficiencia },
      { stat: "Assistèn.",  val: Math.round((j.Asistencia / mx("Asistencia")) * 100) },
      { stat: "Recup.",     val: Math.round((j["Recup."] / mx("Recup.")) * 100) },
      { stat: "Exc. Prov.", val: Math.round((j["Exclusión +"] / mx("Exclusión +")) * 100) },
    ];
  }, [filtreJugador, statsPerJugador, statsPerJugadorTots, statsPerPorter, rawData, filtreJornada, filtreRival]);

  // Evolució per jornada d'un jugador concret (sense filtres de jornada/rival)
  const evoJugador = useMemo(() => {
    if (filtreJugador === "Tots") return [];
    const isPorter = getPosicion(filtreJugador) === "PORTERO";
    const jornadesList = Array.from(new Set(rawData.map(r => r.JORNADA))).filter(Boolean).sort((a,b)=>a-b);
    let acumGoles=0, acumLanz=0, acumAss=0, acumRec=0, acumExcl=0, acumPas=0, acumPar=0, acumGC=0;
    return jornadesList.map(j => {
      const row = rawData.find(r => r.JORNADA === j && r.Jugador === filtreJugador);
      const rival = (rawData.find(r => r.JORNADA === j)?.rival || "").replace(/\(.\)$/,"").trim();
      const label = `J${j}`;
      if (!row) return { label, rival, jugat: false, Goles:0,"Lanzam.":0,Asistencia:0,"Recup.":0,Exclusión:0,Pase:0,Parades:0,GC:0,Efic:0,acumGoles,acumLanz,acumAss,acumRec,acumExcl,acumPas,acumPar,acumGC };
      const goles  = row.Goles || 0;
      const lanz   = row["Lanzam."] || 0;
      const ass    = row.Asistencia || 0;
      const rec    = row["Recup."] || 0;
      const excl   = row["Exclusión"] || 0;
      const pas    = row.Pase || 0;
      const par    = isPorter ? (row.Paradas || row.Goles || 0) : 0;
      const gc     = isPorter ? (lanz - par) : 0;
      const efic   = isPorter ? (lanz ? Math.round((par/lanz)*100) : 0) : (lanz ? Math.round((goles/lanz)*100) : 0);
      acumGoles += goles; acumLanz += lanz; acumAss += ass; acumRec += rec;
      acumExcl  += excl;  acumPas  += pas;  acumPar += par; acumGC  += gc;
      return { label, rival, jugat: true, Goles:goles,"Lanzam.":lanz,Asistencia:ass,"Recup.":rec,Exclusión:excl,Pase:pas,Parades:par,GC:gc,Efic:efic,
               acumGoles,acumLanz,acumAss,acumRec,acumExcl,acumPas,acumPar,acumGC,
               acumEfic: acumLanz ? Math.round((isPorter?acumPar:acumGoles)/acumLanz*100) : 0 };
    });
  }, [filtreJugador, rawData]);

  const statsEquipPerJornada = useMemo(() => {
    const jornadesList = Array.from(new Set(rawData.map(r => r.JORNADA))).filter(Boolean).sort((a,b)=>a-b);
    return jornadesList.map(j => {
      const rows    = rawData.filter(r => r.JORNADA === j);
      const porters = rows.filter(r => r.POSICION === "PORTERO");
      const jugs    = rows.filter(r => r.POSICION === "JUGADOR");
      const gf      = sum(jugs, "Goles");
      // GC = sum of (Lanzam. - Paradas) per porter, only when they played (Lanzam. > 0)
      const gc      = porters.reduce((acc, p) => {
        const lanzReb = p["Lanzam."] || 0;
        const par = p.Paradas || 0;
        return acc + Math.max(0, lanzReb - par);
      }, 0);
      const lanz    = sum(jugs, "Lanzam.");
      const parades = sum(porters, "Paradas");
      const lanzRebuts = porters.reduce((acc, p) => acc + (p["Lanzam."] || 0), 0);
      // Keep full rival string (includes L/V suffix) for unique identification
      const rivalRaw = rows[0]?.rival || "";
      const rivalNet = rivalRaw.replace(/\s*\([LV]\)\s*$/i, "").trim();
      const lv      = rows[0]?.["L/V"] || "";
      return { jornada: `J${j}`, rival: rivalNet, rivalRaw, lv, gf, gc, lanz, parades, lanzRebuts, efic: lanz ? Math.round((gf/lanz)*100) : 0, eficPort: lanzRebuts ? Math.round((parades/lanzRebuts)*100) : 0 };
    });
  }, [rawData]);

  const kpis = useMemo(() => {
    const isPorter = filtreJugador !== "Tots" && getPosicion(filtreJugador) === "PORTERO";
    if (isPorter) {
      const p = statsPerPorter.find(r => r.Jugador === filtreJugador);
      if (p) return {
        totalGols: p.Paradas,
        totalLanz: p["Lanzam."],
        efic: p.eficiencia,
        totalAss: p.Asistencia,
        totalRec: p.GC,
        partitsUnics: p.partitsJugats,
        isPorter: true,
      };
    }
    const totalGols = sum(jugadorsFiltered, "Goles");
    const totalLanz = sum(jugadorsFiltered, "Lanzam.");
    const totalAss  = sum(jugadorsFiltered, "Asistencia");
    const totalRec  = sum(jugadorsFiltered, "Recup.");
    const efic      = totalLanz ? Math.round((totalGols / totalLanz) * 100) : 0;
    const partitsUnics = new Set(filtered.map(r => r.JORNADA)).size;
    return { totalGols, totalLanz, efic, totalAss, totalRec, partitsUnics, isPorter: false };
  }, [jugadorsFiltered, filtered, filtreJugador, statsPerPorter]);

  // ─── Responsive Styles ────────────────────────────────────────────────────
  const S = {
    page:    { minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Inter', system-ui, sans-serif", padding: isMobile ? "16px 12px" : "24px 16px", boxSizing: "border-box" },
    header:  { display: "flex", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "10px" },
    title:   { fontSize: isMobile ? "16px" : "20px", fontWeight: 700, letterSpacing: "-0.5px", lineHeight: 1.3 },
    sub:     { fontSize: "11px", color: C.muted, marginTop: "2px" },
    backBtn: { background: "transparent", border: `1px solid ${C.border}`, color: C.muted, padding: "7px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", whiteSpace: "nowrap" },

    // Tabs — en móvil scroll horizontal
    tabsWrap: { overflowX: "auto", WebkitOverflowScrolling: "touch", marginBottom: "18px", paddingBottom: "2px" },
    tabs:    { display: "flex", gap: "4px", background: C.card, padding: "4px", borderRadius: "10px", border: `1px solid ${C.border}`, width: "fit-content", minWidth: isMobile ? "max-content" : "auto" },
    tab:     (a) => ({ padding: isMobile ? "7px 14px" : "8px 18px", borderRadius: "7px", border: "none", cursor: "pointer", fontSize: isMobile ? "12px" : "13px", fontWeight: 600, background: a ? C.accent : "transparent", color: a ? "#fff" : C.muted, transition: "all .2s", whiteSpace: "nowrap" }),

    // Filtres — columna en móvil
    filters: { display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "18px", alignItems: "flex-end" },
    fgroup:  { display: "flex", flexDirection: "column", gap: "4px", flex: isMobile ? "1 1 calc(50% - 5px)" : "0 1 auto", minWidth: 0 },
    label:   { fontSize: "11px", color: C.muted },
    select:  { background: C.card, border: `1px solid ${C.border}`, color: C.text, padding: "8px 10px", borderRadius: "8px", fontSize: "13px", cursor: "pointer", outline: "none", width: "100%", boxSizing: "border-box" },

    // KPIs — 3 columnas en móvil, auto en desktop
    kpis:    { display: "grid", gridTemplateColumns: isMobile ? "repeat(3, 1fr)" : "repeat(auto-fit, minmax(120px, 1fr))", gap: isMobile ? "8px" : "10px", marginBottom: "18px" },
    kpi:     { background: C.card, border: `1px solid ${C.border}`, borderRadius: "10px", padding: isMobile ? "12px 8px" : "16px", textAlign: "center" },
    kpiVal:  (color) => ({ fontSize: isMobile ? "20px" : "26px", fontWeight: 700, color: color || C.accent }),
    kpiLbl:  { fontSize: isMobile ? "10px" : "11px", color: C.muted, marginTop: "3px" },

    card:    { background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: isMobile ? "14px" : "20px", marginBottom: "14px" },
    cardT:   { fontSize: "11px", fontWeight: 600, color: C.muted, marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.6px" },

    // Tabla con scroll horizontal en móvil
    tableWrap: { overflowX: "auto", WebkitOverflowScrolling: "touch", marginTop: "4px" },
    table:   { width: "100%", borderCollapse: "collapse", fontSize: isMobile ? "12px" : "13px", minWidth: isMobile ? "520px" : "auto" },
    th:      { padding: isMobile ? "8px 10px" : "10px 12px", textAlign: "left", color: C.muted, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.4px", borderBottom: `1px solid ${C.border}`, cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" },
    td:      { padding: isMobile ? "8px 10px" : "9px 12px", borderBottom: `1px solid ${C.border}20` },
    tdr:     { padding: isMobile ? "8px 10px" : "9px 12px", borderBottom: `1px solid ${C.border}20`, textAlign: "right", fontVariantNumeric: "tabular-nums" },
    badge:   (color) => ({ background: `${color}22`, color, padding: "2px 6px", borderRadius: "4px", fontSize: "11px", fontWeight: 600, display: "inline-block" }),

    // Botones gráfica — scroll horizontal en móvil
    gBtnsWrap: { overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: "2px" },
    gBtns:   { display: "flex", gap: "6px", width: "max-content" },
    gBtn:    (a) => ({ padding: "5px 11px", borderRadius: "6px", border: `1px solid ${a ? C.accent : C.border}`, background: a ? `${C.accent}22` : "transparent", color: a ? C.accent : C.muted, fontSize: "11px", cursor: "pointer", fontWeight: a ? 600 : 400, whiteSpace: "nowrap" }),
    clearBtn:{ background: "transparent", border: `1px solid ${C.negative}`, color: C.negative, padding: "7px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", alignSelf: "flex-end" },
  };

  const toggleOrder = (col) => { if (ordenarPer === col) setOrdenDesc(!ordenDesc); else { setOrdenarPer(col); setOrdenDesc(true); } };
  const arr = (col) => ordenarPer === col ? (ordenDesc ? " ↓" : " ↑") : "";
  const hasFilter = filtreJornada !== "Totes" || filtreRival !== "Tots" || filtreJugador !== "Tots";
  const clearFilters = () => { setFiltreJornada("Totes"); setFiltreRival("Tots"); setFiltreJugador("Tots"); };

  const tooltipStyle = { contentStyle: { background: C.card, border: `1px solid ${C.border}`, borderRadius: "8px", color: C.text, fontSize: "12px" } };

  // Altura gràfiques adaptada al dispositiu
  const chartH = isMobile ? 200 : 260;
  // Margen inferior para labels rotados
  const chartMarginBottom = isMobile ? 70 : 64;

  if (loading) return (
    <div style={{ ...S.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}><div style={{ fontSize: "36px" }}>⏳</div><p style={{ color: C.muted, marginTop: "12px" }}>Carregant estadístiques...</p></div>
    </div>
  );

  if (error) return (
    <div style={{ ...S.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.card, border: `1px solid ${C.accent}44`, borderRadius: "12px", padding: "24px", maxWidth: "90vw", textAlign: "center" }}>
        <div style={{ fontSize: "32px" }}>⚠️</div>
        <p style={{ color: C.accent, fontWeight: 600, margin: "12px 0 8px" }}>Error carregant el fitxer</p>
        <p style={{ color: C.muted, fontSize: "13px", marginBottom: "16px" }}>{error}</p>
        <p style={{ color: C.muted, fontSize: "12px", background: `${C.border}44`, padding: "12px", borderRadius: "8px", textAlign: "left" }}>
          📁 El fitxer <strong style={{ color: C.text }}>LLIGA INFANTIL MASCULI 3FASE 25_26.xlsm</strong> ha d'estar a la carpeta <strong style={{ color: C.text }}>/public</strong>.
        </p>
        <button style={{ ...S.backBtn, marginTop: "16px" }} onClick={() => navigate("/")}>← Enrere</button>
      </div>
    </div>
  );

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={S.title}>📊 Estadístiques — Lliga Infantil Masculí</div>
          <div style={S.sub}>Fase 3 · Temporada 25/26 · {rawData.length} registres</div>
        </div>
        <button style={S.backBtn} onClick={() => navigate("/")}>← Enrere</button>
      </div>

      {/* Tabs — scrollables en móvil */}
      <div style={S.tabsWrap}>
        <div style={S.tabs}>
          {[["individual","👤 Individual"],["equip","🏆 Equip"],["resultats","📋 Resultats"]].map(([id,lbl]) => (
            <button key={id} style={S.tab(tab===id)} onClick={() => setTab(id)}>{lbl}</button>
          ))}
        </div>
      </div>

      {/* ══ INDIVIDUAL ══ */}
      {tab === "individual" && (<>
        {/* Filtres */}
        <div style={S.filters}>
          {[["Jornada", jornades, filtreJornada, setFiltreJornada],
            ["Rival",   rivals,   filtreRival,   setFiltreRival],
            ["Jugador", jugadors, filtreJugador,  setFiltreJugador],
          ].map(([lbl, opts, val, set]) => (
            <div key={lbl} style={S.fgroup}>
              <span style={S.label}>{lbl}</span>
              <select style={S.select} value={val} onChange={e => set(e.target.value)}>
                {opts.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          {hasFilter && <button style={S.clearBtn} onClick={clearFilters}>✕ Netejar</button>}
        </div>

        {/* KPIs */}
        <div style={S.kpis}>
          {(kpis.isPorter ? [
            [kpis.totalGols,   "Parades totals",  C.accent2],
            [kpis.totalLanz,   "Lançaments reb.", null],
            [`${kpis.efic}%`,  "Eficiència",      kpis.efic>=60?C.positive:kpis.efic>=45?C.warning:C.negative],
            [kpis.totalAss,    "Assistències",    C.accent3],
            [kpis.totalRec,    "Gols encaixats",  C.negative],
            [kpis.partitsUnics,"Jornades jug.",   C.warning],
          ] : [
            [kpis.totalGols,   "Gols totals",   null],
            [kpis.totalLanz,   "Lançaments",    null],
            [`${kpis.efic}%`,  "Eficiència",    null],
            [kpis.totalAss,    "Assistències",  C.accent2],
            [kpis.totalRec,    "Recuperacions", C.accent3],
            [kpis.partitsUnics,"Jornades",      C.warning],
          ]).map(([val,lbl,color]) => (
            <div key={lbl} style={S.kpi}>
              <div style={S.kpiVal(color)}>{val}</div>
              <div style={S.kpiLbl}>{lbl}</div>
            </div>
          ))}
        </div>

        {/* Gràfica barres */}
        <div style={S.card}>
          <div style={{ marginBottom: "12px" }}>
            <div style={{ ...S.cardT, marginBottom: "8px" }}>Gràfica {vistaMedia ? "(mitjana/partit)" : "(total)"}</div>
            {/* Botones gràfica — scroll horizontal */}
            <div style={S.gBtnsWrap}>
              <div style={S.gBtns}>
                {["Gols/Lançaments","Eficiència","Accions positives","Accions negatives"].map(g => (
                  <button key={g} style={S.gBtn(filtreGrafic===g)} onClick={() => setFiltreGrafic(g)}>{g}</button>
                ))}
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={chartH}>
            <BarChart data={graficaIndividual} margin={{ top:16, right:8, bottom:chartMarginBottom, left: isMobile ? -10 : 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="name" tick={{ fill:C.muted, fontSize: isMobile ? 9 : 11 }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fill:C.muted, fontSize: isMobile ? 9 : 11 }} width={isMobile ? 28 : 40} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ color:C.muted, fontSize: isMobile ? 10 : 12 }} />
              {graficaBarsKeys.map((k,i) => (
                <Bar key={k} dataKey={k} fill={COLORS[i]} radius={[4,4,0,0]}>
                  {!isMobile && (
                    <LabelList dataKey={k} position="top" style={{ fill: C.muted, fontSize: 11, fontVariantNumeric: "tabular-nums" }} formatter={v => v > 0 ? v : ""} />
                  )}
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── EVOLUCIÓ PER JORNADA (només quan hi ha jugador seleccionat) ── */}
        {filtreJugador !== "Tots" && evoJugador.length > 0 && (() => {
          const isPorter = getPosicion(filtreJugador) === "PORTERO";
          // Definim els grups de camps disponibles
          const campsJugador = [
            { id: "Gols/Lançaments",    keys: ["Goles","Lanzam."],          acumKeys: ["acumGoles","acumLanz"] },
            { id: "Eficiència (%)",      keys: ["Efic"],                     acumKeys: ["acumEfic"] },
            { id: "Accions positives",   keys: ["Asistencia","Recup."],      acumKeys: ["acumAss","acumRec"] },
            { id: "Accions negatives",   keys: ["Exclusión","Pase"],         acumKeys: ["acumExcl","acumPas"] },
          ];
          const campsPorter = [
            { id: "Parades/Lançaments", keys: ["Parades","Lanzam."],        acumKeys: ["acumPar","acumLanz"] },
            { id: "Eficiència (%)",      keys: ["Efic"],                     acumKeys: ["acumEfic"] },
            { id: "Gols encaixats",      keys: ["GC"],                       acumKeys: ["acumGC"] },
            { id: "Accions",             keys: ["Asistencia","Pase"],        acumKeys: ["acumAss","acumPas"] },
          ];
          const campsList = isPorter ? campsPorter : campsJugador;
          const campActiu = campsList.find(c => c.id === grafEvoCamp) || campsList[0];
          const dataKeys  = grafEvoMode === "acumulat" ? campActiu.acumKeys : campActiu.keys;
          // Noms mostrats a llegenda (treure prefix "acum")
          const keyLabel  = k => k.replace(/^acum/,"").replace("Goles","Gols").replace("Lanz","Lançam.").replace("Ass","Assist.").replace("Rec","Recup.").replace("Excl","Exclusions").replace("Pas","Pèrd.Passe").replace("Par","Parades").replace("GC","Gols enc.");
          const grafData  = evoJugador.filter(d => d.jugat);
          // Custom tooltip
          const EvoTooltip = ({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            const d = evoJugador.find(r => r.label === label);
            return (
              <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"8px", padding:"10px 14px", fontSize:"12px" }}>
                <div style={{ fontWeight:700, marginBottom:"4px" }}>{label}{d?.rival ? ` — ${d.rival}` : ""}</div>
                {payload.map(p => <div key={p.dataKey} style={{ color:p.fill||p.stroke }}>{keyLabel(p.dataKey)}: <strong>{p.value}</strong>{campActiu.id==="Eficiència (%)"?"%":""}</div>)}
              </div>
            );
          };
          const ChartComp = grafEvoTipus === "linies" ? LineChart : BarChart;
          return (
            <div style={S.card}>
              {/* Capçalera amb controls */}
              <div style={{ display:"flex", flexWrap:"wrap", gap:"8px", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"12px" }}>
                <div style={S.cardT}>📈 Evolució per jornada — {filtreJugador}</div>
                {/* Toggle Partit / Acumulat */}
                <div style={{ display:"flex", gap:"3px", background:`${C.border}44`, padding:"3px", borderRadius:"8px", alignSelf:"center" }}>
                  {[["partit","Per partit"],["acumulat","Acumulat"]].map(([val,lbl]) => (
                    <button key={val} onClick={() => setGrafEvoMode(val)} style={{ padding:"4px 12px", borderRadius:"6px", border:"none", cursor:"pointer", fontSize:"11px", fontWeight:600, background: grafEvoMode===val ? C.accent : "transparent", color: grafEvoMode===val ? "#fff" : C.muted, transition:"all .2s" }}>{lbl}</button>
                  ))}
                </div>
              </div>
              {/* Selector de camp + tipus gràfica */}
              <div style={{ display:"flex", flexWrap:"wrap", gap:"8px", marginBottom:"14px", alignItems:"center" }}>
                <div style={S.gBtnsWrap}>
                  <div style={S.gBtns}>
                    {campsList.map(c => (
                      <button key={c.id} style={S.gBtn(grafEvoCamp===c.id)} onClick={() => setGrafEvoCamp(c.id)}>{c.id}</button>
                    ))}
                  </div>
                </div>
                <div style={{ display:"flex", gap:"3px", background:`${C.border}44`, padding:"3px", borderRadius:"8px", marginLeft:"auto" }}>
                  {[["barres","▮▮"],["linies","╱╲"]].map(([val,lbl]) => (
                    <button key={val} onClick={() => setGrafEvoTipus(val)} style={{ padding:"4px 12px", borderRadius:"6px", border:"none", cursor:"pointer", fontSize:"13px", fontWeight:700, background: grafEvoTipus===val ? C.accent2 : "transparent", color: grafEvoTipus===val ? "#fff" : C.muted, transition:"all .2s" }}>{lbl}</button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={isMobile ? 200 : 240}>
                <ChartComp data={grafData} margin={{ top:16, right:8, bottom:8, left: isMobile ? -10 : 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="label" tick={{ fill:C.muted, fontSize: isMobile ? 10 : 12 }} />
                  <YAxis tick={{ fill:C.muted, fontSize: isMobile ? 9 : 11 }} width={isMobile ? 28 : 40} domain={campActiu.id==="Eficiència (%)" ? [0,100] : undefined} />
                  <Tooltip content={<EvoTooltip />} />
                  <Legend wrapperStyle={{ color:C.muted, fontSize: isMobile ? 10 : 12 }} formatter={keyLabel} />
                  {grafEvoTipus === "barres"
                    ? dataKeys.map((k,i) => (
                        <Bar key={k} dataKey={k} name={k} fill={COLORS[i]} radius={[4,4,0,0]}>
                          <LabelList dataKey={k} position="top" style={{ fill:C.muted, fontSize:10 }} formatter={v => v > 0 ? (campActiu.id==="Eficiència (%)" ? `${v}%` : v) : ""} />
                        </Bar>
                      ))
                    : dataKeys.map((k,i) => (
                        <Line key={k} type="monotone" dataKey={k} name={k} stroke={COLORS[i]} strokeWidth={2} dot={{ fill:COLORS[i], r: isMobile?3:5 }} label={!isMobile ? { position:"top", fill:COLORS[i], fontSize:11, formatter: v => v>0?(campActiu.id==="Eficiència (%)"?`${v}%`:v):"" } : false} />
                      ))
                  }
                </ChartComp>
              </ResponsiveContainer>
            </div>
          );
        })()}

        {/* Radar + Taula — siempre en columna en móvil */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {filtreJugador !== "Tots" && radarData.length > 0 && (
            <div style={S.card}>
              <div style={S.cardT}>Perfil — {filtreJugador}</div>
              <div style={{ fontSize:"10px", color:C.muted, marginBottom:"8px", marginTop:"-6px" }}>
                Valors percentuals respecte al millor de l'equip en cada categoria (100% = màxim del equip)
              </div>
              <ResponsiveContainer width="100%" height={isMobile ? 220 : 260}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke={C.border} />
                  <PolarAngleAxis dataKey="stat" tick={{ fill:C.muted, fontSize: isMobile ? 10 : 11 }} />
                  <PolarRadiusAxis domain={[0,100]} tick={{ fill:C.muted, fontSize:9 }} tickCount={4} axisLine={false} />
                  <Radar dataKey="val" stroke={C.accent} fill={C.accent} fillOpacity={0.25}
                    label={{ position:"insideTopRight", fill:C.accent, fontSize:10, formatter: v => v > 0 ? `${v}%` : "" }} />
                  <Tooltip contentStyle={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"8px", color:C.text, fontSize:"12px" }}
                    formatter={(v) => [`${v}%`, "Vs. millor equip"]} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div style={{ ...S.card, padding: isMobile ? "14px 10px" : "20px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px", flexWrap:"wrap", gap:"8px" }}>
              <div style={S.cardT}>Rànquing jugadors</div>
              <div style={{ display:"flex", gap:"3px", background:`${C.border}44`, padding:"3px", borderRadius:"8px" }}>
                <button onClick={() => setVistaMedia(false)} style={{ padding:"4px 12px", borderRadius:"6px", border:"none", cursor:"pointer", fontSize:"11px", fontWeight:600, background: !vistaMedia ? C.accent : "transparent", color: !vistaMedia ? "#fff" : C.muted, transition:"all .2s" }}>Total</button>
                <button onClick={() => setVistaMedia(true)}  style={{ padding:"4px 12px", borderRadius:"6px", border:"none", cursor:"pointer", fontSize:"11px", fontWeight:600, background:  vistaMedia ? C.accent : "transparent", color:  vistaMedia ? "#fff" : C.muted, transition:"all .2s" }}>Mitjana</button>
              </div>
            </div>
            {/* Tabla con scroll horizontal */}
            <div style={S.tableWrap}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.th}>#</th>
                    <th style={S.th}>Jugador</th>
                    <th style={S.th}>PJ</th>
                    {(vistaMedia
                      ? [["avgGoles","Gols/P"],["avgLanzam","Lanz/P"],["eficiencia","Efic%"],["avgAsistencia","Ass/P"],["avgRecup","Rec/P"],["avgExclusion","Exc/P"],["avgPenalti","Pen/P"]]
                      : [["Goles","Gols"],["Lanzam.","Lanz."],["eficiencia","Efic%"],["Asistencia","Ass."],["Recup.","Rec."],["Exclusión","Exc."],["PenaltiProvocado","Pen."]]
                    ).map(([col,lbl]) => (
                      <th key={col} style={S.th} onClick={() => toggleOrder(col)}>{lbl}{arr(col)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {statsSorted.map((row, i) => (
                    <tr key={row.Jugador}
                      style={{ background: i%2===0?"transparent":`${C.border}18`, cursor:"pointer" }}
                      onClick={() => setFiltreJugador(row.Jugador === filtreJugador ? "Tots" : row.Jugador)}>
                      <td style={S.td}><span style={S.badge(i<3?C.warning:C.muted)}>{i+1}</span></td>
                      <td style={{ ...S.td, fontWeight:600, color: row.Jugador===filtreJugador?C.accent:C.text, whiteSpace: "nowrap" }}>{row.Jugador}</td>
                      <td style={{ ...S.tdr, color:C.muted, fontSize:"11px" }}>{row.partitsJugats}<span style={{ color:C.border, fontSize:"10px" }}>/{row.partits}</span></td>
                      {vistaMedia ? (<>
                        <td style={S.tdr}>{row.avgGoles}</td>
                        <td style={S.tdr}>{row.avgLanzam}</td>
                        <td style={S.tdr}><span style={S.badge(row.eficiencia>=70?C.positive:row.eficiencia>=50?C.warning:C.negative)}>{row.eficiencia}%</span></td>
                        <td style={S.tdr}>{row.avgAsistencia}</td>
                        <td style={S.tdr}>{row.avgRecup}</td>
                        <td style={S.tdr}>{row.avgExclusion}</td>
                        <td style={S.tdr}>{row.avgPenalti}</td>
                      </>) : (<>
                        <td style={S.tdr}>{row.Goles}</td>
                        <td style={S.tdr}>{row["Lanzam."]}</td>
                        <td style={S.tdr}><span style={S.badge(row.eficiencia>=70?C.positive:row.eficiencia>=50?C.warning:C.negative)}>{row.eficiencia}%</span></td>
                        <td style={S.tdr}>{row.Asistencia}</td>
                        <td style={S.tdr}>{row["Recup."]}</td>
                        <td style={S.tdr}>{row.Exclusión}</td>
                        <td style={S.tdr}>{row.PenaltiProvocado}</td>
                      </>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize:"11px", color:C.muted, marginTop:"10px" }}>💡 Clica columna per ordenar · Clica jugador per veure perfil radar</p>
          </div>
        </div>

        {/* ── PORTERS ── */}
        {statsPerPorter.length > 0 && (() => {
          // Dades per la gràfica de porters
          const grafPorter = statsPerPorter.map(p => ({
            name: p.Jugador,
            Parades:   vistaMedia ? p.avgParades  : p.Paradas,
            "Lanz. reb.": vistaMedia ? p.avgLanzReb : p["Lanzam."],
          }));
          const grafEfic = statsPerPorter.map(p => ({ name: p.Jugador, "Efic. %": p.eficiencia }));
          const grafAccions = statsPerPorter.map(p => ({
            name: p.Jugador,
            Assistències: vistaMedia ? p.avgAss  : p.Asistencia,
            "Pèrd. Passe": vistaMedia ? p.avgPase : p.Pase,
          }));
          const [grafPorterActiu, setGrafPorterActiu] = [filtreGraficPorter, setFiltreGraficPorter];
          const grafData  = grafPorterActiu === "Parades/Lançaments" ? grafPorter
                          : grafPorterActiu === "Eficiència"          ? grafEfic
                          : grafAccions;
          const grafKeys  = grafPorterActiu === "Parades/Lançaments" ? ["Parades","Lanz. reb."]
                          : grafPorterActiu === "Eficiència"          ? ["Efic. %"]
                          : ["Assistències","Pèrd. Passe"];
          return (
            <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
              {/* Gràfica porters */}
              <div style={S.card}>
                <div style={{ marginBottom:"10px" }}>
                  <div style={{ ...S.cardT, marginBottom:"8px" }}>🧤 Porters — Gràfica {vistaMedia ? "(mitjana/P)" : "(total)"}</div>
                  <div style={S.gBtnsWrap}>
                    <div style={S.gBtns}>
                      {["Parades/Lançaments","Eficiència","Accions"].map(g => (
                        <button key={g} style={S.gBtn(grafPorterActiu===g)} onClick={() => setFiltreGraficPorter(g)}>{g}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={isMobile ? 180 : 220}>
                  <BarChart data={grafData} margin={{ top:16, right:8, bottom:20, left: isMobile ? -10 : 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                    <XAxis dataKey="name" tick={{ fill:C.muted, fontSize: isMobile ? 11 : 12 }} />
                    <YAxis tick={{ fill:C.muted, fontSize: isMobile ? 9 : 11 }} width={isMobile ? 28 : 40} />
                    <Tooltip {...tooltipStyle} />
                    <Legend wrapperStyle={{ color:C.muted, fontSize: isMobile ? 10 : 12 }} />
                    {grafKeys.map((k,i) => (
                      <Bar key={k} dataKey={k} fill={COLORS[i+1]} radius={[4,4,0,0]}>
                        <LabelList dataKey={k} position="top" style={{ fill:C.muted, fontSize:11 }} formatter={v => v > 0 ? v : ""} />
                      </Bar>
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Taula porters */}
              <div style={S.card}>
                <div style={S.cardT}>🧤 Porters — Rànquing</div>
                <div style={S.tableWrap}>
                  <table style={{ ...S.table, minWidth: isMobile ? "500px" : "auto" }}>
                    <thead>
                      <tr>
                        <th style={S.th}>Porter</th>
                        <th style={S.th}>PJ</th>
                        {vistaMedia ? (<>
                          <th style={S.th}>Par/P</th>
                          <th style={S.th}>LR/P</th>
                          <th style={S.th}>GC/P</th>
                          <th style={S.th}>Efic.%</th>
                          <th style={S.th}>Ass/P</th>
                          <th style={S.th}>Pas/P</th>
                        </>) : (<>
                          <th style={S.th}>Parades</th>
                          <th style={S.th}>Lanz. reb.</th>
                          <th style={S.th}>GC</th>
                          <th style={S.th}>Efic.%</th>
                          <th style={S.th}>Ass.</th>
                          <th style={S.th}>Pèrd. Passe</th>
                        </>)}
                      </tr>
                    </thead>
                    <tbody>
                      {[...statsPerPorter].sort((a,b) => b.eficiencia - a.eficiencia).map((row, i) => (
                        <tr key={row.Jugador} style={{ background: i%2===0?"transparent":`${C.border}18` }}>
                          <td style={{ ...S.td, fontWeight:600 }}>{row.Jugador}</td>
                          <td style={{ ...S.tdr, color:C.muted, fontSize:"11px" }}>{row.partitsJugats}<span style={{ color:C.border, fontSize:"10px" }}>/{row.partits}</span></td>
                          {vistaMedia ? (<>
                            <td style={S.tdr}>{row.avgParades}</td>
                            <td style={S.tdr}>{row.avgLanzReb}</td>
                            <td style={S.tdr}><strong style={{ color:C.negative }}>{row.avgGC}</strong></td>
                            <td style={S.tdr}><span style={S.badge(row.eficiencia>=60?C.positive:row.eficiencia>=45?C.warning:C.negative)}>{row.eficiencia}%</span></td>
                            <td style={S.tdr}>{row.avgAss}</td>
                            <td style={S.tdr}>{row.avgPase}</td>
                          </>) : (<>
                            <td style={S.tdr}>{row.Paradas}</td>
                            <td style={S.tdr}>{row["Lanzam."]}</td>
                            <td style={S.tdr}><strong style={{ color:C.negative }}>{row.GC}</strong></td>
                            <td style={S.tdr}><span style={S.badge(row.eficiencia>=60?C.positive:row.eficiencia>=45?C.warning:C.negative)}>{row.eficiencia}%</span></td>
                            <td style={S.tdr}>{row.Asistencia}</td>
                            <td style={S.tdr}>{row.Pase}</td>
                          </>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}
      </>)}

      {/* ══ EQUIP ══ */}
      {tab === "equip" && (<>
        <div style={S.filters}>
          <div style={{ ...S.fgroup, flex: "0 1 auto" }}>
            <span style={S.label}>Jornada</span>
            <select style={S.select} value={filtreJornada} onChange={e => setFiltreJornada(e.target.value)}>
              {jornades.map(j => <option key={j}>{j}</option>)}
            </select>
          </div>
        </div>
        {(() => {
          const data = filtreJornada === "Totes" ? statsEquipPerJornada : statsEquipPerJornada.filter(r => r.jornada===`J${filtreJornada}`);
          const totalGF  = sum(data,"gf");
          const totalGC  = sum(data,"gc");
          const totalLanz= sum(data,"lanz");
          const totalPar = sum(data,"parades");
          const eficAtac = totalLanz ? Math.round((totalGF/totalLanz)*100) : 0;
          const totalLanzRebuts = sum(data,"lanzRebuts");
          const eficPort = totalLanzRebuts ? Math.round((totalPar/totalLanzRebuts)*100) : 0;
          return (<>
            <div style={S.kpis}>
              {[[totalGF,"Gols favor",C.positive],[totalGC,"Gols contra",C.negative],[`${eficAtac}%`,"Efic. atac",null],[`${eficPort}%`,"Efic. porteria",C.accent2],[totalPar,"Parades",C.accent3],[data.length,"Partits",C.warning]].map(([v,l,color]) => (
                <div key={l} style={S.kpi}><div style={S.kpiVal(color)}>{v}</div><div style={S.kpiLbl}>{l}</div></div>
              ))}
            </div>
            <div style={S.card}>
              <div style={S.cardT}>Evolució per jornades</div>
              <ResponsiveContainer width="100%" height={chartH}>
                <LineChart data={statsEquipPerJornada} margin={{ top:10, right:8, bottom:10, left: isMobile ? -10 : 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="jornada" tick={{ fill:C.muted, fontSize: isMobile ? 10 : 12 }} />
                  <YAxis tick={{ fill:C.muted, fontSize: isMobile ? 10 : 12 }} width={isMobile ? 28 : 40} />
                  <Tooltip {...tooltipStyle}
                    formatter={(v,n) => [n==="eficPort"?`${v}%`:v, n==="gf"?"Gols favor":n==="gc"?"Gols contra":n==="eficPort"?"Efic. porteria":n]}
                    labelFormatter={l => { const d=statsEquipPerJornada.find(r=>r.jornada===l); return d?`${l} vs ${d.rival}`:l; }} />
                  <Legend wrapperStyle={{ color:C.muted, fontSize: isMobile ? 10 : 12 }} formatter={v => v==="gf"?"Gols favor":v==="gc"?"Gols contra":v==="eficPort"?"Efic. porteria (%)":v} />
                  <Line type="monotone" dataKey="gf" stroke={C.positive} strokeWidth={2} dot={{ fill:C.positive, r: isMobile ? 3 : 5 }} label={!isMobile ? { position:"top", fill:C.positive, fontSize:11 } : false} />
                  <Line type="monotone" dataKey="gc" stroke={C.negative} strokeWidth={2} dot={{ fill:C.negative, r: isMobile ? 3 : 5 }} label={!isMobile ? { position:"top", fill:C.negative, fontSize:11 } : false} />
                  <Line type="monotone" dataKey="efic" stroke={C.warning} strokeWidth={2} strokeDasharray="5 5" dot={{ fill:C.warning, r: isMobile ? 3 : 4 }} />
                  <Line type="monotone" dataKey="eficPort" stroke={C.accent2} strokeWidth={2} strokeDasharray="4 3" dot={{ fill:C.accent2, r: isMobile ? 3 : 4 }} label={!isMobile ? { position:"bottom", fill:C.accent2, fontSize:10, formatter: v => v>0?`${v}%`:"" } : false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={{ ...S.card }}>
              <div style={S.cardT}>Resultats per jornada</div>
              <div style={S.tableWrap}>
                <table style={{ ...S.table, minWidth: isMobile ? "560px" : "auto" }}>
                  <thead><tr>{["Jornada","Rival","L/V","Gols F","Gols C","Lanz.","Efic%","Parades","Resultat"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {statsEquipPerJornada.map((row,i) => (
                      <tr key={row.jornada} style={{ background: i%2===0?"transparent":`${C.border}18` }}>
                        <td style={S.td}><strong>{row.jornada}</strong></td>
                        <td style={{ ...S.td, whiteSpace: "nowrap" }}>{row.rival}</td>
                        <td style={S.td}><span style={S.badge(row.lv==="L"?C.accent2:C.accent3)}>{row.lv==="L"?"Casa":"Fora"}</span></td>
                        <td style={S.tdr}><strong style={{ color:C.positive }}>{row.gf}</strong></td>
                        <td style={S.tdr}><strong style={{ color:C.negative }}>{row.gc}</strong></td>
                        <td style={S.tdr}>{row.lanz}</td>
                        <td style={S.tdr}><span style={S.badge(row.efic>=70?C.positive:row.efic>=50?C.warning:C.negative)}>{row.efic}%</span></td>
                        <td style={S.tdr}>{row.parades}</td>
                        <td style={S.td}><span style={S.badge(row.gf>row.gc?C.positive:row.gf<row.gc?C.negative:C.warning)}>{row.gf>row.gc?"✓ Victòria":row.gf<row.gc?"✗ Derrota":"= Empat"}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>);
        })()}
      </>)}

      {/* ══ RESULTATS ══ */}
      {tab === "resultats" && (<>
        <div style={S.filters}>
          {[["Jornada",jornades,filtreJornada,setFiltreJornada],["Rival",rivals,filtreRival,setFiltreRival],["Jugador",jugadors,filtreJugador,setFiltreJugador]].map(([lbl,opts,val,set]) => (
            <div key={lbl} style={S.fgroup}>
              <span style={S.label}>{lbl}</span>
              <select style={S.select} value={val} onChange={e => set(e.target.value)}>
                {opts.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          {hasFilter && <button style={S.clearBtn} onClick={clearFilters}>✕ Netejar</button>}
        </div>

        <div style={S.card}>
          <div style={S.cardT}>Gols per rival (per partit)</div>
          <ResponsiveContainer width="100%" height={chartH}>
            <BarChart data={(() => {
              // Group by (JORNADA, rivalRaw) to keep home/away as separate entries
              const map = {};
              rawData.forEach(r => {
                const rivalRaw = r.rival || "?";
                const rivalNet = rivalRaw.replace(/\s*\([LV]\)\s*$/i,"").trim();
                const lv = r["L/V"] || "";
                const label = `${rivalNet}${lv ? ` (${lv})` : ""}`;
                const k = `${r.JORNADA}_${rivalRaw}`;
                if (!map[k]) map[k] = { rival: label, gf:0, gc:0, _order: r.JORNADA };
                if (r.POSICION === "JUGADOR") map[k].gf += r.Goles || 0;
                if (r.POSICION === "PORTERO") map[k].gc += Math.max(0, (r["Lanzam."]||0) - (r.Paradas||0));
              });
              return Object.values(map).sort((a,b) => a._order - b._order);
            })()} margin={{ top:16, right:8, bottom:chartMarginBottom, left: isMobile ? -10 : 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="rival" tick={{ fill:C.muted, fontSize: isMobile ? 9 : 11 }} angle={-30} textAnchor="end" interval={0} />
              <YAxis tick={{ fill:C.muted, fontSize: isMobile ? 9 : 11 }} width={isMobile ? 28 : 40} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ color:C.muted, fontSize: isMobile ? 10 : 12 }} />
              <Bar dataKey="gf" name="Gols favor"  fill={C.positive} radius={[4,4,0,0]}>
                {!isMobile && <LabelList dataKey="gf" position="top" style={{ fill: C.muted, fontSize: 11 }} formatter={v => v > 0 ? v : ""} />}
              </Bar>
              <Bar dataKey="gc" name="Gols contra" fill={C.negative} radius={[4,4,0,0]}>
                {!isMobile && <LabelList dataKey="gc" position="top" style={{ fill: C.muted, fontSize: 11 }} formatter={v => v > 0 ? v : ""} />}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={S.card}>
          <div style={S.cardT}>Registres detallats ({filtered.length} files)</div>
          <div style={S.tableWrap}>
            <table style={{ ...S.table, minWidth: isMobile ? "580px" : "auto" }}>
              <thead><tr>{["Jugador","Jornada","Rival","Gols","Lanz.","Efic%","Ass.","Rec.","Excl.","Passe","Àrea"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {filtered.map((row,i) => (
                  <tr key={i} style={{ background: i%2===0?"transparent":`${C.border}18` }}>
                    <td style={{ ...S.td, fontWeight:600, whiteSpace:"nowrap" }}>{row.Jugador}</td>
                    <td style={S.tdr}>J{row.JORNADA}</td>
                    <td style={{ ...S.td, fontSize:"11px", color:C.muted, whiteSpace:"nowrap" }}>{(row.rival||"").replace(/\(.\)$/,"").trim()}</td>
                    <td style={S.tdr}>{row.Goles ?? "—"}</td>
                    <td style={S.tdr}>{row["Lanzam."] ?? "—"}</td>
                    <td style={S.tdr}>{row["% lanz"]!=null?`${row["% lanz"]}%`:"—"}</td>
                    <td style={S.tdr}>{row.Asistencia ?? "—"}</td>
                    <td style={S.tdr}>{row["Recup."] ?? "—"}</td>
                    <td style={S.tdr}>{row["Exclusión"] ?? "—"}</td>
                    <td style={S.tdr}>{row.Pase ?? "—"}</td>
                    <td style={S.tdr}>{row.Área ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>)}
    </div>
  );
}
