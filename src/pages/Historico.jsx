import { useNavigate } from "react-router-dom";

const C = {
  bg: "#0a0d14",
  card: "#12151f",
  cardHover: "#1a1e2d",
  border: "#1e2233",
  borderHover: "#2a3050",
  accent: "#FFED00",
  accentGlow: "rgba(255, 237, 0, 0.15)",
  blue: "#004D98",
  blueLight: "#1a6fc4",
  red: "#A50044",
  redLight: "#c4005a",
  text: "#e8eaf0",
  muted: "#6b7080",
  mutedLight: "#9299ab",
};

const TEMPORADES = [
  {
    any: "2026/2027",
    label: "Temporada actual",
    subtitol: "Infantil A · FC Barcelona Handbol",
    emoji: "⭐",
    ruta: "/",
    color: C.accent,
    actual: true,
  },
  {
    any: "2025/2026",
    label: "Temporada anterior",
    subtitol: "Infantil A · FC Barcelona Handbol",
    emoji: "🏆",
    ruta: "/historico/2025",
    color: C.blueLight,
    actual: false,
  },
  // Afegir aquí les temporades futures:
  // {
  //   any: "2024/2025",
  //   label: "Temporada 24/25",
  //   subtitol: "Infantil A · FC Barcelona Handbol",
  //   emoji: "📁",
  //   ruta: "/historico/2024",
  //   color: C.mutedLight,
  //   actual: false,
  // },
];

export default function Historico() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      color: C.text,
      fontFamily: "'Barlow Condensed', 'Barlow', system-ui, sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
      boxSizing: "border-box",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Fons decoratiu: franges Barça */}
      <div style={{
        position: "fixed",
        inset: 0,
        background: `repeating-linear-gradient(
          90deg,
          rgba(0, 77, 152, 0.04) 0px,
          rgba(0, 77, 152, 0.04) 18px,
          rgba(165, 0, 68, 0.04) 18px,
          rgba(165, 0, 68, 0.04) 36px
        )`,
        pointerEvents: "none",
        zIndex: 0,
      }} />

      {/* Escudo difuminat de fons */}
      <div style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "60vmin",
        height: "60vmin",
        background: "radial-gradient(ellipse 60% 80% at 50% 45%, rgba(255,237,0,0.04) 0%, transparent 70%)",
        clipPath: "polygon(50% 0%, 85% 8%, 100% 30%, 100% 60%, 80% 85%, 50% 100%, 20% 85%, 0% 60%, 0% 30%, 15% 8%)",
        border: "1px solid rgba(255,237,0,0.05)",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      {/* Botó enrere */}
      <div style={{ position: "absolute", top: "20px", left: "16px", zIndex: 10 }}>
        <button
          onClick={() => navigate("/")}
          style={{
            background: "transparent",
            border: `1px solid ${C.border}`,
            color: C.muted,
            padding: "8px 16px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 600,
            letterSpacing: "1px",
            textTransform: "uppercase",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = C.accent;
            e.currentTarget.style.color = C.accent;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = C.border;
            e.currentTarget.style.color = C.muted;
          }}
        >
          ← Enrere
        </button>
      </div>

      {/* Títol */}
      <div style={{ textAlign: "center", marginBottom: "48px", position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>📂</div>
        <h1 style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "clamp(2rem, 5vw, 3rem)",
          fontWeight: 900,
          fontStyle: "italic",
          textTransform: "uppercase",
          letterSpacing: "6px",
          margin: 0,
          background: `linear-gradient(180deg, #ffffff 0%, ${C.accent} 60%, #d4af37 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          filter: "drop-shadow(0 2px 12px rgba(255,237,0,0.3))",
        }}>
          Històric de Temporades
        </h1>
        <p style={{
          color: C.muted,
          fontSize: "14px",
          marginTop: "12px",
          letterSpacing: "4px",
          textTransform: "uppercase",
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 600,
        }}>
          Infantil A · FC Barcelona Handbol
        </p>
        {/* Línia daurada decorativa */}
        <div style={{
          width: "200px",
          height: "2px",
          margin: "20px auto 0",
          background: `linear-gradient(90deg, transparent, ${C.accent}, transparent)`,
          borderRadius: "2px",
          boxShadow: `0 0 12px rgba(255,237,0,0.4)`,
        }} />
      </div>

      {/* Cards de temporades */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "20px",
        width: "100%",
        maxWidth: "860px",
        position: "relative",
        zIndex: 1,
      }}>
        {TEMPORADES.map((t) => (
          <TemporadaCard key={t.any} temporada={t} navigate={navigate} />
        ))}
      </div>
    </div>
  );
}

function TemporadaCard({ temporada: t, navigate }) {
  return (
    <button
      onClick={() => navigate(t.ruta)}
      style={{
        background: C.card,
        border: `2px solid ${t.actual ? t.color + "55" : C.border}`,
        borderRadius: "20px",
        padding: "28px 24px",
        cursor: "pointer",
        textAlign: "center",
        color: C.text,
        transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
        outline: "none",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Barlow Condensed', sans-serif",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.border = `2px solid ${t.color}`;
        e.currentTarget.style.background = `${t.color}0d`;
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = `0 16px 40px ${t.color}22`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.border = `2px solid ${t.actual ? t.color + "55" : C.border}`;
        e.currentTarget.style.background = C.card;
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Badge "Actual" */}
      {t.actual && (
        <div style={{
          position: "absolute",
          top: "14px",
          right: "14px",
          background: `${C.accent}22`,
          color: C.accent,
          border: `1px solid ${C.accent}55`,
          borderRadius: "6px",
          padding: "3px 10px",
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "1.5px",
          textTransform: "uppercase",
        }}>
          ACTUAL
        </div>
      )}

      {/* Emoji */}
      <div style={{ fontSize: "48px", marginBottom: "16px" }}>{t.emoji}</div>

      {/* Any */}
      <div style={{
        fontSize: "clamp(1.6rem, 3vw, 2rem)",
        fontWeight: 900,
        fontStyle: "italic",
        color: t.color,
        marginBottom: "8px",
        letterSpacing: "2px",
        textTransform: "uppercase",
      }}>
        {t.any}
      </div>

      {/* Label */}
      <div style={{
        fontSize: "13px",
        fontWeight: 700,
        color: C.mutedLight,
        letterSpacing: "3px",
        textTransform: "uppercase",
        marginBottom: "6px",
      }}>
        {t.label}
      </div>

      {/* Subtítol */}
      <div style={{
        fontSize: "12px",
        color: C.muted,
        letterSpacing: "1px",
        marginBottom: "24px",
      }}>
        {t.subtitol}
      </div>

      {/* Botó */}
      <div style={{
        display: "inline-block",
        background: `${t.color}22`,
        color: t.color,
        border: `1px solid ${t.color}44`,
        borderRadius: "8px",
        padding: "8px 24px",
        fontSize: "13px",
        fontWeight: 700,
        letterSpacing: "1.5px",
        textTransform: "uppercase",
      }}>
        Accedir →
      </div>
    </button>
  );
}
