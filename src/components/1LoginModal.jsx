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

  return (
    <div className="login-container">
      <input
        type="email"
        placeholder="Correu electrònic"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="login-input"
      />
      <input
        type="password"
        placeholder="Contrasenya"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="login-input"
      />
      <button onClick={handleLogin} className="login-button">ACCEDIR</button>
      {error && <p className="login-error">{error}</p>}
    </div>
  );
}
