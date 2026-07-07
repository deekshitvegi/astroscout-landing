import React from "react";
import { createRoot } from "react-dom/client";

import AstroPage from "./components/astro/astro-page";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AstroPage />
  </React.StrictMode>,
);
