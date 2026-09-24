import { useNavigate } from "react-router-dom";
import Carousel3D from "../../components/Carousel3D";
import "../style.css";

export default function Videos() {
  const navigate = useNavigate();

  const botones = [
    { image: "/assets/J1_DRETS_26_27.jpg",  text: "Jornada 1\nFCB-BM GRANOLLERS B",  url: "https://next.nubeespesan.duckdns.org/s/xCMJDC7jTKgwE6m" },
        { image: "/assets/J2_DRETS_26_27.jpg",  text: "Jornada 2\nH. SANT CUGAT_A-FCB",  url: "https://next.nubeespesan.duckdns.org/s/ABiKWJNjZqkKegT" },

  ];

  return (
    <div className="pro-background">
      <div className="stripe-overlay" aria-hidden="true" />

      <div className="page-header">
        <h1>Drets Esportius</h1>
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
