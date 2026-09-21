import { useNavigate } from "react-router-dom";
import Carousel3D from "../../components/Carousel3D";
import "../style.css";

export default function Videos() {
  const navigate = useNavigate();

  const botones = [
    
    { image: "/assets/pre1.jpg", text: "ST.BOI CUP\nBMG_B-FCB", url: "https://next.nubeespesan.duckdns.org/s/K22Qweyz9oxDGxd" },
    { image: "/assets/pre2.jpg", text: "ST.BOI CUP\nFCB-DOMINICOS_B", url: "https://next.nubeespesan.duckdns.org/s/RBoEyotMZnJF2Ad" },
    { image: "/assets/pre3.jpg", text: "ST.BOI CUP\nFCB-MOLINS", url: "https://next.nubeespesan.duckdns.org/s/ki3osD5PoWs6cKj" },
    { image: "/assets/pre4.jpg", text: "ST.BOI CUP\nCOPE-FCB", url: "https://next.nubeespesan.duckdns.org/s/fQo7pk7x3kPrNam" },

  ];

  return (
    <div className="pro-background">
      <div className="stripe-overlay" aria-hidden="true" />

      <div className="page-header">
        <h1>Pretemporada</h1>
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
