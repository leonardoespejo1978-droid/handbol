import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import HomePage from "./pages/HomePage";
import Galeria from "./pages/Galeria";
import Videos from "./pages/Videos";
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
        <Route path="/videos" element={<Videos />} />
        <Route path="/admin" element={<AdminPanel session={session} />} />
      </Routes>
    </Router>
  );
}

export default App;
