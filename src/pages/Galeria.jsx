import { useNavigate } from "react-router-dom";
import Carousel3D from "../components/Carousel3D";
import "./style.css";

export default function Galeria() {
  const navigate = useNavigate();

  const botones = [
    { image: "/assets/Jornada_1.jpg",  text: "Jornada 1\nFCB-PALAUTORDERA",  url: "https://next.nubeespesan.duckdns.org/s/ooN3Bn2ZQnWk25y" },
    { image: "/assets/Jornada_2.jpg",  text: "Jornada 2\nST. CUGAT-FCB",      url: "https://next.nubeespesan.duckdns.org/s/7TqdxBCXsb4Ps8T" },
    { image: "/assets/Jornada_3.jpg",  text: "Jornada 3\nFCB-SANT QUIRZE",    url: "https://next.nubeespesan.duckdns.org/s/bJzfT4njJY34r4L" },
    { image: "/assets/Jornada_4.jpg",  text: "Jornada 4\nVIROLAI-FCB",        url: "https://next.nubeespesan.duckdns.org/s/owjLbpnc8HYdoEy" },
    { image: "/assets/Jornada_5.jpg",  text: "Jornada 5\nFCB-CREU ALTA",      url: "https://next.nubeespesan.duckdns.org/s/Cbd8Sj2fdLPfdeg" },
    { image: "/assets/Jornada_6.jpg",  text: "Jornada 6\nESPLUGUES-FCB",      url: "https://next.nubeespesan.duckdns.org/s/KG5pLfsTpCBDZc4" },
    { image: "/assets/Jornada_7.jpg",  text: "Jornada 7\nFCB-SARRIA",         url: "https://next.nubeespesan.duckdns.org/s/XHp4CL3xQ6K2AXq" },
    { image: "/assets/Jornada_8.jpg",  text: "Jornada 8\nPALAUTORDERA-FCB",  url: "https://next.nubeespesan.duckdns.org/s/izLiDojJSngYy6a" },
    { image: "/assets/Jornada_9.jpg",  text: "Jornada 9\nFCB-ST. CUGAT",     url: "https://next.nubeespesan.duckdns.org/s/GgipZWWCYCZLi2C" },
    { image: "/assets/Jornada_10.jpg", text: "Jornada 10\nH.ST. QUIRZE-FCB",  url: "https://next.nubeespesan.duckdns.org/s/Cgfdfy84nnRraC3" },
    { image: "/assets/palau_1.jpg",    text: "Extra\nVISITA MUSEU PALAU",     url: "https://next.nubeespesan.duckdns.org/s/SxJWYNmEAbmQq7S" },
    { image: "/assets/amistos2.jpg",    text: "Extra\nAmistós Dominicos",     url: "https://next.nubeespesan.duckdns.org/s/DGTLqnZ6ybbKpH3" },
    { image: "/assets/Jornada_11.jpg",    text: "Jornada 11\nFCB-VIROLAI VORAMAR",     url: "https://next.nubeespesan.duckdns.org/s/XxA34WnDbJX6Zkf" },
    { image: "/assets/Jornada_12.jpg",    text: "Jornada 11\nCREU ALTA-FCB",     url: "https://next.nubeespesan.duckdns.org/s/oZLmRCmKk3P3Arz" },
  ];

  return (
    <div className="pro-background">
      <div className="stripe-overlay" aria-hidden="true" />

      <div className="page-header">
        <h1>Galeria d'imatges</h1>
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
