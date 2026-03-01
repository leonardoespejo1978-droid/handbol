import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import "./style.css";

export default function Estadistica() {
  const navigate = useNavigate();
  const contenedorRef = useRef(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarExcel = async () => {
      try {
        const response = await fetch("/LLIGA INFANTIL MASCULI 3FASE 25_26.xlsx");

        if (!response.ok) {
          throw new Error(`No se encontró el archivo (${response.status})`);
        }

        const buffer = await response.arrayBuffer();
        const wb = XLSX.read(buffer, { type: "array" });

        console.log("Hojas disponibles:", wb.SheetNames);

        const ws = wb.Sheets["PORTADA"];
        console.log("Contenido PORTADA:", ws);
        console.log("Rango PORTADA:", ws?.["!ref"]);

        const html = XLSX.utils.sheet_to_html(ws);

        if (contenedorRef.current) {
          contenedorRef.current.innerHTML = html;
        }
      } catch (err) {
        console.error("Error cargando Excel:", err);
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    cargarExcel();
  }, []);

  return (
    <div className="pro-background">
      <h1>Estadística</h1>
      {cargando && <p style={{ color: "white", textAlign: "center" }}>Carregant...</p>}
      {error && <p style={{ color: "red", textAlign: "center" }}>Error: {error}</p>}
      <div ref={contenedorRef} className="excel-container" />
      <button className="back-button" onClick={() => navigate("/")}>
        Enrere
        <span className="arrow">←</span>
      </button>
    </div>
  );
}