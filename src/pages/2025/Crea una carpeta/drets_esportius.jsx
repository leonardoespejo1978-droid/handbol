import { useNavigate } from "react-router-dom";
import Carousel3D from "../../components/Carousel3D";
import "../style.css";

export default function Videos() {
  const navigate = useNavigate();

  const botones = [
    { image: "/assets/vuit.jpg", text: "Jornada 1\nFCB-VIROLAI VORAMAR", url: "" },
    { image: "/assets/vuit.jpg", text: "Jornada 2\nBM LA ROCA-FCB", url: "" },
    { image: "/assets/vuit.jpg", text: "Jornada 3\nFCB-BCN SANTS", url: "" },
    { image: "/assets/vuit.jpg", text: "Jornada 4\nC.A. SABADELL-FCB", url: "" },
    { image: "/assets/vuit.jpg", text: "Jornada 5\nFCB-BM GRANOLLERS", url: "" },
    { image: "/assets/vuit.jpg", text: "Jornada 6\nVIROLAI VORAMAR-FCB", url: "" },
    { image: "/assets/vuit.jpg", text: "Jornada 7\nFCB-LA ROCA", url: "" },
    { image: "/assets/vuit.jpg", text: "Jornada 8\nBCN SANTS-FCB", url: "" },
    { image: "/assets/vuit.jpg", text: "Jornada 9\nFCB-C.A. SABADELL", url: "" },
    { image: "/assets/vuit.jpg", text: "Jornada 10\nBM. GRANOLLERS-FCB", url: "" },
  ];

  return (
    <div className="pro-background">
      <div className="stripe-overlay" aria-hidden="true" />
      <div className="page-header">
        <h1>Drets Esportius</h1>
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
