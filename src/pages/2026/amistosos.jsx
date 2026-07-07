import { useNavigate } from "react-router-dom";
import Carousel3D from "../../components/Carousel3D";
import "../style.css";

export default function Videos() {
  const navigate = useNavigate();

  const botones = [

    //{ image: "/assets/a1.jpg", text: "Amistós\nFCB-DOMINICOS CAD", url: "https://next.nubeespesan.duckdns.org/s/igHmtxTJCz8R68o" },
    //{ image: "/assets/a2.jpg", text: "Amistós\nDOMINICOS-FCB", url: "https://next.nubeespesan.duckdns.org/s/TrGcKark6xMQGcJ" },
    //{ image: "/assets/a3.jpg", text: "Amistós Costa Daurada\nFCB-DOMINICOS", url: "https://next.nubeespesan.duckdns.org/s/RZMAD5JxNs93fcm" },
   ];

  return (
    <div className="pro-background">
      <div className="stripe-overlay" aria-hidden="true" />

      <div className="page-header">
        <h1>Amistosos</h1>
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
