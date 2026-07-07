import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginModal from "../components/LoginModal";
import "./style_1.css";
import "./submenu-videos.css";

const STATS_ALLOWED = ["nilsubi@fcb.es", "leonardoespejo1978@gmail.com"];

const VIDEOS_CATEGORIES = [
  { id: "pretemporada", label: "Pretemporada" },
  { id: "amistosos", label: "Amistosos" },
  { id: "drets-esportius", label: "Drets Esportius" },
  { id: "fase-3", label: "3a Fase" },
  { id: "fase-final", label: "Fase Final" },
  { id: "sectores-ce", label: "Sectores CE" },
  { id: "fase-final-ce", label: "Fase Final CE" },
];

const TEMPORADES = [
  { label: "Temporada 26/27", subtitol: "Cadet B · FC Barcelona Handbol", tag: "ACTUAL", ruta: "/", current: true },
  { label: "Temporada 25/26", subtitol: "Infantil A · FC Barcelona Handbol", tag: "ARXIU", ruta: "/historico/2025", current: false },
];

const responsiveStyles = `
  @media (max-width: 768px) {
    .bottom-buttons {
      top: 80px !important;
      left: 10px !important;
      gap: 8px !important;
    }
    .bottom-buttons button {
      width: 140px !important;
      height: 40px !important;
      padding: 0 10px 0 8px !important;
      gap: 6px !important;
      font-size: 11px !important;
      letter-spacing: 0.5px !important;
    }
    .bottom-buttons button .btn-icon { font-size: 12px !important; }
    .bottom-buttons button .btn-arrow { font-size: 11px !important; }
    .submenu-video-item {
      width: 120px !important; height: 34px !important;
      padding: 0 8px 0 6px !important; gap: 5px !important;
      font-size: 10px !important; letter-spacing: 0.3px !important;
    }
    .submenu-icon { font-size: 11px !important; }
    .submenu-videos-floating { gap: 5px !important; margin-left: 6px !important; }
    .home-center-text { top: 80px !important; }
    .home-center-text h1 { font-size: 1.8rem !important; }
    .home-center-text h2 { font-size: 0.85rem !important; letter-spacing: 0px !important; }
    .season-bar { height: 48px !important; padding: 0 12px !important; }
    .season-selector-btn { padding: 0 12px !important; font-size: 12px !important; gap: 6px !important; }
    .season-dot { width: 6px !important; height: 6px !important; }
  }
  @media (max-width: 480px) {
    .bottom-buttons { top: 72px !important; left: 8px !important; gap: 6px !important; }
    .bottom-buttons button {
      width: 120px !important; height: 36px !important;
      padding: 0 8px 0 6px !important; gap: 5px !important;
      font-size: 10px !important; letter-spacing: 0.3px !important;
    }
    .season-label-full { display: none !important; }
    .season-label-short { display: inline !important; }
  }
`;

