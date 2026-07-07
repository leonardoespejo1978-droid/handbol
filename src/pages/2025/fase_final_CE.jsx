import { useNavigate } from "react-router-dom";
import Carousel3D from "../../components/Carousel3D";
import "../style.css";

export default function Videos() {
  const navigate = useNavigate();

  const botones = [
    { image: "/assets/top8cej1.jpg",  text: "Grupo I J1 CE \nBarça - Cajamar Almería",  url: "https://next.nubeespesan.duckdns.org/s/z7H8RPg9boQTf5d" },
    { image: "/assets/top8cej2.jpg",  text: "Grupo I J2 CE \nBarça - Bathco Torrelavega ",  url: "https://next.nubeespesan.duckdns.org/s/NwLxro9HyogJYFE" },
    { image: "/assets/top8cej3.jpg",  text: "Grupo I J3 CE \nCasiñas Luceros - Barça",  url: "https://next.nubeespesan.duckdns.org/s/wkMdfijLiJHDbyY" },
    { image: "/assets/top8cesemis.jpg",  text: "Semifinal CE \nDominicos - Barça",  url: "https://next.nubeespesan.duckdns.org/s/r4dSyFSetp6JoaX" },
    { image: "/assets/top8cefinal.jpg",  text: "Final CE \nBarça - Bathco Torrelavega",  url: "https://next.nubeespesan.duckdns.org/s/3mPwazLYoTFQ6Zd" },
      
  ];

  return (
    <div className="pro-background">
      <div className="stripe-overlay" aria-hidden="true" />

      <div className="page-header">
        <h1>Fase Final Campionats d'Espanya</h1>
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
