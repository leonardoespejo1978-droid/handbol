import { useState, useEffect, useRef, useMemo } from "react";
import * as XLSX from "xlsx";

/* ─────────────────────────────────────────────────────────────
   PartitLive — Introducció d'estadística en directe
   Gestió d'equips (propi + rivals) → configuració de partit →
   marcador en directe amb registre d'accions → exportació a Excel
   amb el mateix format de la fulla "Datos" que ja fas servir.
───────────────────────────────────────────────────────────── */

const C = {
  bg: "#0f1117", card: "#1a1d27", card2: "#20232f", border: "#2a2d3a",
  accent: "#e63946", accent2: "#457b9d", accent3: "#2a9d8f",
  text: "#e8eaf0", muted: "#8b8fa8", warning: "#e9c46a",
  positive: "#2a9d8f", negative: "#e63946",
};

const POSICIONS = ["Extrem esquerre", "Extrem dret", "Lateral esquerre", "Lateral dret", "Central", "Pivot", "Porter"];
const esPorter = (posicio) => posicio === "Porter";
const posicioExcel = (posicio) => (esPorter(posicio) ? "PORTERO" : "JUGADOR");

const LS_EQUIPS = "hb_equips_2025_v1";
const LS_PARTIT = "hb_partit_actiu_2025_v1";

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

const loadEquips = () => { try { return JSON.parse(localStorage.getItem(LS_EQUIPS)) || []; } catch { return []; } };
const saveEquips = (e) => { try { localStorage.setItem(LS_EQUIPS, JSON.stringify(e)); } catch {} };
const loadPartit = () => { try { return JSON.parse(localStorage.getItem(LS_PARTIT)); } catch { return null; } };
const savePartit = (p) => { try { localStorage.setItem(LS_PARTIT, JSON.stringify(p)); } catch {} };
const clearPartit = () => { try { localStorage.removeItem(LS_PARTIT); } catch {} };

const buida = () => ({
  Goles: 0, Paradas: 0, Lanzam: 0, Asistencia: 0, Exclusión: 0, Pase: 0,
  Área: 0, Pasos: 0, Otro: 0, "Recup.": 0, "Exclusión +": 0, PenaltiProvocado: 0,
});

const fmtTemps = (s) => {
  const m = Math.floor(Math.max(0, s) / 60).toString().padStart(2, "0");
  const sec = Math.floor(Math.max(0, s) % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
};

export default function PartitLive() {
  const [equips, setEquips] = useState(loadEquips);
  const [vista, setVista] = useState("carregant"); // carregant | equips | equipForm | setup | match | resum
  const [equipEnEdicio, setEquipEnEdicio] = useState(null); // { ...team } o null (nou)
  const [rivalTriat, setRivalTriat] = useState(null);
  const [partit, setPartit] = useState(null);

  useEffect(() => {
    const meuEquip = equips.find((e) => e.esPropi);
    const enCurs = loadPartit();
    if (enCurs) { setPartit(enCurs); setVista("match"); }
    else if (!meuEquip) { setEquipEnEdicio({ id: uid(), nom: "", esPropi: true, jugadors: [] }); setVista("equipForm"); }
    else setVista("equips");
    // eslint-disable-next-line
  }, []);

  useEffect(() => { saveEquips(equips); }, [equips]);
  useEffect(() => { if (partit) savePartit(partit); }, [partit]);

  const meuEquip = equips.find((e) => e.esPropi);
  const rivals = equips.filter((e) => !e.esPropi);

  const desarEquip = (equip) => {
    setEquips((prev) => {
      const existeix = prev.some((e) => e.id === equip.id);
      return existeix ? prev.map((e) => (e.id === equip.id ? equip : e)) : [...prev, equip];
    });
    setEquipEnEdicio(null);
    setVista("equips");
  };

  const esborrarEquip = (id) => {
    if (!confirm("Segur que vols eliminar aquest equip?")) return;
    setEquips((prev) => prev.filter((e) => e.id !== id));
  };

  if (vista === "carregant") return <div style={{ background: C.bg, minHeight: "100vh" }} />;

  if (vista === "equipForm")
    return (
      <EquipForm
        inicial={equipEnEdicio}
        obligatori={!meuEquip}
        onDesar={desarEquip}
        onCancelar={meuEquip ? () => { setEquipEnEdicio(null); setVista("equips"); } : null}
      />
    );

  if (vista === "equips")
    return (
      <EquipsList
        meuEquip={meuEquip}
        rivals={rivals}
        onEditar={(eq) => { setEquipEnEdicio(eq); setVista("equipForm"); }}
        onNouRival={() => { setEquipEnEdicio({ id: uid(), nom: "", esPropi: false, jugadors: [] }); setVista("equipForm"); }}
        onEsborrar={esborrarEquip}
        onIniciarPartit={() => setVista("setup")}
      />
    );

  if (vista === "setup")
    return (
      <MatchSetup
        meuEquip={meuEquip}
        rivals={rivals}
        onCancelar={() => setVista("equips")}
        onComençar={(config) => {
          const nou = {
            ...config,
            part: 1, segons: 0, running: false, log: [],
            stats: { [meuEquip.id]: {}, ...(config.scope === "complet" ? { [config.rivalId]: {} } : {}) },
            porterActiu: {},
          };
          setPartit(nou);
          setVista("match");
        }}
      />
    );

  if (vista === "match" && partit)
    return (
      <MatchLive
        partit={partit}
        setPartit={setPartit}
        meuEquip={meuEquip}
        rival={equips.find((e) => e.id === partit.rivalId)}
        onFinalitzar={() => setVista("resum")}
      />
    );

  if (vista === "resum" && partit)
    return (
      <Resum
        partit={partit}
        meuEquip={meuEquip}
        rival={equips.find((e) => e.id === partit.rivalId)}
        onNouPartit={() => { clearPartit(); setPartit(null); setVista("equips"); }}
      />
    );

  return null;
}

/* ═══════════════════ LLISTAT D'EQUIPS ═══════════════════ */

function EquipsList({ meuEquip, rivals, onEditar, onNouRival, onEsborrar, onIniciarPartit }) {
  const S = estils();
  return (
    <div style={S.page}>
      <div style={{ maxWidth: "760px", margin: "0 auto" }}>
        <h1 style={S.h1}>🤾 Estadística en directe</h1>

        <div style={S.card}>
          <div style={S.cardT}>El meu equip</div>
          {meuEquip ? (
            <EquipRow equip={meuEquip} onEditar={() => onEditar(meuEquip)} destacat />
          ) : (
            <div style={{ color: C.muted, fontSize: "13px" }}>Encara no has donat d'alta el teu equip.</div>
          )}
        </div>

        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <div style={S.cardT}>Equips rivals ({rivals.length})</div>
            <button style={S.btnSmall(C.accent2)} onClick={onNouRival}>+ Alta d'equip rival</button>
          </div>
          {rivals.length === 0 && <div style={{ color: C.muted, fontSize: "13px" }}>Encara no has donat d'alta cap rival.</div>}
          {rivals.map((r) => <EquipRow key={r.id} equip={r} onEditar={() => onEditar(r)} onEsborrar={() => onEsborrar(r.id)} />)}
        </div>

        <button
          style={{ ...S.btnBig(C.accent), width: "100%", opacity: rivals.length ? 1 : 0.4, cursor: rivals.length ? "pointer" : "not-allowed" }}
          disabled={!rivals.length}
          onClick={onIniciarPartit}
        >
          ▶ Iniciar estadística de partit
        </button>
        {!rivals.length && <div style={{ textAlign: "center", color: C.muted, fontSize: "12px", marginTop: "8px" }}>Dona d'alta almenys un equip rival per començar.</div>}
      </div>
    </div>
  );
}

function EquipRow({ equip, onEditar, onEsborrar, destacat }) {
  const S = estils();
  const nPorters = equip.jugadors.filter((j) => esPorter(j.posicio)).length;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "10px",
      background: destacat ? `${C.accent}11` : C.card2, border: `1px solid ${destacat ? C.accent + "55" : C.border}`, marginBottom: "8px",
    }}>
      <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: C.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 700, flexShrink: 0 }}>
        {equip.nom ? equip.nom[0].toUpperCase() : "?"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{equip.nom || "(sense nom)"}</div>
        <div style={{ fontSize: "12px", color: C.muted }}>{equip.jugadors.length} jugadors · {nPorters} porter{nPorters !== 1 ? "s" : ""}</div>
      </div>
      <button style={S.btnSmall(C.accent2)} onClick={onEditar}>Editar</button>
      {onEsborrar && <button style={S.btnSmall(C.negative)} onClick={onEsborrar}>✕</button>}
    </div>
  );
}

