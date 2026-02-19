import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function AdminPanel({ session }) {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const subirArchivo = async (tipo) => {
    const urlPublica = prompt("Introduce la URL del archivo");
    const descripcion = prompt("Descripción del archivo");

    if (!urlPublica) return;

    try {
      if (tipo === "imagen") {
        await supabase.from("imagenes").insert([{ url: urlPublica, descripcion }]);
      } else if (tipo === "video") {
        await supabase.from("videos").insert([{ url: urlPublica, descripcion }]);
      }
      setSuccess(`${tipo} subida correctamente`);
      setError("");
    } catch (e) {
      setError(`Error al subir ${tipo}: ${e.message}`);
      setSuccess("");
    }
  };

  const role = session?.user?.raw_user_meta_data?.role || "user";
  if (role !== "admin") return <div>No tienes permisos para esta página.</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Panel de administración</h2>
      <button onClick={() => subirArchivo("imagen")} style={{ marginRight: "15px", padding: "10px 20px" }}>
        Subir Fotos
      </button>
      <button onClick={() => subirArchivo("video")} style={{ marginRight: "15px", padding: "10px 20px" }}>
        Subir Video
      </button>
      <button onClick={() => navigate("/")} style={{ padding: "10px 20px" }}>
        Volver
      </button>

      {success && <p style={{ color: "green" }}>{success}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

