import { useNavigate } from "react-router-dom";
import Carousel3D from "../components/Carousel3D";
import "./style.css";

export default function Videos() {
  const navigate = useNavigate();

  const botones = [
    { image: "/assets/Jornada_1.jpg",  text: "Jornada 1\nFCB-PALAUTORDERA",  url: "https://next.nubeespesan.duckdns.org/s/SJcW7LYRkyD8wfk" },
    { image: "/assets/Jornada_2.jpg",  text: "Jornada 2\nST. CUGAT-FCB",      url: "https://next.nubeespesan.duckdns.org/s/BrzsgYBRJtdpMRJ" },
    { image: "/assets/Jornada_3.jpg",  text: "Jornada 3\nFCB-SANT QUIRZE",    url: "https://next.nubeespesan.duckdns.org/s/6rxF9zS5QPHWn6m" },
    { image: "/assets/Jornada_4.jpg",  text: "Jornada 4\nVIROLAI-FCB",        url: "https://next.nubeespesan.duckdns.org/s/xtFrWEP5sGgXrJm" },
    { image: "/assets/Jornada_5.jpg",  text: "Jornada 5\nFCB-CREU ALTA",      url: "https://next.nubeespesan.duckdns.org/s/CepnAibnXnXGbXg" },
    { image: "/assets/Jornada_6.jpg",  text: "Jornada 6\nESPLUGUES-FCB",      url: "https://next.nubeespesan.duckdns.org/s/We5maWPRBdkBxjE" },
    { image: "/assets/Jornada_7.jpg",  text: "Jornada 7\nFCB-SARRIA",         url: "https://next.nubeespesan.duckdns.org/s/7BZ3iH9jY8xdY7Y" },
    { image: "/assets/Jornada_8.jpg",  text: "Jornada 8\nPALAUTORDERA-FCB",  url: "https://next.nubeespesan.duckdns.org/s/fk8b65f3BqYtFnN" },
    { image: "/assets/Jornada_9.jpg",  text: "Jornada 9\nFCB-ST. CUGAT",     url: "https://next.nubeespesan.duckdns.org/s/HkT8Ma8JxG4CMTM" },
    { image: "/assets/Jornada_10.jpg", text: "Jornada 10\nH. ST. QUIRZE-FCB", url: "https://next.nubeespesan.duckdns.org/s/cwd2gMcBnFNZFRg" },
    { image: "/assets/amistos2.jpg", text: "Amistós\nDOMINICOS-FCB", url: "https://next.nubeespesan.duckdns.org/s/dAFfY2rPNjqyzkN" },
    { image: "/assets/Jornada_11.jpg", text: "Jornada 11\nFCB-VIROLAI VORAMAR", url: "https://next.nubeespesan.duckdns.org/s/KeajsHmekstnd9r" },
    { image: "/assets/Jornada_12.jpg", text: "Jornada 12\nCREU ALTA-FCB", url: "https://next.nubeespesan.duckdns.org/s/N2KBENPym66qoJo" },
    { image: "/assets/Jornada_13.jpg", text: "Jornada 13\nFCB-CH ESPLUGUES", url: "https://next.nubeespesan.duckdns.org/s/PGpS3Dg8bgbiGQC" },
  ];

  return (
    <div className="pro-background">
      <div className="stripe-overlay" aria-hidden="true" />

      <div className="page-header">
        <h1>Vídeos</h1>
        <p className="page-subtitle">Infantil A · FC Barcelona Handbol</p>
      </div>

      <Carousel3D items={botones} />

      <button className="back-button" onClick={() => navigate("/")}>
        <span className="arrow">←</span>
        Enrere
      </button>
    </div>
  );
}