/* ═══════════════════ FORMULARI D'EQUIP (crear/editar + plantilla) ═══════════════════ */

function EquipForm({ inicial, obligatori, onDesar, onCancelar }) {
  const S = estils();
  const [nom, setNom] = useState(inicial.nom);
  const [jugadors, setJugadors] = useState(inicial.jugadors);
  const [nou, setNou] = useState({ dorsal: "", nom: "", cognom: "", posicio: POSICIONS[0], foto: null });
  const [editantDorsal, setEditantDorsal] = useState(null); // dorsal original en edició, o null si és alta nova
  const [error, setError] = useState("");
  const MAX_PLANTILLA = 20;

  const afegirJugador = () => {
    if (!nou.dorsal.toString().trim()) { setError("El dorsal és obligatori."); return; }
    const dorsalNou = nou.dorsal.toString().trim();
    const xoc = jugadors.some((j) => String(j.dorsal) === dorsalNou && j.dorsal !== editantDorsal);
    if (xoc) { setError("Ja existeix un jugador amb aquest dorsal."); return; }
    if (editantDorsal !== null) {
      setJugadors((prev) => prev.map((j) => (j.dorsal === editantDorsal ? { ...nou, dorsal: dorsalNou } : j)));
    } else {
      if (jugadors.length >= MAX_PLANTILLA) { setError(`La plantilla admet un màxim de ${MAX_PLANTILLA} jugadors.`); return; }
      setJugadors((prev) => [...prev, { ...nou, dorsal: dorsalNou }]);
    }
    setNou({ dorsal: "", nom: "", cognom: "", posicio: POSICIONS[0], foto: null });
    setEditantDorsal(null);
    setError("");
  };

  const editarJugador = (j) => { setNou({ ...j }); setEditantDorsal(j.dorsal); setError(""); };
  const cancelarEdicio = () => { setNou({ dorsal: "", nom: "", cognom: "", posicio: POSICIONS[0], foto: null }); setEditantDorsal(null); setError(""); };
  const treureJugador = (dorsal) => { setJugadors((prev) => prev.filter((j) => j.dorsal !== dorsal)); if (editantDorsal === dorsal) cancelarEdicio(); };

  const onFoto = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setNou((n) => ({ ...n, foto: reader.result }));
    reader.readAsDataURL(f);
  };

  const guardar = () => {
    if (!nom.trim()) { setError("El nom de l'equip és obligatori."); return; }
    if (!jugadors.length) { setError("Afegeix almenys un jugador (dorsal mínim)."); return; }
    onDesar({ ...inicial, nom: nom.trim(), jugadors });
  };

  return (
    <div style={S.page}>
      <div style={{ maxWidth: "760px", margin: "0 auto" }}>
        <h1 style={S.h1}>{inicial.esPropi ? "🏠 El teu equip" : "🆚 Nou equip rival"}</h1>
        {obligatori && <div style={{ ...S.avis, marginBottom: "16px" }}>Abans de continuar has de donar d'alta el teu propi equip.</div>}

        <div style={S.card}>
          <label style={S.label}>Nom de l'equip</label>
          <input style={S.input} value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex: CH Sant Jordi" />
        </div>

        <div style={S.card}>
          <div style={S.cardT}>{editantDorsal !== null ? `Editant jugador #${editantDorsal}` : "Afegir jugador"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "70px 1fr 1fr", gap: "8px", marginBottom: "8px" }}>
            <input style={S.input} placeholder="Dorsal" value={nou.dorsal} onChange={(e) => setNou((n) => ({ ...n, dorsal: e.target.value.replace(/[^0-9]/g, "") }))} />
            <input style={S.input} placeholder="Nom" value={nou.nom} onChange={(e) => setNou((n) => ({ ...n, nom: e.target.value }))} />
            <input style={S.input} placeholder="Cognom" value={nou.cognom} onChange={(e) => setNou((n) => ({ ...n, cognom: e.target.value }))} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "8px", alignItems: "center", marginBottom: "10px" }}>
            <select style={S.input} value={nou.posicio} onChange={(e) => setNou((n) => ({ ...n, posicio: e.target.value }))}>
              {POSICIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <label style={{ ...S.btnSmall(C.accent2), display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
              📷 Foto
              <input type="file" accept="image/*" onChange={onFoto} style={{ display: "none" }} />
            </label>
          </div>
          {nou.foto && <img src={nou.foto} alt="" style={{ width: "48px", height: "60px", objectFit: "cover", borderRadius: "6px", marginBottom: "10px", border: `1px solid ${C.border}` }} />}
          {error && <div style={{ color: C.negative, fontSize: "12px", marginBottom: "8px" }}>{error}</div>}
          <div style={{ display: "flex", gap: "8px" }}>
            <button style={S.btnSmall(C.accent3)} onClick={afegirJugador}>{editantDorsal !== null ? "💾 Desar canvis" : "+ Afegir a la plantilla"}</button>
            {editantDorsal !== null && <button style={S.btnSmall(C.border)} onClick={cancelarEdicio}>Cancel·lar edició</button>}
          </div>
        </div>

        <div style={S.card}>
          <div style={S.cardT}>Plantilla ({jugadors.length}/{MAX_PLANTILLA})</div>
          {jugadors.length === 0 && <div style={{ color: C.muted, fontSize: "13px" }}>Encara no hi ha jugadors.</div>}
          {jugadors.map((j) => (
            <div key={j.dorsal} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", background: editantDorsal === j.dorsal ? `${C.accent2}18` : C.card2, border: editantDorsal === j.dorsal ? `1px solid ${C.accent2}` : "1px solid transparent", borderRadius: "8px", marginBottom: "6px" }}>
              {j.foto
                ? <img src={j.foto} alt="" style={{ width: "30px", height: "38px", objectFit: "cover", borderRadius: "5px" }} />
                : <div style={{ width: "30px", height: "38px", borderRadius: "5px", background: C.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700 }}>{j.dorsal}</div>}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: "14px" }}>#{j.dorsal} {j.nom} {j.cognom}</div>
                <div style={{ fontSize: "11px", color: esPorter(j.posicio) ? C.warning : C.muted }}>{j.posicio}</div>
              </div>
              <button style={S.btnSmall(C.accent2)} onClick={() => editarJugador(j)}>✎ Editar</button>
              <button style={S.btnSmall(C.negative)} onClick={() => treureJugador(j.dorsal)}>✕</button>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          {onCancelar && <button style={{ ...S.btnBig(C.border), flex: 1 }} onClick={onCancelar}>Cancel·lar</button>}
          <button style={{ ...S.btnBig(C.accent), flex: 2 }} onClick={guardar}>Desar equip</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════ CONFIGURACIÓ DE PARTIT ═══════════════════ */

function MatchSetup({ meuEquip, rivals, onCancelar, onComençar }) {
  const S = estils();
  const MAX_CONVOCATS = 16;
  const [pas, setPas] = useState(0);
  const [rivalId, setRivalId] = useState(rivals[0]?.id || "");
  const [home, setHome] = useState(null); // true = jo sóc amfitrió
  const [fase, setFase] = useState("");
  const [jornada, setJornada] = useState("");
  const [scope, setScope] = useState(null);
  const [convMeu, setConvMeu] = useState([]);
  const [convRival, setConvRival] = useState([]);

  const rival = rivals.find((r) => r.id === rivalId);

  const toggleConv = (llista, setLlista, dorsal) => {
    setLlista((prev) => {
      if (prev.includes(dorsal)) return prev.filter((d) => d !== dorsal);
      if (prev.length >= MAX_CONVOCATS) return prev;
      return [...prev, dorsal];
    });
  };

  const ConvocatoriaEquip = ({ equip, seleccionats, setLlista }) => (
    <div style={{ marginBottom: "14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <strong style={{ fontSize: "13px" }}>{equip.nom}</strong>
        <span style={{ fontSize: "12px", color: seleccionats.length === MAX_CONVOCATS ? C.positive : C.muted }}>{seleccionats.length}/{MAX_CONVOCATS}</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {equip.jugadors.map((j) => {
          const sel = seleccionats.includes(j.dorsal);
          return (
            <button key={j.dorsal} onClick={() => toggleConv(seleccionats, setLlista, j.dorsal)}
              style={{
                padding: "6px 10px", borderRadius: "7px", fontSize: "12px", cursor: "pointer",
                background: sel ? `${C.accent}22` : C.card2, border: `1px solid ${sel ? C.accent : C.border}`, color: sel ? C.accent : C.text,
              }}>
              #{j.dorsal} {j.nom}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div style={S.page}>
      <div style={{ maxWidth: "560px", margin: "0 auto" }}>
        <h1 style={S.h1}>⚙️ Configurar partit</h1>
        <div style={S.card}>
          {pas === 0 && (<>
            <div style={S.cardT}>1. Selecciona el rival</div>
            <select style={S.input} value={rivalId} onChange={(e) => setRivalId(e.target.value)}>
              {rivals.map((r) => <option key={r.id} value={r.id}>{r.nom}</option>)}
            </select>
            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <button style={{ ...S.btnBig(C.border), flex: 1 }} onClick={onCancelar}>Cancel·lar</button>
              <button style={{ ...S.btnBig(C.accent), flex: 2 }} disabled={!rivalId} onClick={() => setPas(1)}>Continuar</button>
            </div>
          </>)}

          {pas === 1 && (<>
            <div style={S.cardT}>2. Qui juga a casa?</div>
            <div style={{ display: "flex", gap: "14px", justifyContent: "center", margin: "20px 0" }}>
              <button style={S.iconChoice(home === true)} onClick={() => { setHome(true); setPas(2); }}>
                <div style={{ fontSize: "40px" }}>🏠</div>
                <div>{meuEquip.nom} amfitrió</div>
              </button>
              <button style={S.iconChoice(home === false)} onClick={() => { setHome(false); setPas(2); }}>
                <div style={{ fontSize: "40px" }}>🚗</div>
                <div>{rival?.nom} amfitrió</div>
              </button>
            </div>
            <button style={{ ...S.btnBig(C.border), width: "100%" }} onClick={() => setPas(0)}>← Enrere</button>
          </>)}

          {pas === 2 && (<>
            <div style={S.cardT}>3. Fase i jornada</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", margin: "12px 0" }}>
              <div><label style={S.label}>Fase</label><input style={S.input} type="number" value={fase} onChange={(e) => setFase(e.target.value)} /></div>
              <div><label style={S.label}>Jornada</label><input style={S.input} type="number" value={jornada} onChange={(e) => setJornada(e.target.value)} /></div>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button style={{ ...S.btnBig(C.border), flex: 1 }} onClick={() => setPas(1)}>← Enrere</button>
              <button style={{ ...S.btnBig(C.accent), flex: 2 }} disabled={fase === "" || jornada === ""} onClick={() => setPas(3)}>Continuar</button>
            </div>
          </>)}

          {pas === 3 && (<>
            <div style={S.cardT}>4. Tipus d'estadística</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", margin: "16px 0" }}>
              <button style={S.choiceRow(scope === "propi")} onClick={() => setScope("propi")}>
                <strong>Només el meu equip</strong>
                <div style={{ fontSize: "12px", color: C.muted }}>Mig camp amb una porteria. Només es registra {meuEquip.nom}.</div>
              </button>
              <button style={S.choiceRow(scope === "complet")} onClick={() => setScope("complet")}>
                <strong>Partit complet</strong>
                <div style={{ fontSize: "12px", color: C.muted }}>Camp sencer. Es registren els dos equips.</div>
              </button>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button style={{ ...S.btnBig(C.border), flex: 1 }} onClick={() => setPas(2)}>← Enrere</button>
              <button
                style={{ ...S.btnBig(C.accent), flex: 2, opacity: scope ? 1 : 0.4 }}
                disabled={!scope}
                onClick={() => { setConvMeu(meuEquip.jugadors.slice(0, MAX_CONVOCATS).map((j) => j.dorsal)); if (scope === "complet") setConvRival(rival.jugadors.slice(0, MAX_CONVOCATS).map((j) => j.dorsal)); setPas(4); }}
              >
                Continuar
              </button>
            </div>
          </>)}

          {pas === 4 && (<>
            <div style={S.cardT}>5. Convocatòria (fins a {MAX_CONVOCATS} jugadors)</div>
            <ConvocatoriaEquip equip={meuEquip} seleccionats={convMeu} setLlista={setConvMeu} />
            {scope === "complet" && rival && <ConvocatoriaEquip equip={rival} seleccionats={convRival} setLlista={setConvRival} />}
            <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
              <button style={{ ...S.btnBig(C.border), flex: 1 }} onClick={() => setPas(3)}>← Enrere</button>
              <button
                style={{ ...S.btnBig(C.accent), flex: 2, opacity: convMeu.length ? 1 : 0.4 }}
                disabled={!convMeu.length || (scope === "complet" && !convRival.length)}
                onClick={() => onComençar({ rivalId, home, fase: Number(fase), jornada: Number(jornada), scope, convocats: { [meuEquip.id]: convMeu, ...(scope === "complet" ? { [rival.id]: convRival } : {}) } })}
              >
                ▶ Començar partit
              </button>
            </div>
          </>)}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════ PARTIT EN DIRECTE ═══════════════════ */

function MatchLive({ partit, setPartit, meuEquip, rival, onFinalitzar }) {
  const S = estils();
  const [orientacio, setOrientacio] = useState("apaisat"); // apaisat | vertical
  const [jugadorSel, setJugadorSel] = useState(null); // { equipId, jugador }
  const [editantTemps, setEditantTemps] = useState(false);
  const [tempsInput, setTempsInput] = useState("");
  const tickRef = useRef(null);

  const isPropi = partit.scope === "propi";
  const LV = partit.home ? "L" : "V";
  const rivalLabel = `${rival.nom} (${partit.home ? "V" : "L"})`;

  // Marcador en directe: gols a favor = suma de "Goles" dels JUGADORS propis;
  // gols en contra = suma de (Lanzam - Paradas) dels PORTERS propis (mai marquen gol, només reben)
  const marcador = useMemo(() => {
    const statsPropis = partit.stats[meuEquip.id] || {};
    let favor = 0, contra = 0;
    meuEquip.jugadors.forEach((j) => {
      const s = statsPropis[j.dorsal];
      if (!s) return;
      if (esPorter(j.posicio)) contra += Math.max(0, (s.Lanzam || 0) - (s.Paradas || 0));
      else favor += s.Goles || 0;
    });
    return { favor, contra };
  }, [partit.stats, meuEquip]);

  useEffect(() => {
    if (partit.running) {
      tickRef.current = setInterval(() => {
        setPartit((p) => ({ ...p, segons: p.segons + 1 }));
      }, 1000);
    }
    return () => clearInterval(tickRef.current);
    // eslint-disable-next-line
  }, [partit.running]);

  const totalPart = 30 * 60;
  const togglePlay = () => setPartit((p) => ({ ...p, running: !p.running }));

  const obrirEdicioTemps = () => { setTempsInput(""); setEditantTemps(true); };
  const formatTempsInput = (d) => (d.length <= 2 ? d : `${d.slice(0, 2)}:${d.slice(2)}`);
  const commitTemps = (digits) => {
    const d = digits.padEnd(4, "0");
    const min = Math.min(59, parseInt(d.slice(0, 2), 10) || 0);
    const sec = Math.min(59, parseInt(d.slice(2, 4), 10) || 0);
    setPartit((p) => ({ ...p, segons: min * 60 + sec }));
    setEditantTemps(false);
  };
  const onCanviTemps = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
    setTempsInput(digits);
    if (digits.length === 4) commitTemps(digits);
  };

  const finalitzar1a = () => setPartit((p) => ({ ...p, part: 2, segons: 0, running: false }));

  const registrarStat = (equipId, dorsal, camp, delta = 1) => {
    setPartit((p) => {
      const equipStats = { ...(p.stats[equipId] || {}) };
      const actual = equipStats[dorsal] || buida();
      equipStats[dorsal] = { ...actual, [camp]: (actual[camp] || 0) + delta };
      return { ...p, stats: { ...p.stats, [equipId]: equipStats } };
    });
  };

  const afegirLog = (jugador, text) => {
    setPartit((p) => ({
      ...p,
      log: [{ id: uid(), temps: p.segons, part: p.part, text: `#${jugador.dorsal} ${jugador.nom} ${jugador.cognom}`.trim() + ` — ${text}` }, ...(p.log || [])].slice(0, 200),
    }));
  };

  // Determina el porter que rep el llançament de l'equip contrari
  const porterQueRep = (equipQueLlençaId) => {
    if (isPropi) return null;
    const equipRivalId = equipQueLlençaId === meuEquip.id ? rival.id : meuEquip.id;
    const equipRivalObj = equipQueLlençaId === meuEquip.id ? rival : meuEquip;
    const porters = equipRivalObj.jugadors.filter((j) => esPorter(j.posicio));
    if (!porters.length) return null;
    const actiu = partit.porterActiu[equipRivalId];
    return porters.find((p) => p.dorsal === actiu) || porters[0];
  };

  const registrarLlançament = (resultat) => {
    if (!jugadorSel) return;
    const { equipId, jugador } = jugadorSel;
    registrarStat(equipId, jugador.dorsal, "Lanzam", 1);
    if (resultat === "gol") registrarStat(equipId, jugador.dorsal, "Goles", 1);
    if (resultat === "gol" || resultat === "parada") {
      const porter = porterQueRep(equipId);
      if (porter) {
        const porterEquipId = equipId === meuEquip.id ? rival.id : meuEquip.id;
        registrarStat(porterEquipId, porter.dorsal, "Lanzam", 1);
        if (resultat === "parada") registrarStat(porterEquipId, porter.dorsal, "Paradas", 1);
      }
    }
    afegirLog(jugador, resultat === "gol" ? "gol" : resultat === "parada" ? "llançament aturat pel porter" : "llançament fallat (fora)");
    setJugadorSel(null);
  };

  const registrarPorterPropi = (resultat) => {
    if (!jugadorSel) return;
    const { equipId, jugador } = jugadorSel;
    registrarStat(equipId, jugador.dorsal, "Lanzam", 1);
    if (resultat === "parada") registrarStat(equipId, jugador.dorsal, "Paradas", 1);
    afegirLog(jugador, resultat === "parada" ? "aturada" : "gol encaixat");
    setJugadorSel(null);
  };

  const registrarAccio = (camp) => {
    if (!jugadorSel) return;
    registrarStat(jugadorSel.equipId, jugadorSel.jugador.dorsal, camp, 1);
    const lbl = (ACCIONS_POSITIVES.find(([c]) => c === camp) || ACCIONS_NEGATIVES.find(([c]) => c === camp) || [camp, camp])[1];
    afegirLog(jugadorSel.jugador, lbl.toLowerCase());
    setJugadorSel(null);
  };

  const equipsAMostrar = isPropi ? [{ equip: meuEquip, costat: "unic" }] : [
    { equip: partit.home ? meuEquip : rival, costat: "esquerra" },
    { equip: partit.home ? rival : meuEquip, costat: "dreta" },
  ];

  const jugadorsConvocats = (equip) => {
    const conv = partit.convocats?.[equip.id];
    return conv ? equip.jugadors.filter((j) => conv.includes(j.dorsal)) : equip.jugadors;
  };

  // eix "prof" = distància a la porteria pròpia (0=porteria, 100=fons atac); eix "ample" = lateral (0-100)
  const POSICIO_COORDS = {
    "Porter": { prof: 6, ample: 50 },
    "Pivot": { prof: 42, ample: 47 },
    "Extrem dret": { prof: 14, ample: 3 },
    "Lateral dret": { prof: 58, ample: 8 },
    "Central": { prof: 70, ample: 47 },
    "Lateral esquerre": { prof: 58, ample: 84 },
    "Extrem esquerre": { prof: 14, ample: 97 },
  };

  const jugadorsAmbCoords = (equip, costat) => {
    const llista = jugadorsConvocats(equip);
    const grups = {};
    llista.forEach((j) => { (grups[j.posicio] = grups[j.posicio] || []).push(j); });
    const spacing = 12;
    return llista.map((j) => {
      const c = POSICIO_COORDS[j.posicio] || { prof: 50, ample: 50 };
      const grup = grups[j.posicio];
      const idx = grup.indexOf(j);
      const n = grup.length;
      const halfSpread = (spacing * (n - 1)) / 2;
      const centre = Math.min(100 - 4 - halfSpread, Math.max(4 + halfSpread, c.ample));
      const ample = n > 1 ? centre + (idx - (n - 1) / 2) * spacing : c.ample;
      const mirall = costat === "dreta";
      const pos = orientacio === "apaisat"
        ? { left: mirall ? 100 - c.prof : c.prof, top: ample }
        : { left: ample, top: mirall ? 100 - c.prof : c.prof };
      return { ...j, _pos: pos };
    });
  };

  return (
    <div style={{ ...S.page, padding: 0, position: "relative", overflow: "hidden" }}>
      <button
        onClick={() => setOrientacio((o) => (o === "apaisat" ? "vertical" : "apaisat"))}
        style={{ position: "absolute", bottom: "8px", right: "8px", zIndex: 30, background: `${C.card}cc`, border: `1px solid ${C.border}`, color: C.muted, borderRadius: "8px", padding: "6px 9px", fontSize: "14px", cursor: "pointer" }}
        title="Canviar orientació"
      >⤢</button>

      {/* Capçalera */}
      <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", background: C.card, borderBottom: `1px solid ${C.border}`, flexWrap: "wrap", gap: "8px" }}>
        <div style={{ fontSize: "13px", color: C.muted, display: "flex", alignItems: "center", gap: "10px" }}>
          <strong style={{ color: C.text }}>{meuEquip.nom}</strong>
          <span style={{ fontSize: "17px", fontWeight: 800, color: C.text, fontVariantNumeric: "tabular-nums" }}>{marcador.favor} - {marcador.contra}</span>
          <span>{rival.nom}</span>
          <span style={{ padding: "2px 7px", borderRadius: "5px", background: `${C.accent2}22`, color: C.accent2, fontSize: "11px" }}>{LV}</span>
          <span>Fase {partit.fase} · Jornada {partit.jornada}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "12px", color: C.warning, fontWeight: 700 }}>{partit.part}a part</span>
          <button onClick={togglePlay} style={{ background: partit.running ? C.warning : C.positive, border: "none", borderRadius: "8px", width: "34px", height: "34px", fontSize: "15px", cursor: "pointer" }}>
            {partit.running ? "⏸" : "▶"}
          </button>
          {editantTemps ? (
            <input autoFocus inputMode="numeric" value={formatTempsInput(tempsInput)} onChange={onCanviTemps}
              onBlur={() => (tempsInput.length ? commitTemps(tempsInput) : setEditantTemps(false))}
              onKeyDown={(e) => e.key === "Enter" && commitTemps(tempsInput)}
              style={{ width: "76px", fontSize: "20px", fontWeight: 700, textAlign: "center", background: C.card2, color: C.text, border: `1px solid ${C.accent}`, borderRadius: "6px" }} placeholder="XX:XX" />
          ) : (
            <div onClick={obrirEdicioTemps} style={{ fontSize: "22px", fontWeight: 700, fontVariantNumeric: "tabular-nums", cursor: "pointer", color: partit.segons >= totalPart ? C.negative : C.text }} title="Toca per corregir el temps">
              {fmtTemps(partit.segons)}
            </div>
          )}
          <button onClick={partit.part === 1 ? finalitzar1a : onFinalitzar} style={{ ...S.btnSmall(partit.part === 1 ? C.accent2 : C.negative) }}>
            {partit.part === 1 ? "Finalitzar 1a part" : "Finalitzar partit"}
          </button>
        </div>
      </div>

      {/* Camp + jugadors o panell d'accions */}
      <div style={{ position: "relative", minHeight: "calc(100vh - 60px)" }}>
        <CampFons scope={partit.scope} orientacio={orientacio} />
        {!jugadorSel ? (
          <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: orientacio === "apaisat" ? "row" : "column", height: "calc(100vh - 60px)", padding: "14px", paddingBottom: "130px", gap: "14px" }}>
            {equipsAMostrar.map(({ equip, costat }) => (
              <div key={equip.id} style={{ flex: 1, position: "relative" }}>
                <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", color: C.muted, fontSize: "11px", fontWeight: 700, textTransform: "uppercase", whiteSpace: "nowrap" }}>{equip.nom}</div>
                {jugadorsAmbCoords(equip, costat).map((j) => {
                  const { left, top } = j._pos;
                  return (
                    <button key={j.dorsal} onClick={() => setJugadorSel({ equipId: equip.id, jugador: j })}
                      style={{ ...S.playerBtn, position: "absolute", left: `${left}%`, top: `${top}%`, transform: "translate(-50%, -50%)" }}>
                      {j.foto ? <img src={j.foto} alt="" style={{ width: "30px", height: "38px", objectFit: "cover", borderRadius: "5px" }} />
                        : <div style={{ width: "30px", height: "38px", borderRadius: "5px", background: esPorter(j.posicio) ? `${C.warning}33` : C.border, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "12px" }}>{j.dorsal}</div>}
                      <div style={{ fontSize: "9px", marginTop: "3px", maxWidth: "50px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>#{j.dorsal} {j.nom}</div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          <PanellAccio
            jugadorSel={jugadorSel}
            esPorterSel={esPorter(jugadorSel.jugador.posicio)}
            onEnrere={() => setJugadorSel(null)}
            onLlançament={registrarLlançament}
            onPorterPropi={registrarPorterPropi}
            onAccio={registrarAccio}
          />
        )}
        {!jugadorSel && <RegistreAccions log={partit.log || []} />}
      </div>
    </div>
  );
}

function RegistreAccions({ log }) {
  if (!log.length) return null;
  return (
    <div style={{
      position: "absolute", left: "12px", right: "54px", bottom: "10px", zIndex: 15,
      background: `${C.card}f0`, border: `1px solid ${C.border}`, borderRadius: "10px",
      maxHeight: "112px", overflowY: "auto", padding: "6px 10px", fontSize: "12px",
    }}>
      {log.slice(0, 30).map((entry) => (
        <div key={entry.id} style={{ padding: "2px 0", borderBottom: `1px solid ${C.border}33`, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          <span style={{ color: C.muted, fontVariantNumeric: "tabular-nums" }}>{fmtTemps(entry.temps)}</span>{" "}
          <span style={{ color: C.muted }}>({entry.part}a)</span>{"  "}
          {entry.text}
        </div>
      ))}
    </div>
  );
}

// ── Mida del fons de pista ──────────────────────────────────────────────
// Amplada i alçada s'ajusten per SEPARAT (en % respecte al contenidor).
// Com són percentatges, s'adapten soles en canviar de mida de pantalla
// (portàtil ↔ tablet) perquè es recalculen sobre la mida real del contenidor.
// Pots definir valors diferents per a apaisat i per a vertical.
const FONS_MIDA = {
  apaisat: { amplada: "100%", alçada: "110%" },
  vertical: { amplada: "100%", alçada: "auto" },
};

function CampFons({ scope, orientacio }) {
  const img = scope === "propi" ? "/mediapistah.jpg" : "/pista.jpg";
  const { amplada, alçada } = FONS_MIDA[orientacio] || FONS_MIDA.apaisat;
  return (
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0, bottom: "128px",
      backgroundImage: `url('${img}')`, backgroundSize: `${amplada} ${alçada}`, backgroundRepeat: "no-repeat", backgroundPosition: "center",
    }}>
      <div style={{ position: "absolute", inset: 0, background: `${C.bg}b3` }} />
    </div>
  );
}

/* ═══════════════════ PANELL D'ACCIÓ (porteria / gol / fora + positives / negatives) ═══════════════════ */

const ACCIONS_POSITIVES = [["Asistencia", "Assistència"], ["Recup.", "Recuperació"], ["PenaltiProvocado", "Penalti provocat"], ["Exclusión +", "Exclusió provocada"]];
const ACCIONS_NEGATIVES = [["Pase", "Pèrdua (passe)"], ["Exclusión", "Exclusió"], ["Área", "Àrea"], ["Pasos", "Passos"], ["Otro", "Altre"]];

function PorteriaGoal({ onGol, onParada }) {
  return (
    <div style={{ flex: 2, position: "relative", borderRadius: "6px", overflow: "hidden", border: `1px solid ${C.border}` }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/porteria.jpg')", backgroundSize: "cover", backgroundPosition: "center" }} />
      <div style={{ position: "absolute", inset: 0, cursor: "pointer" }} onClick={onGol}>
        <div
          onClick={(e) => { e.stopPropagation(); onParada(); }}
          style={{
            position: "absolute", left: 0, top: 0, width: "50%", height: "50%",
            background: `${C.warning}30`, borderRight: `2px dashed #ffffff88`, borderBottom: `2px dashed #ffffff88`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", cursor: "pointer",
          }}
        >🧤</div>
        <div style={{ position: "absolute", bottom: "6px", right: "10px", fontSize: "12px", color: "#fff", fontWeight: 700, textShadow: "0 1px 3px #000" }}>GOL</div>
      </div>
    </div>
  );
}

function PanellAccio({ jugadorSel, esPorterSel, onEnrere, onLlançament, onPorterPropi, onAccio }) {
  const S = estils();
  const { jugador } = jugadorSel;
  return (
    <div style={{ position: "relative", zIndex: 10, height: "calc(100vh - 60px)", display: "flex", flexDirection: "column", padding: "12px", gap: "10px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button onClick={onEnrere} style={{ background: C.card, border: `1px solid ${C.border}`, color: C.text, borderRadius: "8px", width: "38px", height: "38px", fontSize: "18px", cursor: "pointer" }}>←</button>
        <div style={{ fontWeight: 700 }}>#{jugador.dorsal} {jugador.nom} {jugador.cognom}</div>
      </div>

      {/* Zona de llançament */}
      <div style={{ display: "flex", gap: "10px", height: esPorterSel ? "90px" : "130px" }}>
        {esPorterSel ? (<>
          <button onClick={() => onPorterPropi("parada")} style={{ ...S.goalBtn, flex: 1, background: `${C.positive}22`, borderColor: C.positive }}>
            🧤<div style={{ fontSize: "13px", marginTop: "4px" }}>Parada</div>
          </button>
          <button onClick={() => onPorterPropi("golEncaixat")} style={{ ...S.goalBtn, flex: 1, background: `${C.negative}22`, borderColor: C.negative }}>
            🥅<div style={{ fontSize: "13px", marginTop: "4px" }}>Gol encaixat</div>
          </button>
        </>) : (<>
          <PorteriaGoal onGol={() => onLlançament("gol")} onParada={() => onLlançament("parada")} />
          <button onClick={() => onLlançament("fora")} style={{ ...S.goalBtn, flex: 1, background: `${C.muted}22` }}>
            ✗<div style={{ fontSize: "13px", marginTop: "4px" }}>Fora</div>
          </button>
        </>)}
      </div>

      {/* Positives / negatives */}
      <div style={{ display: "flex", gap: "10px", flex: 1 }}>
        <div style={{ flex: 1, border: `4px solid ${C.positive}`, borderRadius: "12px", padding: "10px", display: "flex", flexDirection: "column", gap: "8px", background: `${C.positive}0d` }}>
          <div style={{ textAlign: "center", fontSize: "12px", fontWeight: 700, color: C.positive, textTransform: "uppercase" }}>Positiu</div>
          {ACCIONS_POSITIVES.map(([camp, lbl]) => (
            <button key={camp} onClick={() => onAccio(camp)} style={S.accioBtn(C.positive)}>{lbl}</button>
          ))}
        </div>
        <div style={{ flex: 1, border: `4px solid ${C.negative}`, borderRadius: "12px", padding: "10px", display: "flex", flexDirection: "column", gap: "8px", background: `${C.negative}0d` }}>
          <div style={{ textAlign: "center", fontSize: "12px", fontWeight: 700, color: C.negative, textTransform: "uppercase" }}>Negatiu</div>
          {ACCIONS_NEGATIVES.map(([camp, lbl]) => (
            <button key={camp} onClick={() => onAccio(camp)} style={S.accioBtn(C.negative)}>{lbl}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════ RESUM I EXPORTACIÓ ═══════════════════ */

function Resum({ partit, meuEquip, rival, onNouPartit }) {
  const S = estils();

  const files = useMemo(() => {
    const out = [];
    const equipsImplicats = partit.scope === "complet" ? [meuEquip, rival] : [meuEquip];
    equipsImplicats.forEach((equip) => {
      const stats = partit.stats[equip.id] || {};
      const jugadorsAmbDades = equip.jugadors.filter((j) => stats[j.dorsal]);
      const totalGF = jugadorsAmbDades.filter((j) => !esPorter(j.posicio)).reduce((a, j) => a + (stats[j.dorsal].Goles || 0), 0);
      const totalLR = jugadorsAmbDades.filter((j) => !esPorter(j.posicio)).reduce((a, j) => a + (stats[j.dorsal].Lanzam || 0), 0);
      const totalLRebuts = jugadorsAmbDades.filter((j) => esPorter(j.posicio)).reduce((a, j) => a + (stats[j.dorsal].Lanzam || 0), 0);
      const totalParades = jugadorsAmbDades.filter((j) => esPorter(j.posicio)).reduce((a, j) => a + (stats[j.dorsal].Paradas || 0), 0);
      const golesContra = totalLRebuts - totalParades;
      const esMeu = equip.id === meuEquip.id;
      const lv = esMeu ? (partit.home ? "L" : "V") : (partit.home ? "V" : "L");
      const rivalLabel = esMeu ? `${rival.nom} (${partit.home ? "V" : "L"})` : `${meuEquip.nom} (${partit.home ? "L" : "V"})`;

      jugadorsAmbDades.forEach((j) => {
        const s = stats[j.dorsal];
        const isPort = esPorter(j.posicio);
        const golesCol = isPort ? (s.Paradas || 0) : (s.Goles || 0);
        out.push({
          Jugador: `${j.nom} ${j.cognom}`.trim(), dorsal: j.dorsal,
          Goles: golesCol, Paradas: isPort ? (s.Paradas || 0) : null, "Lanzam.": s.Lanzam || 0,
          "% lanz": s.Lanzam ? +(golesCol / s.Lanzam).toFixed(3) : 0,
          "Lanzam. 7m": 0, "Goles 7m": 0,
          Asistencia: s.Asistencia || 0, "Exclusión": s.Exclusión || 0, Pase: s.Pase || 0,
          Área: s.Área || 0, Pasos: s.Pasos || 0, Otro: s.Otro || 0, "Recup.": s["Recup."] || 0,
          "Exclusión +": s["Exclusión +"] || 0, PenaltiProvocado: s.PenaltiProvocado || 0,
          JORNADA: partit.jornada, FASE: partit.fase, "L/V": lv, rival: rivalLabel,
          POSICION: posicioExcel(j.posicio),
          "goles favor": totalGF, "goles contra": golesContra,
          "lanzamientos realizados": totalLR, "lanzamientos recibidos": totalLRebuts,
        });
      });
    });
    return out;
  }, [partit, meuEquip, rival]);

  const descarregar = () => {
    const ws = XLSX.utils.json_to_sheet(files);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Datos");
    XLSX.writeFile(wb, `Partit_J${partit.jornada}_${rival.nom.replace(/\s+/g, "_")}.xlsx`);
  };

  return (
    <div style={estils().page}>
      <div style={{ maxWidth: "640px", margin: "0 auto" }}>
        <h1 style={estils().h1}>✅ Partit finalitzat</h1>
        <div style={estils().card}>
          <div style={estils().cardT}>Resum</div>
          <div style={{ fontSize: "13px", color: C.muted, marginBottom: "10px" }}>
            {meuEquip.nom} vs {rival.nom} · Fase {partit.fase} · Jornada {partit.jornada} · {files.length} registres de jugador
          </div>
          <button style={{ ...S.btnBig(C.accent), width: "100%" }} onClick={descarregar}>⬇ Descarregar Excel (Datos)</button>
        </div>
        <button style={{ ...S.btnBig(C.border), width: "100%" }} onClick={onNouPartit}>Nou partit</button>
      </div>
    </div>
  );
}

/* ═══════════════════ ESTILS COMUNS ═══════════════════ */

function estils() {
  return {
    page: { minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Inter', system-ui, sans-serif", padding: "24px 16px", boxSizing: "border-box" },
    h1: { fontSize: "20px", fontWeight: 700, marginBottom: "18px" },
    card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: "14px", padding: "16px", marginBottom: "14px" },
    cardT: { fontSize: "13px", fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "10px" },
    label: { display: "block", fontSize: "12px", color: C.muted, marginBottom: "4px" },
    input: { width: "100%", background: C.card2, border: `1px solid ${C.border}`, color: C.text, borderRadius: "8px", padding: "9px 10px", fontSize: "14px", boxSizing: "border-box" },
    avis: { background: `${C.warning}18`, border: `1px solid ${C.warning}55`, color: C.warning, borderRadius: "8px", padding: "10px 12px", fontSize: "13px" },
    btnSmall: (color) => ({ background: `${color}22`, border: `1px solid ${color}55`, color, borderRadius: "7px", padding: "6px 12px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }),
    btnBig: (color) => ({ background: color === C.border ? C.card2 : `${color}22`, border: `1px solid ${color === C.border ? C.border : color + "66"}`, color: color === C.border ? C.text : color, borderRadius: "10px", padding: "13px", fontSize: "15px", fontWeight: 700, cursor: "pointer" }),
    iconChoice: (sel) => ({ flex: 1, maxWidth: "180px", background: sel ? `${C.accent}22` : C.card2, border: `2px solid ${sel ? C.accent : C.border}`, borderRadius: "12px", padding: "18px 10px", color: C.text, textAlign: "center", cursor: "pointer", fontSize: "13px" }),
    choiceRow: (sel) => ({ textAlign: "left", background: sel ? `${C.accent}18` : C.card2, border: `2px solid ${sel ? C.accent : C.border}`, borderRadius: "10px", padding: "12px 14px", color: C.text, cursor: "pointer" }),
    playerBtn: { background: C.card, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "4px", cursor: "pointer", color: C.text, display: "flex", flexDirection: "column", alignItems: "center", width: "54px", zIndex: 12 },
    goalBtn: { border: `2px solid ${C.border}`, borderRadius: "8px", color: C.text, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontSize: "26px" },
    accioBtn: (color) => ({ background: `${color}22`, border: `1px solid ${color}55`, color: C.text, borderRadius: "8px", padding: "10px 8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", flex: 1 }),
  };
}
