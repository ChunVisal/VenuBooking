import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail ] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const userData = {email, password};

    try {
      await api.post('/auth/login', userData);
      alert("💚");
      navigate('/profile');

    } catch (err) {
      console.error("Login Error:", err);
      const errorMessage = err.response?.data || "Login failed (Network error).";
      setError(errorMessage);
    
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
          <button type="submit" disabled={loading}>{loading ? "Signing In..." : "Login"}</button>
    </form>
    {error && <p className="error-message">{error}</p>}
    </div>
  )
}
