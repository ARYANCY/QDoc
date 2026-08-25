import React from "react";
import { createRoot } from "react-dom/client";
import UnifiedAnalysisPage from "./features/analysis/UnifiedAnalysisPage.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <UnifiedAnalysisPage />
  </React.StrictMode>
);
