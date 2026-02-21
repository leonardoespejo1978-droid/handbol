import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginModal from "../components/LoginModal";
import "./style_1.css";

export default function HomePage({ session }) {
  const [loggedIn, setLoggedIn] = useState(!!session);
  const navigate = useNavigate();

  const role = session?.user?.raw_user_meta_data?.role || "user";

  return (
    <div className="home">

      {/* Login */}
      {!loggedIn && <LoginModal setLoggedIn={setLoggedIn} />}

      {/* Texto central */}
      <div className="home-center-text">
        <h1>Infantil A FC BARCELONA Handbol</h1>
        <h2>
          <br /><br />Benvinguts al contingut multimedia exclusiu per l'equip de la secció <br />
          d'handbol del FC BARCELONA
        </h2>
      </div>

      {/* Menú lateral */}
      {loggedIn && (
        <div className="bottom-buttons">

          <button onClick={() => navigate("/galeria")}>
            Galeria d'imatges
          </button>

          <button onClick={() => navigate("/videos")}>
            Vídeos
          </button>

          <button
            onClick={() =>
              window.open(
                "https://resultadosbalonmano.isquad.es/competicion.php?id_superficie=1&seleccion=0&id_categoria=2549&id_competicion=209376&id_temp=2526&id_ambito=0&id_territorial=17",
                "_blank"
              )
            }
          >
            Resultats i classificació
          </button>

          {role === "admin" && (
            <button onClick={() => navigate("/admin")}>
              Panel Admin
            </button>
          )}

        </div>
      )}

    </div>
  );
}

