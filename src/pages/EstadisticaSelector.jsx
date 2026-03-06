import { useNavigate } from "react-router-dom";

const C = {
  bg: "#0f1117", card: "#1a1d27", border: "#2a2d3a",
  accent: "#e63946", accent2: "#457b9d", accent3: "#2a9d8f",
  text: "#e8eaf0", muted: "#8b8fa8",
};

export default function EstadisticaSelector() {
  const navigate = useNavigate();

  const opcions = [
    {
      id: "fase3",
      emoji: "🏆",
      titol: "Lliga Infantil Masculí",
      subtitol: "Fase 3 · Temporada 25/26",
      color: C.accent,
      ruta: "/Estadistica",
    },
    {
      id: "drets",
      emoji: "📋",
      titol: "Drets Federatius",
      subtitol: "Infantil Masculí · Temporada 25/26",
      color: C.accent2,
      ruta: "/EstadisticaDrets",
    },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      color: C.text,
      fontFamily: "'Inter', system-ui, sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
      boxSizing: "border-box",
    }}>
      {/* Botó enrere */}
      <div style={{ position: "absolute", top: "20px", left: "16px" }}>
        <button
          onClick={() => navigate("/")}
          style={{
            background: "transparent",
            border: `1px solid ${C.border}`,
            color: C.muted,
            padding: "7px 14px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "13px",
          }}
        >
          ← Enrere
        </button>
      </div>

      {/* Títol */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div style={{ fontSize: "36px", marginBottom: "12px" }}>📊</div>
        <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0, letterSpacing: "-0.5px" }}>
          Estadístiques
        </h1>
        <p style={{ color: C.muted, fontSize: "14px", marginTop: "8px" }}>
          Selecciona la competició que vols consultar
        </p>
      </div>

      {/* Cards de selecció */}
      <div style={{
        display: "flex",
        gap: "16px",
        flexWrap: "wrap",
        justifyContent: "center",
        width: "100%",
        maxWidth: "600px",
      }}>
        {opcions.map((o) => (
          <button
            key={o.id}
            onClick={() => navigate(o.ruta)}
            style={{
              flex: "1 1 240px",
              background: C.card,
              border: `2px solid ${C.border}`,
              borderRadius: "16px",
              padding: "32px 24px",
              cursor: "pointer",
              textAlign: "center",
              color: C.text,
              transition: "all 0.2s",
              outline: "none",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.border = `2px solid ${o.color}`;
              e.currentTarget.style.background = `${o.color}11`;
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = `0 8px 24px ${o.color}22`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.border = `2px solid ${C.border}`;
              e.currentTarget.style.background = C.card;
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "14px" }}>{o.emoji}</div>
            <div style={{ fontSize: "17px", fontWeight: 700, marginBottom: "6px", color: o.color }}>
              {o.titol}
            </div>
            <div style={{ fontSize: "13px", color: C.muted }}>
              {o.subtitol}
            </div>
            <div style={{
              marginTop: "20px",
              display: "inline-block",
              background: `${o.color}22`,
              color: o.color,
              border: `1px solid ${o.color}44`,
              borderRadius: "8px",
              padding: "6px 18px",
              fontSize: "13px",
              fontWeight: 600,
            }}>
              Veure estadístiques →
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
