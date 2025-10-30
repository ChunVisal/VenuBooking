import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { SetCurrentUser } = useContext(AuthContext); // ✅ Add this

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });

      // ✅ Update context immediately so navbar/profile knows user is logged in
      SetCurrentUser(res.data);

      console.log("Response from server:", res.data);

      // ✅ Use small timeout so alert runs before redirect
      alert("💚 Logged in!");
      navigate("/profile");

    } catch (err) {
      console.error("Login Error:", err);
      const errorMessage = err.response?.data || "Login failed (Network error).";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>
        <div>
          <label>Password:</label>
          <input 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Signing In..." : "Login"}
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}
