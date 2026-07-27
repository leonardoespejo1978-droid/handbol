import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style_1.css";
import "./submenu-videos.css";

const STATS_ALLOWED = ["nilsubi@fcb.es", "leonardoespejo1978@gmail.com"];

// HomePage de la temporada 2025/2026 — NOMÉS LECTURA (sense login)
// Accessible des de /historico/2025

const VIDEOS_CATEGORIES_2025 = [
  { id: "pretemporada", label: "Pretemporada" },
  { id: "amistosos", label: "Amistosos" },
  { id: "drets-esportius", label: "Drets Esportius" },
  { id: "fase-3", label: "3a Fase" },
  { id: "fase-final", label: "Fase Final" },
  { id: "sectores-ce", label: "Sectores CE" },
  { id: "fase-final-ce", label: "Fase Final CE" },
];

export default function HomePage2025({ session }) {
  const navigate = useNavigate();
  const [showVideosMenu, setShowVideosMenu] = useState(false);
  const email = session?.user?.email || "";
  const canSeeStats = STATS_ALLOWED.includes(email);

  return (
    <div className="home">
      {/* Banner de temporada histórica */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: "linear-gradient(135deg, #004D98, #003070)",
        borderBottom: "2px solid #FFED00",
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: "'Barlow Condensed', sans-serif",
        boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "18px" }}>📂</span>
          <div>
            <div style={{ color: "#FFED00", fontSize: "13px", fontWeight: 800, letterSpacing: "3px", textTransform: "uppercase" }}>
              Temporada 2025/2026
            </div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase" }}>
              Arxiu Històric
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "rgba(255,255,255,0.8)",
              padding: "6px 14px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "12px",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
            }}
          >
            ← Inici
          </button>
          <button
            onClick={() => navigate("/historico")}
            style={{
              background: "rgba(255,237,0,0.15)",
              border: "1px solid rgba(255,237,0,0.4)",
              color: "#FFED00",
              padding: "6px 14px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "12px",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
            }}
          >
            Temporades
          </button>
        </div>
      </div>

      {/* Texto central premium */}
      <div className="home-center-text" style={{ paddingTop: "60px" }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "18px",
          background: "rgba(0,0,0,0.35)",
          border: "1px solid rgba(255,237,0,0.2)",
          borderRadius: "30px",
          padding: "5px 18px 5px 10px",
          backdropFilter: "blur(8px)",
        }}>
          <span style={{
            width: "8px", height: "8px", borderRadius: "50%",
            background: "#FFED00", boxShadow: "0 0 8px rgba(255,237,0,0.6)",
            display: "inline-block", flexShrink: 0,
          }} />
          <span style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "11px", fontWeight: 700,
            letterSpacing: "3px", textTransform: "uppercase",
            color: "rgba(255,255,255,0.6)",
          }}>
            Temporada 25/26 · Infantil A
          </span>
        </div>

        <h1 style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "clamp(2.4rem, 6vw, 4.2rem)",
          fontWeight: 900,
          fontStyle: "italic",
          textTransform: "uppercase",
          letterSpacing: "6px",
          lineHeight: 1,
          margin: "0 0 10px 0",
          background: "linear-gradient(180deg, #ffffff 0%, #FFED00 50%, #d4af37 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          filter: "drop-shadow(0 4px 20px rgba(255,237,0,0.35))",
        }}>
          FC Barcelona Handbol
        </h1>

        {/* Línia decorativa */}
        <div style={{
          width: "clamp(160px, 30vw, 300px)",
          height: "2px",
          margin: "0 auto 20px",
          background: "linear-gradient(90deg, transparent, #FFED00, #fff, #FFED00, transparent)",
          boxShadow: "0 0 16px rgba(255,237,0,0.5)",
          borderRadius: "2px",
        }} />

        <p style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "clamp(0.95rem, 2vw, 1.2rem)",
          fontWeight: 600,
          letterSpacing: "4px",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.55)",
          margin: 0,
          textShadow: "0 2px 12px rgba(0,0,0,0.8)",
        }}>
          Contingut exclusiu pares Infantil A · Secció d'Handbol
        </p>
      </div>

      {/* Menú lateral */}
      <div className="bottom-buttons" style={{ marginTop: "60px" }}>

        <button onClick={() => navigate("/2025/galeria")}>
          <span className="btn-icon">🖼️</span>
          Galeria d'imatges
          <span className="btn-arrow">›</span>
        </button>

        {/* Botón Vídeos con submenu */}
        <div className="videos-menu-wrapper">
          <button
            onClick={() => setShowVideosMenu(!showVideosMenu)}
            className={showVideosMenu ? "videos-btn-active" : ""}
          >
            <span className="btn-icon">🎬</span>
            Vídeos
            <span className="btn-arrow">›</span>
          </button>

          {showVideosMenu && (
            <div className="submenu-videos-floating">
              {VIDEOS_CATEGORIES_2025.map((category) => (
                <button
                  key={category.id}
                  className="submenu-video-item"
                  onClick={() => {
                    navigate(`/2025/videos/${category.id}`);
                    setShowVideosMenu(false);
                  }}
                >
                  <span className="submenu-icon">▶</span>
                  {category.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() =>
            window.open(
              "https://resultadosbalonmano.isquad.es/competicion.php?id_superficie=1&seleccion=0&id_categoria=2549&id_competicion=209376&id_temp=2526&id_ambito=0&id_territorial=17",
              "_blank"
            )
          }
        >
          <span className="btn-icon">🏆</span>
          Resultats i classificació
          <span className="btn-arrow">›</span>
        </button>

        {canSeeStats && (
          <button onClick={() => navigate("/2025/EstadisticaSelector")}>
            <span className="btn-icon">📊</span>
            Estadística
            <span className="btn-arrow">›</span>
          </button>
        )}

      </div>
    </div>
  );
}
