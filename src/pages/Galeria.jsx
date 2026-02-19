import { useNavigate } from "react-router-dom";
import ImageButton from "../components/ImageButton";
import "./style.css";

export default function Galeria() {
  const navigate = useNavigate();

  const botones = [
    { image: "/assets/Jornada_1.jpg", text: "Jornada 1", url: "https://next.nubeespesan.duckdns.org/s/ooN3Bn2ZQnWk25y" },
    { image: "/assets/Jornada_2.jpg", text: "Jornada 2", url: "https://next.nubeespesan.duckdns.org/s/7TqdxBCXsb4Ps8T" },
    { image: "/assets/Jornada_3.jpg", text: "Jornada 3", url: "https://next.nubeespesan.duckdns.org/s/bJzfT4njJY34r4L" },
    { image: "/assets/Jornada_4.jpg", text: "Jornada 4", url: "https://next.nubeespesan.duckdns.org/s/owjLbpnc8HYdoEy" },
    { image: "/assets/Jornada_5.jpg", text: "Jornada 5", url: "https://next.nubeespesan.duckdns.org/s/Cbd8Sj2fdLPfdeg" },
    { image: "/assets/Jornada_6.jpg", text: "Jornada 6", url: "https://next.nubeespesan.duckdns.org/s/KG5pLfsTpCBDZc4" },
  ];

  return (
    <div className="pro-background">
      <h1>galeria d'imatges</h1>

      <div className="button-container">
        {botones.map((btn, idx) => (
          <ImageButton
            key={idx}
            image={btn.image}
            text={btn.text}
            url={btn.url}
          />
        ))}
      </div>

      {/* BOTÓN ENRRERE */}
      <button 
        className="back-button"
        onClick={() => navigate("/")}
      >
        Enrere
        <span className="arrow">←</span>
      </button>
    </div>
  );
}