export default function HomePage({ session }) {
  const [loggedIn, setLoggedIn] = useState(!!session);
  const [showVideosMenu, setShowVideosMenu] = useState(false);
  const [showSeasonMenu, setShowSeasonMenu] = useState(false);
  const seasonRef = useRef(null);
  const navigate = useNavigate();
  const role = session?.user?.raw_user_meta_data?.role || "user";
  const email = session?.user?.email || "";
  const canSeeStats = STATS_ALLOWED.includes(email);

  // Tancar el menú de temporada si es fa clic fora
  useEffect(() => {
    const handleClick = (e) => {
      if (seasonRef.current && !seasonRef.current.contains(e.target)) {
        setShowSeasonMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleVideoCategory = (categoryId) => {
    navigate(`/videos/${categoryId}`);
    setShowVideosMenu(false);
  };

  return (
    <div className="home">
      <style>{responsiveStyles}</style>

      {/* ── BARRA SUPERIOR DE TEMPORADA ─────────────────────────── */}
      <div className="season-bar" style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 2000,
        height: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: "0 24px",
        background: "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 40%, rgba(0,20,50,0.85) 100%)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,237,0,0.12)",
        boxSizing: "border-box",
      }}>

        {/* Selector de temporada */}
        <div ref={seasonRef} style={{ position: "relative" }}>
          <button
            className="season-selector-btn"
            onClick={() => setShowSeasonMenu(!showSeasonMenu)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "0 18px",
              height: "36px",
              background: showSeasonMenu
                ? "rgba(255,237,0,0.18)"
                : "rgba(255,237,0,0.08)",
              border: "1px solid rgba(255,237,0,0.35)",
              borderRadius: "20px",
              cursor: "pointer",
              color: "#FFED00",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "2px",
              textTransform: "uppercase",
              transition: "all 0.2s ease",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={e => {
              if (!showSeasonMenu) e.currentTarget.style.background = "rgba(255,237,0,0.15)";
            }}
            onMouseLeave={e => {
              if (!showSeasonMenu) e.currentTarget.style.background = "rgba(255,237,0,0.08)";
            }}
          >
            {/* Punt verd "en viu" */}
            <span className="season-dot" style={{
              width: "8px", height: "8px",
              borderRadius: "50%",
              background: "#4ade80",
              boxShadow: "0 0 6px #4ade80",
              flexShrink: 0,
              animation: "pulseDot 2s ease-in-out infinite",
            }} />
            <span className="season-label-full">Temporada 26/27</span>
            <span className="season-label-short" style={{ display: "none" }}>26/27</span>
            {/* Badge ACTUAL */}
            <span style={{
              background: "rgba(74,222,128,0.2)",
              color: "#4ade80",
              border: "1px solid rgba(74,222,128,0.4)",
              borderRadius: "10px",
              padding: "1px 8px",
              fontSize: "10px",
              fontWeight: 800,
              letterSpacing: "1.5px",
            }}>ACTUAL</span>
            {/* Fletxa */}
            <span style={{
              fontSize: "10px",
              opacity: 0.7,
              transform: showSeasonMenu ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}>▼</span>
          </button>

          {/* Dropdown de temporades */}
          {showSeasonMenu && (
            <div style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              minWidth: "240px",
              background: "rgba(10,13,22,0.97)",
              border: "1px solid rgba(255,237,0,0.2)",
              borderRadius: "14px",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,237,0,0.05)",
              backdropFilter: "blur(20px)",
              animation: "dropdownIn 0.2s cubic-bezier(0.34,1.56,0.64,1) forwards",
            }}>
              {/* Capçalera del dropdown */}
              <div style={{
                padding: "12px 16px 8px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.3)",
                }}>
                  Selecciona temporada
                </div>
              </div>

              {/* Opcions */}
              {TEMPORADES.map((t, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setShowSeasonMenu(false);
                    navigate(t.ruta);
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    background: t.current ? "rgba(255,237,0,0.07)" : "transparent",
                    border: "none",
                    borderLeft: t.current ? "3px solid #FFED00" : "3px solid transparent",
                    cursor: "pointer",
                    color: t.current ? "#FFED00" : "rgba(255,255,255,0.7)",
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: "15px",
                    fontWeight: t.current ? 800 : 600,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={e => {
                    if (!t.current) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                      e.currentTarget.style.color = "#fff";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!t.current) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                    }
                  }}
                >
                  {/* Indicador */}
                  {t.current ? (
                    <span style={{
                      width: "8px", height: "8px", borderRadius: "50%",
                      background: "#4ade80",
                      boxShadow: "0 0 6px #4ade80",
                      flexShrink: 0,
                    }} />
                  ) : (
                    <span style={{
                      width: "8px", height: "8px", borderRadius: "50%",
                      background: "rgba(255,255,255,0.2)",
                      flexShrink: 0,
                    }} />
                  )}

                  <span style={{ flex: 1, textAlign: "left" }}>
                    <span style={{ display: "block" }}>{t.label}</span>
                    <span style={{
                      display: "block",
                      fontSize: "10px",
                      fontWeight: 500,
                      letterSpacing: "0.5px",
                      color: t.current ? "rgba(255,237,0,0.55)" : "rgba(255,255,255,0.3)",
                      textTransform: "none",
                      marginTop: "2px",
                    }}>{t.subtitol}</span>
                  </span>

                  {/* Badge */}
                  <span style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "1px",
                    padding: "2px 8px",
                    borderRadius: "8px",
                    background: t.current ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.08)",
                    color: t.current ? "#4ade80" : "rgba(255,255,255,0.4)",
                    border: t.current ? "1px solid rgba(74,222,128,0.3)" : "1px solid rgba(255,255,255,0.1)",
                  }}>
                    {t.tag}
                  </span>
                </button>
              ))}

            </div>
          )}
        </div>
      </div>

      {/* Animacions CSS */}
      <style>{`
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.8); }
        }
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .season-selector-btn:focus { outline: none; }
      `}</style>

      {/* Login */}
      {!loggedIn && <LoginModal setLoggedIn={setLoggedIn} />}

      {/* Texto central premium */}
      <div className="home-center-text" style={{ top: "80px" }}>
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
            background: "#4ade80", boxShadow: "0 0 8px #4ade80",
            animation: "pulseDot 2s ease-in-out infinite",
            display: "inline-block", flexShrink: 0,
          }} />
          <span style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "11px", fontWeight: 700,
            letterSpacing: "3px", textTransform: "uppercase",
            color: "rgba(255,255,255,0.6)",
          }}>
            Temporada 26/27 · Cadet B
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
          Contingut exclusiu pares Cadet B · Secció d'Handbol
        </p>
      </div>

      {/* Menú lateral */}
      {loggedIn && (
        <div className="bottom-buttons" style={{ top: "80px" }}>

          <button onClick={() => navigate("/galeria")}>
            <span className="btn-icon">🖼️</span>
            Galeria d'imatges
            <span className="btn-arrow">›</span>
          </button>

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
                {VIDEOS_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    className="submenu-video-item"
                    onClick={() => handleVideoCategory(category.id)}
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
            <button onClick={() => navigate("/EstadisticaSelector")}>
              <span className="btn-icon">📊</span>
              Estadistica
              <span className="btn-arrow">›</span>
            </button>
          )}

          {role === "admin" && (
            <button className="btn-admin" onClick={() => navigate("/admin")}>
              <span className="btn-icon">⚙️</span>
              Panel Admin
              <span className="btn-arrow">›</span>
            </button>
          )}

        </div>
      )}
    </div>
  );
}
