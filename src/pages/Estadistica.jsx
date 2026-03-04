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

export default function Estadistica() {
  const navigate = useNavigate();
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
        setRawData(json.map(r => ({
          ...r,
          "% lanz": r["% lanz"] != null ? Math.round(r["% lanz"] * 100) : null,
        })));
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

  // Camps estadístics que determinen si un jugador ha jugat
  const STAT_FIELDS = ["Goles","Lanzam.","Asistencia","Recup.","Exclusión","Pase","Área","PenaltiProvocado","Exclusión +"];
  const haJugat = (r) => STAT_FIELDS.some(k => r[k] != null && r[k] !== 0);

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
    const j = statsPerJugador.find(r => r.Jugador === filtreJugador);
    if (!j) return [];
    const mx = k => Math.max(...statsPerJugador.map(x => x[k]), 1);
    return [
      { stat: "Goles",      val: Math.round((j.Goles / mx("Goles")) * 100) },
      { stat: "Lanzam.",    val: Math.round((j["Lanzam."] / mx("Lanzam.")) * 100) },
      { stat: "Efic. %",   val: j.eficiencia },
      { stat: "Assistèn.", val: Math.round((j.Asistencia / mx("Asistencia")) * 100) },
      { stat: "Recup.",    val: Math.round((j["Recup."] / mx("Recup.")) * 100) },
      { stat: "Exc. Prov.", val: Math.round((j["Exclusión +"] / mx("Exclusión +")) * 100) },
    ];
  }, [filtreJugador, statsPerJugador]);

  const statsEquipPerJornada = useMemo(() => {
    const jornadesList = Array.from(new Set(rawData.map(r => r.JORNADA))).filter(Boolean).sort((a,b)=>a-b);
    return jornadesList.map(j => {
      const rows   = rawData.filter(r => r.JORNADA === j);
      const porter = rows.find(r => r.POSICION === "PORTERO");
      const jugs   = rows.filter(r => r.POSICION === "JUGADOR");
      const gf     = sum(jugs, "Goles");
      const gc     = porter ? (porter["goles contra"] || 0) : 0;
      const lanz   = sum(jugs, "Lanzam.");
      const parades = porter ? (porter.Paradas || 0) : 0;
      const rival  = rows[0]?.rival || "";
      const lv     = rows[0]?.["L/V"] || "";
      return { jornada: `J${j}`, rival: rival.replace(/\(.\)$/, "").trim(), lv, gf, gc, lanz, parades, efic: lanz ? Math.round((gf/lanz)*100) : 0 };
    });
  }, [rawData]);

  const kpis = useMemo(() => {
    const totalGols = sum(jugadorsFiltered, "Goles");
    const totalLanz = sum(jugadorsFiltered, "Lanzam.");
    const totalAss  = sum(jugadorsFiltered, "Asistencia");
    const totalRec  = sum(jugadorsFiltered, "Recup.");
    const efic      = totalLanz ? Math.round((totalGols / totalLanz) * 100) : 0;
    const partitsUnics = new Set(filtered.map(r => r.JORNADA)).size;
    return { totalGols, totalLanz, efic, totalAss, totalRec, partitsUnics };
  }, [jugadorsFiltered, filtered]);

  // ─── Styles ───────────────────────────────────────────────────────────────
  const S = {
    page:    { minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Inter', system-ui, sans-serif", padding: "24px 16px" },
    header:  { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" },
    title:   { fontSize: "20px", fontWeight: 700, letterSpacing: "-0.5px" },
    sub:     { fontSize: "12px", color: C.muted, marginTop: "2px" },
    backBtn: { background: "transparent", border: `1px solid ${C.border}`, color: C.muted, padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px" },
    tabs:    { display: "flex", gap: "4px", background: C.card, padding: "4px", borderRadius: "10px", marginBottom: "20px", border: `1px solid ${C.border}`, width: "fit-content" },
    tab:     (a) => ({ padding: "8px 18px", borderRadius: "7px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600, background: a ? C.accent : "transparent", color: a ? "#fff" : C.muted, transition: "all .2s" }),
    filters: { display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px", alignItems: "flex-end" },
    fgroup:  { display: "flex", flexDirection: "column", gap: "4px" },
    label:   { fontSize: "11px", color: C.muted },
    select:  { background: C.card, border: `1px solid ${C.border}`, color: C.text, padding: "7px 12px", borderRadius: "8px", fontSize: "13px", cursor: "pointer", outline: "none" },
    kpis:    { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: "10px", marginBottom: "20px" },
    kpi:     { background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "16px", textAlign: "center" },
    kpiVal:  (color) => ({ fontSize: "26px", fontWeight: 700, color: color || C.accent }),
    kpiLbl:  { fontSize: "11px", color: C.muted, marginTop: "3px" },
    card:    { background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px", marginBottom: "16px" },
    cardT:   { fontSize: "11px", fontWeight: 600, color: C.muted, marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.6px" },
    table:   { width: "100%", borderCollapse: "collapse", fontSize: "13px" },
    th:      { padding: "10px 12px", textAlign: "left", color: C.muted, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.4px", borderBottom: `1px solid ${C.border}`, cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" },
    td:      { padding: "9px 12px", borderBottom: `1px solid ${C.border}20` },
    tdr:     { padding: "9px 12px", borderBottom: `1px solid ${C.border}20`, textAlign: "right", fontVariantNumeric: "tabular-nums" },
    badge:   (color) => ({ background: `${color}22`, color, padding: "2px 7px", borderRadius: "4px", fontSize: "11px", fontWeight: 600 }),
    gBtns:   { display: "flex", gap: "8px", flexWrap: "wrap" },
    gBtn:    (a) => ({ padding: "5px 13px", borderRadius: "6px", border: `1px solid ${a ? C.accent : C.border}`, background: a ? `${C.accent}22` : "transparent", color: a ? C.accent : C.muted, fontSize: "12px", cursor: "pointer", fontWeight: a ? 600 : 400 }),
    clearBtn:{ background: "transparent", border: `1px solid ${C.negative}`, color: C.negative, padding: "7px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "12px" },
  };

  const toggleOrder = (col) => { if (ordenarPer === col) setOrdenDesc(!ordenDesc); else { setOrdenarPer(col); setOrdenDesc(true); } };
  const arr = (col) => ordenarPer === col ? (ordenDesc ? " ↓" : " ↑") : "";
  const hasFilter = filtreJornada !== "Totes" || filtreRival !== "Tots" || filtreJugador !== "Tots";
  const clearFilters = () => { setFiltreJornada("Totes"); setFiltreRival("Tots"); setFiltreJugador("Tots"); };

  const tooltipStyle = { contentStyle: { background: C.card, border: `1px solid ${C.border}`, borderRadius: "8px", color: C.text } };

  if (loading) return (
    <div style={{ ...S.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}><div style={{ fontSize: "36px" }}>⏳</div><p style={{ color: C.muted, marginTop: "12px" }}>Carregant estadístiques...</p></div>
    </div>
  );

  if (error) return (
    <div style={{ ...S.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.card, border: `1px solid ${C.accent}44`, borderRadius: "12px", padding: "32px", maxWidth: "480px", textAlign: "center" }}>
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
      <div style={S.header}>
        <div>
          <div style={S.title}>📊 Estadístiques — Lliga Infantil Masculí</div>
          <div style={S.sub}>Fase 3 · Temporada 25/26 · {rawData.length} registres carregats</div>
        </div>
        <button style={S.backBtn} onClick={() => navigate("/")}>← Enrere</button>
      </div>

      {/* Tabs */}
      <div style={S.tabs}>
        {[["individual","👤 Individual"],["equip","🏆 Equip"],["resultats","📋 Resultats"]].map(([id,lbl]) => (
          <button key={id} style={S.tab(tab===id)} onClick={() => setTab(id)}>{lbl}</button>
        ))}
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
          {[
            [kpis.totalGols,   "Gols totals",   null],
            [kpis.totalLanz,   "Lançaments",    null],
            [`${kpis.efic}%`,  "Eficiència",    null],
            [kpis.totalAss,    "Assistències",  C.accent2],
            [kpis.totalRec,    "Recuperacions", C.accent3],
            [kpis.partitsUnics,"Jornades",      C.warning],
          ].map(([val,lbl,color]) => (
            <div key={lbl} style={S.kpi}>
              <div style={S.kpiVal(color)}>{val}</div>
              <div style={S.kpiLbl}>{lbl}</div>
            </div>
          ))}
        </div>

        {/* Gràfica barres */}
        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
            <div style={S.cardT}>Gràfica {vistaMedia ? "(mitjana/partit)" : "(total)"}</div>
            <div style={S.gBtns}>
              {["Gols/Lançaments","Eficiència","Accions positives","Accions negatives"].map(g => (
                <button key={g} style={S.gBtn(filtreGrafic===g)} onClick={() => setFiltreGrafic(g)}>{g}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={graficaIndividual} margin={{ top:20, right:16, bottom:64, left:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="name" tick={{ fill:C.muted, fontSize:11 }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fill:C.muted, fontSize:11 }} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ color:C.muted, fontSize:12 }} />
              {graficaBarsKeys.map((k,i) => (
                <Bar key={k} dataKey={k} fill={COLORS[i]} radius={[4,4,0,0]}>
                  <LabelList dataKey={k} position="top" style={{ fill: C.muted, fontSize: 11, fontVariantNumeric: "tabular-nums" }} formatter={v => v > 0 ? v : ""} />
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar + Taula */}
        <div style={{ display: "grid", gridTemplateColumns: filtreJugador !== "Tots" && radarData.length ? "320px 1fr" : "1fr", gap: "16px" }}>
          {filtreJugador !== "Tots" && radarData.length > 0 && (
            <div style={S.card}>
              <div style={S.cardT}>Perfil — {filtreJugador}</div>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke={C.border} />
                  <PolarAngleAxis dataKey="stat" tick={{ fill:C.muted, fontSize:11 }} />
                  <PolarRadiusAxis domain={[0,100]} tick={false} axisLine={false} />
                  <Radar dataKey="val" stroke={C.accent} fill={C.accent} fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
          <div style={{ ...S.card, overflowX: "auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"14px", flexWrap:"wrap", gap:"8px" }}>
              <div style={S.cardT}>Rànquing jugadors</div>
              <div style={{ display:"flex", gap:"4px", background:`${C.border}44`, padding:"3px", borderRadius:"8px" }}>
                <button onClick={() => setVistaMedia(false)} style={{ padding:"4px 14px", borderRadius:"6px", border:"none", cursor:"pointer", fontSize:"12px", fontWeight:600, background: !vistaMedia ? C.accent : "transparent", color: !vistaMedia ? "#fff" : C.muted, transition:"all .2s" }}>Total</button>
                <button onClick={() => setVistaMedia(true)}  style={{ padding:"4px 14px", borderRadius:"6px", border:"none", cursor:"pointer", fontSize:"12px", fontWeight:600, background:  vistaMedia ? C.accent : "transparent", color:  vistaMedia ? "#fff" : C.muted, transition:"all .2s" }}>Mitjana/partit</button>
              </div>
            </div>
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
                    <td style={{ ...S.td, fontWeight:600, color: row.Jugador===filtreJugador?C.accent:C.text }}>{row.Jugador}</td>
                    <td style={{ ...S.tdr, color:C.muted, fontSize:"12px" }}>{row.partitsJugats}<span style={{ color:C.border, fontSize:"10px" }}>/{row.partits}</span></td>
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
            <p style={{ fontSize:"11px", color:C.muted, marginTop:"10px" }}>💡 Clica columna per ordenar · Clica jugador per veure perfil radar · PJ = partits jugats / convocats</p>
          </div>
        </div>
      </>)}

      {/* ══ EQUIP ══ */}
      {tab === "equip" && (<>
        <div style={S.filters}>
          <div style={S.fgroup}>
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
          const eficPort = (totalGC+totalPar) ? Math.round((totalPar/(totalGC+totalPar))*100) : 0;
          return (<>
            <div style={S.kpis}>
              {[[totalGF,"Gols a favor",C.positive],[totalGC,"Gols en contra",C.negative],[`${eficAtac}%`,"Efic. atac",null],[`${eficPort}%`,"Efic. porteria",C.accent2],[totalPar,"Parades",C.accent3],[data.length,"Partits",C.warning]].map(([v,l,color]) => (
                <div key={l} style={S.kpi}><div style={S.kpiVal(color)}>{v}</div><div style={S.kpiLbl}>{l}</div></div>
              ))}
            </div>
            <div style={S.card}>
              <div style={S.cardT}>Evolució per jornades</div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={statsEquipPerJornada}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="jornada" tick={{ fill:C.muted, fontSize:12 }} />
                  <YAxis tick={{ fill:C.muted, fontSize:12 }} />
                  <Tooltip {...tooltipStyle}
                    formatter={(v,n) => [v, n==="gf"?"Gols favor":n==="gc"?"Gols contra":n]}
                    labelFormatter={l => { const d=statsEquipPerJornada.find(r=>r.jornada===l); return d?`${l} vs ${d.rival}`:l; }} />
                  <Legend wrapperStyle={{ color:C.muted, fontSize:12 }} formatter={v => v==="gf"?"Gols favor":v==="gc"?"Gols contra":v} />
                  <Line type="monotone" dataKey="gf"   stroke={C.positive} strokeWidth={2} dot={{ fill:C.positive, r:5 }} label={{ position:"top", fill:C.positive, fontSize:11 }} />
                  <Line type="monotone" dataKey="gc"   stroke={C.negative} strokeWidth={2} dot={{ fill:C.negative, r:5 }} label={{ position:"top", fill:C.negative, fontSize:11 }} />
                  <Line type="monotone" dataKey="efic" stroke={C.warning}  strokeWidth={2} strokeDasharray="5 5" dot={{ fill:C.warning, r:4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={{ ...S.card, overflowX:"auto" }}>
              <div style={S.cardT}>Resultats per jornada</div>
              <table style={S.table}>
                <thead><tr>{["Jornada","Rival","L/V","Gols F","Gols C","Lanz.","Efic%","Parades","Resultat"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {statsEquipPerJornada.map((row,i) => (
                    <tr key={row.jornada} style={{ background: i%2===0?"transparent":`${C.border}18` }}>
                      <td style={S.td}><strong>{row.jornada}</strong></td>
                      <td style={S.td}>{row.rival}</td>
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
          <div style={S.cardT}>Gols per rival</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={(() => {
              const map = {};
              rawData.filter(r => r.POSICION==="JUGADOR").forEach(r => {
                const k = r.rival?.replace(/\(.\)$/,"").trim() || "?";
                if (!map[k]) map[k] = { rival:k, gf:0, gc:0 };
                map[k].gf += r.Goles || 0;
              });
              rawData.filter(r => r.POSICION==="PORTERO").forEach(r => {
                const k = r.rival?.replace(/\(.\)$/,"").trim() || "?";
                if (map[k]) map[k].gc = r["goles contra"] || map[k].gc;
              });
              return Object.values(map);
            })()} margin={{ top:20, right:16, bottom:60, left:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="rival" tick={{ fill:C.muted, fontSize:11 }} angle={-30} textAnchor="end" interval={0} />
              <YAxis tick={{ fill:C.muted, fontSize:11 }} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ color:C.muted, fontSize:12 }} />
              <Bar dataKey="gf" name="Gols favor"  fill={C.positive} radius={[4,4,0,0]}>
                <LabelList dataKey="gf" position="top" style={{ fill: C.muted, fontSize: 11 }} formatter={v => v > 0 ? v : ""} />
              </Bar>
              <Bar dataKey="gc" name="Gols contra" fill={C.negative} radius={[4,4,0,0]}>
                <LabelList dataKey="gc" position="top" style={{ fill: C.muted, fontSize: 11 }} formatter={v => v > 0 ? v : ""} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ ...S.card, overflowX:"auto" }}>
          <div style={S.cardT}>Registres detallats ({filtered.length} files)</div>
          <table style={S.table}>
            <thead><tr>{["Jugador","Jornada","Rival","Gols","Lanz.","Efic%","Ass.","Rec.","Excl.","Passe","Àrea"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map((row,i) => (
                <tr key={i} style={{ background: i%2===0?"transparent":`${C.border}18` }}>
                  <td style={{ ...S.td, fontWeight:600 }}>{row.Jugador}</td>
                  <td style={S.tdr}>J{row.JORNADA}</td>
                  <td style={{ ...S.td, fontSize:"12px", color:C.muted }}>{(row.rival||"").replace(/\(.\)$/,"").trim()}</td>
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
      </>)}
    </div>
  );
}
