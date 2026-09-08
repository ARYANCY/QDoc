import React, { useRef, useEffect } from 'react';
import TopNavbar from './panels/TopNavbar';
import LeftSidebar from './panels/LeftSidebar';
import RightSidebar from './panels/RightSidebar';
import BottomBar from './panels/BottomBar';
import DigitalTwinViewer from './components/DigitalTwinViewer';
import ErrorBoundary from './components/ErrorBoundary';
import { useTwinStore } from './store/twinStore';

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
      <div className="w-full h-full flex flex-col bg-[#090A0D] text-slate-100 overflow-hidden font-sans" style={{ minHeight: 0 }}>

        {/* Top Layer Controls */}
        <TopNavbar canvasRef={canvasRef} />

        {/* 3-Column Layout */}
        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* Left: Patient Details + Disease Controls */}
          <LeftSidebar />

          {/* Center: 3D WebGL Viewer */}
          <main className="flex-1 h-full relative overflow-hidden min-w-0">
            <DigitalTwinViewer canvasRef={canvasRef} />
          </main>

          {/* Right: Anatomy Inspector */}
          <RightSidebar />
        </div>

        {/* Bottom: Legend + Analytics */}
        <BottomBar />
      </div>
    </ErrorBoundary>
  );
}
