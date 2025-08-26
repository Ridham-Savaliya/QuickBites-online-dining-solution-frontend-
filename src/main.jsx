// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import 'leaflet/dist/leaflet.css';
import PingKeeper from "./utills/Pingkeepr.js";


import { BrowserRouter } from "react-router-dom";
import AppContextProvider from "./Context/AppContext.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
  <PingKeeper/>
    <AppContextProvider>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    </AppContextProvider>
  </BrowserRouter>
);
