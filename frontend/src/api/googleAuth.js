// src/api/googleAuth.js
import { useEffect, useContext } from "react";
import api from "./axiosConfig";
import { AuthContext } from "../context/AuthContext";

const useGoogleSignIn = (navigate, divId = "googleSignInDiv") => {
  const { setCurrentUser } = useContext(AuthContext);

  useEffect(() => {
    /* global google */
    const handleCredentialResponse = async (response) => {
      try {
        const res = await api.post("/auth/google-login", {
          credential: response.credential,
        });
        localStorage.setItem("token", res.data.token);
        setCurrentUser(res.data.user);
        navigate("/profile");
      } catch (err) {
        console.error("Google Login Failed:", err);
        alert("Google sign-in failed. Try again.");
      }
    };

    if (window.google) {
      google.accounts.id.initialize({
        client_id:
          "1659854909-ot1fb6idch1rraokqd2enregomv71j7h.apps.googleusercontent.com",
        callback: handleCredentialResponse,
      });
      const rootDiv = document.getElementById(divId);
      if (rootDiv) {
        google.accounts.id.renderButton(rootDiv, {
          theme: "outline",
          size: "large",
          shape: "pill",
          width: "380",
        });
      }
    }
  }, [navigate, setCurrentUser, divId]);
};

export default useGoogleSignIn;
