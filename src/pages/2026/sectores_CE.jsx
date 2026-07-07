import { useNavigate } from "react-router-dom";
import Carousel3D from "../../components/Carousel3D";
import "../style.css";

export default function Videos() {
  const navigate = useNavigate();

  const botones = [
    //{ image: "/assets/J1SECTORCE.jpg",  text: "Jornada_1\nFCB-BM VILLAFRANCA",  url: "https://next.nubeespesan.duckdns.org/s/cjNCy3eJYW2G3NS" },
    //{ image: "/assets/J2SECTORCE.jpg",  text: "Jornada_2\nFCB-SAN F. DE ASIS MIJAS",  url: "https://next.nubeespesan.duckdns.org/s/9rzpZnPyjwoBTgs" },
    //{ image: "/assets/J3SECTORCE.jpg",  text: "Jornada_3\nBM ALCOBENDAS-FCB",  url: "https://next.nubeespesan.duckdns.org/s/HDEJfbiZE3NEAHn" },
  ];

  return (
    <div className="pro-background">
      <div className="stripe-overlay" aria-hidden="true" />

      <div className="page-header">
        <h1>Sectors Campionats d'Espanya</h1>
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
