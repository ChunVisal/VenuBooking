// src/pages/Signup.jsx
import { useState } from "react";
import api from "../api/axiosConfig"

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {

    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    const userData = { name, email, password };

    try {
      await api.post("/auth/register", userData);

      setName("");
      setEmail(""); 
      setPassword("");
    } catch (err) {
        console.error("Registration failed:", err);
        const errorMessage = err.response?.data || "Could not connect to the server (Network/CORS error).";
        setError(errorMessage)
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" disabled={loading}>{loading ? "Signing Up..." : "Sign Up"}</button>
      </form>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  )
}