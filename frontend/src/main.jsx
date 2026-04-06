import { StrictMode } from "react";
import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext";
import { SearchProvider } from "./context/SearchContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <SearchProvider>
        <AuthProvider>
          <WishlistProvider>
            <App />
          </WishlistProvider>
        </AuthProvider>
      </SearchProvider>
    </BrowserRouter>
  </StrictMode>,
);
