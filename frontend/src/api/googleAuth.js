import { useEffect, useContext } from "react";
import api from "./axiosConfig";
import { AuthContext } from "../context/AuthContext";
import { initializeGoogle, renderGoogleButton } from "../utils/googleInit";

const useGoogleSignIn = (navigate, divId = "googleSignInDiv") => {
  const { setCurrentUser } = useContext(AuthContext);

  useEffect(() => {
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
      }
    };

    // Initialize once with the callback
    initializeGoogle(handleCredentialResponse);

    // Render the button on this specific page's div
    renderGoogleButton(divId);
  }, [navigate, setCurrentUser, divId]);
};

export default useGoogleSignIn;
