import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginModal from "../components/LoginModal";
import "./style_1.css";

const STATS_ALLOWED = ["nilsubi@fcb.es", "leonardoespejo1978@gmail.com", "aleix79@fcb.es"];

export default function HomePage({ session }) {
  const [loggedIn, setLoggedIn] = useState(!!session);
  const navigate = useNavigate();
  const role = session?.user?.raw_user_meta_data?.role || "user";
  const email = session?.user?.email || "";
  const canSeeStats = STATS_ALLOWED.includes(email);

  return (
    <div className="home">
      {/* Login */}
      {!loggedIn && <LoginModal setLoggedIn={setLoggedIn} />}

      {/* Texto central */}
      <div className="home-center-text">
        <h1>Infantil A FC BARCELONA Handbol</h1>
        <h2>
          <br /><br /><br />Benvinguts al contingut multimedia exclusiu per l'equip de la secció <br />
          d'handbol del FC BARCELONA
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

          <button onClick={() => navigate("/videos")}>
            <span className="btn-icon">🎬</span>
            Vídeos
            <span className="btn-arrow">›</span>
          </button>

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
            <button onClick={() => navigate("/Estadistica")}>
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
