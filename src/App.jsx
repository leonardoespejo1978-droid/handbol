import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import HomePage from "./pages/HomePage";
import Galeria from "./pages/Galeria";
import Fase3 from "./pages/3a fase";
import Amistosos from "./pages/amistosos";
import Pretemporada from "./pages/pretemporada";
import DrectsEsportius from "./pages/drets esportius";
import FaseFinal from "./pages/fase final";
import SectoresCE from "./pages/sectores CE";
import FaseFinalCE from "./pages/fase final CE";
import Estadistica from "./pages/Estadistica";
import EstadisticaSelector from "./pages/EstadisticaSelector";
import EstadisticaDrets from "./pages/EstadisticaDrets";
import EstadisticaSectorsCE from "./pages/EstadisticaSectorsCE";
import EstadisticaFaseFinalCE from "./pages/EstadisticaFaseFinalCE";
import AdminPanel from "./pages/AdminPanel";
import './styleApp.css';


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
      </Routes>
    </Router>
  );
}

export default App;
