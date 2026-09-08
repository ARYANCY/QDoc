import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import UnifiedAnalysisPage from "./features/analysis/UnifiedAnalysisPage.jsx";
import EmergencyCardView from "./features/clinical/EmergencyCardView.jsx";
import "./styles.css";

function AppRouter() {
  const [route, setRoute] = useState(getRouteInfo());

  function getRouteInfo() {
    const hash = window.location.hash;
    const path = window.location.pathname;

    if (hash.startsWith("#emergency/") || hash.startsWith("#/emergency/")) {
      const parts = hash.split("/");
      return { isEmergency: true, patientId: parts[parts.length - 1] || "PT-89421" };
    }
    if (path.startsWith("/emergency/")) {
      const parts = path.split("/");
      return { isEmergency: true, patientId: parts[parts.length - 1] || "PT-89421" };
    }
    return { isEmergency: false, patientId: null };
  }

  useEffect(() => {
    function handleNavigation() {
      setRoute(getRouteInfo());
    }
    window.addEventListener("hashchange", handleNavigation);
    window.addEventListener("popstate", handleNavigation);
    return () => {
      window.removeEventListener("hashchange", handleNavigation);
      window.removeEventListener("popstate", handleNavigation);
    };
  }, []);

  if (route.isEmergency) {
    return <EmergencyCardView patientId={route.patientId} />;
  }

  return <UnifiedAnalysisPage />;
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);
