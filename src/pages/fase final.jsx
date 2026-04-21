import { useNavigate } from "react-router-dom";
import Carousel3D from "../components/Carousel3D";
import "./style.css";

export default function Videos() {
  const navigate = useNavigate();

  const botones = [
    { image: "/assets/semifinal_top6.jpg",  text: "Semifinals\nFCB-ST. ESTEVE PALAUTORDERA",  url: "https://next.nubeespesan.duckdns.org/s/cDj2Ni6N9E3EBEY" },
    { image: "/assets/final_top6.jpg",  text: "Finals\nBM GRANOLLERS-FCB",  url: "https://next.nubeespesan.duckdns.org/s/BFK665rrpCLxbMG" },
  ];

  return (
    <div className="pro-background">
      <div className="stripe-overlay" aria-hidden="true" />

      <div className="page-header">
        <h1>Semifinal</h1>
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
