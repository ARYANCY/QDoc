import React, { useRef, useEffect } from 'react';
import TopNavbar from './panels/TopNavbar';
import LeftSidebar from './panels/LeftSidebar';
import RightSidebar from './panels/RightSidebar';
import BottomBar from './panels/BottomBar';
import DigitalTwinViewer from './components/DigitalTwinViewer';
import ErrorBoundary from './components/ErrorBoundary';
import { useTwinStore } from './store/twinStore';
import './digitalTwin.css';

/**
 * DigitalTwin3DPage
 *
 * Self-contained 3D Digital Twin module. Used inside the Q-MedSense
 * UnifiedAnalysisPage under the "twin" tab.
 *
 * Props:
 *   patientId  - Optional patient ID from parent page (e.g. from the diagnostic tab)
 *   result     - Optional ML result from the parent diagnostic run, used to pre-populate disease overlay
 */
export default function DigitalTwin3DPage({ patientId, result }) {
  const canvasRef = useRef();
  const loadPatientFromDB = useTwinStore((s) => s.loadPatientFromDB);
  const currentPatient = useTwinStore((s) => s.patient);

  // Auto-load patient when patientId is passed in from parent
  useEffect(() => {
    if (!patientId) return;
    if (currentPatient.patientId !== patientId) {
      loadPatientFromDB(patientId);
    }
  }, [patientId, currentPatient.patientId, loadPatientFromDB]);

  return (
    <ErrorBoundary>
      <div className="dt-workspace">
        {/* Top Controls & Navigation */}
        <TopNavbar canvasRef={canvasRef} />

        {/* 3-Column Studio Layout */}
        <div className="dt-main-grid">
          {/* Left: Patient Details + Clinical Inputs + Disease Controls */}
          <LeftSidebar />

          {/* Center: 3D WebGL Anatomical Viewer */}
          <main className="dt-center-viewer">
            <DigitalTwinViewer canvasRef={canvasRef} />
          </main>

          {/* Right: Anatomy Inspector & Risk Metrics */}
          <RightSidebar />
        </div>

        {/* Bottom: Telemetry KPIs & Severity Legend */}
        <BottomBar />
      </div>
    </ErrorBoundary>
  );
}

