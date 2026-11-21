import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ThemeProvider } from "./common/ThemeContext.jsx";
import AppLoader from "./common/AppLoader.jsx";
import { registerPWA } from "./common/pwa.js";

registerPWA();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <AppLoader>
        <App />
      </AppLoader>
    </ThemeProvider>
  </React.StrictMode>
);