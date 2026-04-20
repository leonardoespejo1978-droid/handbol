import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginModal from "../components/LoginModal";
import "./style_1.css";
import "./submenu-videos.css";

const STATS_ALLOWED = ["nilsubi@fcb.es", "leonardoespejo1978@gmail.com", "aleix79@fcb.es"];

const VIDEOS_CATEGORIES = [
  { id: "pretemporada", label: "Pretemporada" },
  { id: "amistosos", label: "Amistosos" },
  { id: "drets-esportius", label: "Drets Esportius" },
  { id: "fase-3", label: "3a Fase" },
  { id: "fase-final", label: "Fase Final" },
  { id: "sectores-ce", label: "Sectores CE" },
  { id: "fase-final-ce", label: "Fase Final CE" },
];

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
