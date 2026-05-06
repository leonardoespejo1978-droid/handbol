import { useState } from "react";
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

const responsiveStyles = `
  @media (max-width: 768px) {
    .bottom-buttons {
      top: 30px !important;
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

    .bottom-buttons button .btn-icon {
      font-size: 12px !important;
    }

    .bottom-buttons button .btn-arrow {
      font-size: 11px !important;
    }

    .submenu-video-item {
      width: 120px !important;
      height: 34px !important;
      padding: 0 8px 0 6px !important;
      gap: 5px !important;
      font-size: 10px !important;
      letter-spacing: 0.3px !important;
    }

    .submenu-icon {
      font-size: 11px !important;
    }

    .submenu-videos-floating {
      gap: 5px !important;
      margin-left: 6px !important;
    }

    .home-center-text {
      top: 20px !important;
    }

    .home-center-text h1 {
      font-size: 1.8rem !important;
    }

    .home-center-text h2 {
      font-size: 0.85rem !important;
      letter-spacing: 0px !important;
    }
  }

  @media (max-width: 480px) {
    .bottom-buttons {
      top: 25px !important;
      left: 8px !important;
      gap: 6px !important;
    }

    .bottom-buttons button {
      width: 120px !important;
      height: 36px !important;
      padding: 0 8px 0 6px !important;
      gap: 5px !important;
      font-size: 10px !important;
      letter-spacing: 0.3px !important;
    }

    .bottom-buttons button .btn-icon {
      font-size: 11px !important;
    }

    .bottom-buttons button .btn-arrow {
      font-size: 10px !important;
    }

    .submenu-video-item {
      width: 100px !important;
      height: 32px !important;
      padding: 0 6px 0 5px !important;
      gap: 4px !important;
      font-size: 9px !important;
      letter-spacing: 0px !important;
    }

    .submenu-icon {
      font-size: 10px !important;
    }

    .submenu-videos-floating {
      gap: 4px !important;
      margin-left: 4px !important;
    }

    .home-center-text {
      top: 15px !important;
    }

    .home-center-text h1 {
      font-size: 1.5rem !important;
    }

    .home-center-text h2 {
      font-size: 0.75rem !important;
    }
  }

  @media (max-width: 360px) {
    .bottom-buttons {
      top: 20px !important;
      left: 6px !important;
      gap: 5px !important;
    }

    .bottom-buttons button {
      width: 100px !important;
      height: 32px !important;
      padding: 0 6px 0 5px !important;
      gap: 4px !important;
      font-size: 9px !important;
      letter-spacing: 0px !important;
    }

    .bottom-buttons button .btn-icon {
      font-size: 10px !important;
    }

    .bottom-buttons button .btn-arrow {
      display: none !important;
    }

    .submenu-video-item {
      width: 85px !important;
      height: 28px !important;
      padding: 0 5px 0 4px !important;
      gap: 3px !important;
      font-size: 8px !important;
    }

    .submenu-icon {
      font-size: 9px !important;
    }

    .submenu-videos-floating {
      gap: 3px !important;
      margin-left: 3px !important;
    }
  }
`;

export default function HomePage({ session }) {
  const [loggedIn, setLoggedIn] = useState(!!session);
  const [showVideosMenu, setShowVideosMenu] = useState(false);
  const navigate = useNavigate();
  const role = session?.user?.raw_user_meta_data?.role || "user";
  const email = session?.user?.email || "";
  const canSeeStats = STATS_ALLOWED.includes(email);

  const handleVideoCategory = (categoryId) => {
    navigate(`/videos/${categoryId}`);
    setShowVideosMenu(false);
  };

  return (
    <div className="home">
      {/* Estilos responsivos */}
      <style>{responsiveStyles}</style>

      {/* Login */}
      {!loggedIn && <LoginModal setLoggedIn={setLoggedIn} />}

      {/* Texto central */}
      <div className="home-center-text">
        <h1>Infantil A FC BARCELONA Handbol</h1>
        <h2>
          <br /><br /><br />Benvinguts al contingut multimedia exclusiu per l'equip <br />
          Infantil A de la secció d'handbol del FC BARCELONA
        </h2>
      </div>

      {/* Menú lateral */}
      {loggedIn && (
        <div className="bottom-buttons">

          <button onClick={() => navigate("/galeria")}>
            <span className="btn-icon">🖼️</span>
            Galeria d'imatges
            <span className="btn-arrow">›</span>
          </button>

          {/* Botón de Vídeos con submenu flotante */}
          <div className="videos-menu-wrapper">
            <button
              onClick={() => setShowVideosMenu(!showVideosMenu)}
              className={showVideosMenu ? "videos-btn-active" : ""}
            >
              <span className="btn-icon">🎬</span>
              Vídeos
              <span className="btn-arrow">›</span>
            </button>

            {/* Submenu flotante en paralelo */}
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
