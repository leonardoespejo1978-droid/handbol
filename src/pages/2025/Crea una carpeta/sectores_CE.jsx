import { useNavigate } from "react-router-dom";
import Carousel3D from "../../components/Carousel3D";
import "../style.css";

export default function Videos() {
  const navigate = useNavigate();

  const botones = [
    { image: "/assets/J1SECTORCE.jpg", text: "Jornada_1\nFCB-BM VILLAFRANCA", url: "" },
    { image: "/assets/J2SECTORCE.jpg", text: "Jornada_2\nFCB-SAN F. DE ASIS MIJAS", url: "" },
    { image: "/assets/vuit.jpg", text: "Jornada_3\nBM ALCOBENDAS-FCB", url: "" },
  ];

  return (
    <div className="pro-background">
      <div className="stripe-overlay" aria-hidden="true" />
      <div className="page-header">
        <h1>Sectors Campionats d'Espanya</h1>
        <p className="page-subtitle">Infantil A · FC Barcelona Handbol · 2025/26</p>
      </div>
      <Carousel3D items={botones} />
      <button className="back-button" onClick={() => navigate("/historico/2025")}>
        <span className="arrow">←</span>
        Enrere
      </button>
    </div>
  );
}
