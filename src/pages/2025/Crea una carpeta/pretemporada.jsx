import { useNavigate } from "react-router-dom";
import Carousel3D from "../../components/Carousel3D";
import "../style.css";

export default function Videos() {
  const navigate = useNavigate();

  const botones = [
    { image: "/assets/vuit.jpg", text: "Vuit", url: "" },
  ];

  return (
    <div className="pro-background">
      <div className="stripe-overlay" aria-hidden="true" />
      <div className="page-header">
        <h1>Pretemporada</h1>
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
