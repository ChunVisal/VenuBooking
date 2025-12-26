import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const GoogleSignIn = () => {
    const navigate = useNavigate();

  useEffect(() => {
    /* global google */
    const initializeGoogle = () => {
      if (window.google) {
        google.accounts.id.initialize({
          client_id: "1659854909-eleor0ckd60rshs6f17uv0542bi24brp.apps.googleusercontent.com",
          callback: handleCredentialResponse,
        });
        google.accounts.id.renderButton(
          document.getElementById("googleSignInDiv"),
          { theme: "outline", size: "large", shape: "pill" }
        );
      }
    };

    const handleCredentialResponse = async (response) => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/google/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: response.credential }),
          credentials: "include",
        });
        const data = await res.json();
        console.log("Google Login Success:", data);
      } catch (err) {
        console.error("Google Login Failed:", err);
      }

    navigate("/");
    };

    initializeGoogle();
  }, []);

  return (
    <div className="flex flex-col items-center p-4">
      <p className="text-gray-500 text-sm mb-2">Sign in with Google</p>
      <div id="googleSignInDiv"></div>
    </div>
  );
};

export default GoogleSignIn;
