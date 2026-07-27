import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import './styleApp.css';

// ── Pàgines comunes (arrel) ───────────────────────────────────────────────────
import HomePage from "./pages/HomePage";
import Historico from "./pages/Historico";
import AdminPanel from "./pages/AdminPanel";

// ── Temporada 2026/2027 (actual) ──────────────────────────────────────────────
import Galeria from "./pages/2026/Galeria";
import Fase3 from "./pages/2026/3a_fase";
import Amistosos from "./pages/2026/amistosos";
import Pretemporada from "./pages/2026/pretemporada";
import DrectsEsportius from "./pages/2026/drets_esportius";
import FaseFinal from "./pages/2026/fase_final";
import SectoresCE from "./pages/2026/sectores_CE";
import FaseFinalCE from "./pages/2026/fase_final_CE";
import Estadistica from "./pages/2026/Estadistica";
import EstadisticaSelector from "./pages/2026/EstadisticaSelector";
import EstadisticaDrets from "./pages/2026/EstadisticaDrets";
import EstadisticaSectorsCE from "./pages/2026/EstadisticaSectorsCE";
import EstadisticaFaseFinalCE from "./pages/2026/EstadisticaFaseFinalCE";


// ── Temporada 2025/2026 ───────────────────────────────────────────────────────
import HomePage2025 from "./pages/2025/HomePage2025";
import Galeria2025 from "./pages/2025/Galeria";
import Fase3_2025 from "./pages/2025/3a_fase";
import Amistosos2025 from "./pages/2025/amistosos";
import Pretemporada2025 from "./pages/2025/pretemporada";
import DrectsEsportius2025 from "./pages/2025/drets_esportius";
import FaseFinal2025 from "./pages/2025/fase_final";
import SectoresCE2025 from "./pages/2025/sectores_CE";
import FaseFinalCE2025 from "./pages/2025/fase_final_CE";
import Estadistica2025 from "./pages/2025/Estadistica";
import EstadisticaSelector2025 from "./pages/2025/EstadisticaSelector";
import EstadisticaDrets2025 from "./pages/2025/EstadisticaDrets";
import EstadisticaSectorsCE2025 from "./pages/2025/EstadisticaSectorsCE";
import EstadisticaFaseFinalCE2025 from "./pages/2025/EstadisticaFaseFinalCE";



function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener?.subscription?.unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>

        {/* ── Temporada actual (2026/2027) ─────────────────────────────── */}
        <Route path="/" element={<HomePage session={session} />} />
        <Route path="/galeria" element={<Galeria />} />
        <Route path="/videos/pretemporada" element={<Pretemporada />} />
        <Route path="/videos/amistosos" element={<Amistosos />} />
        <Route path="/videos/drets-esportius" element={<DrectsEsportius />} />
        <Route path="/videos/fase-3" element={<Fase3 />} />
        <Route path="/videos/fase-final" element={<FaseFinal />} />
        <Route path="/videos/sectores-ce" element={<SectoresCE />} />
        <Route path="/videos/fase-final-ce" element={<FaseFinalCE />} />
        <Route path="/EstadisticaSelector" element={<EstadisticaSelector />} />
        <Route path="/Estadistica" element={<Estadistica />} />
        <Route path="/EstadisticaDrets" element={<EstadisticaDrets />} />
        <Route path="/EstadisticaSectorsCE" element={<EstadisticaSectorsCE />} />
        <Route path="/EstadisticaFaseFinalCE" element={<EstadisticaFaseFinalCE />} />
        <Route path="/admin" element={<AdminPanel session={session} />} />

        {/* ── Pàgina d'històric ─────────────────────────────────────────── */}
        <Route path="/historico" element={<Historico />} />

        {/* ── Temporada 2025/2026 ───────────────────────────────────────── */}
        <Route path="/historico/2025" element={<HomePage2025 session={session} />} />
        <Route path="/2025/galeria" element={<Galeria2025 />} />
        <Route path="/2025/videos/pretemporada" element={<Pretemporada2025 />} />
        <Route path="/2025/videos/amistosos" element={<Amistosos2025 />} />
        <Route path="/2025/videos/drets-esportius" element={<DrectsEsportius2025 />} />
        <Route path="/2025/videos/fase-3" element={<Fase3_2025 />} />
        <Route path="/2025/videos/fase-final" element={<FaseFinal2025 />} />
        <Route path="/2025/videos/sectores-ce" element={<SectoresCE2025 />} />
        <Route path="/2025/videos/fase-final-ce" element={<FaseFinalCE2025 />} />
        <Route path="/2025/EstadisticaSelector" element={<EstadisticaSelector2025 />} />
        <Route path="/2025/Estadistica" element={<Estadistica2025 />} />
        <Route path="/2025/EstadisticaDrets" element={<EstadisticaDrets2025 />} />
        <Route path="/2025/EstadisticaSectorsCE" element={<EstadisticaSectorsCE2025 />} />
        <Route path="/2025/EstadisticaFaseFinalCE" element={<EstadisticaFaseFinalCE2025 />} />


      </Routes>
    </Router>
  );
}

export default App;
