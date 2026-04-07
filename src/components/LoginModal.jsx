import { useState } from 'react';
import { supabase } from '../supabaseClient';
import './LoginModal.css';

export default function LoginModal({ setLoggedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Credencials incorrectes");
    } else {
      setLoggedIn(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div className="login-overlay">
      <div className="login-container">
        <div className="login-logo">
          <span className="login-logo-icon">🤾</span>
        </div>
        <h2 className="login-title">Infantil A · FCB Handbol</h2>
        <p className="login-subtitle">Accés exclusiu per a l'equip</p>

        <input
          type="email"
          placeholder="Correu electrònic"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          className="login-input"
          autoComplete="email"
        />
        <input
          type="password"
          placeholder="Contrasenya"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          className="login-input"
          autoComplete="current-password"
        />
        <button onClick={handleLogin} className="login-button">ACCEDIR</button>
        {error && <p className="login-error">{error}</p>}
      </div>
    </div>
  );
}
