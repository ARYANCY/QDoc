import { useState, useEffect, useRef } from "react";
import { predictChestXray } from "../services/api";
import { animateEntrance } from "../../../utils/motion";

export default function PneumoniaPage() {
  const containerRef = useRef(null);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      animateEntrance(containerRef.current, { y: 15, duration: 0.35 });
    }
  }, []);

  async function submit(event) {
    event.preventDefault();
    if (!file) return;
    setLoading(true); setError(null); setResult(null);
    try { setResult(await predictChestXray(file)); } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <main ref={containerRef} className="page" style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "900px", margin: "0 auto", padding: "20px 0" }}>
      <header className="card-panel" style={{ borderLeft: "3px solid var(--gold)" }}>
        <p className="step-badge gold">PNEUMONIA // CHEST RADIOGRAPHY</p>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.8rem", fontWeight: 900, color: "var(--ink-primary)", margin: "8px 0 4px 0" }}>
          Thorax Screening Workspace
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.84rem" }}>
          Research decision support for Normal and Pneumonia chest X-rays with hybrid quantum classification.
        </p>
      </header>
      <section className="card-panel">
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <label htmlFor="xray" style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Select Digital Chest Radiograph
          </label>
          <input
            id="xray"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            style={{ padding: "12px", border: "1px dashed var(--border-default)", background: "var(--bg-surface-alt)" }}
          />
          <button className="btn-primary" type="submit" disabled={!file || loading}>
            {loading ? "Analysing Radiograph..." : "Analyse Radiograph via QuantumPneu"}
          </button>
        </form>
        {error && <p className="warn" style={{ marginTop: "12px", color: "var(--risk-high)" }}>{error}</p>}
      </section>
      {result && (
        <section className="card-panel result" style={{ borderLeft: "3px solid var(--emerald-couture)" }}>
          <p className="step-badge">MODEL: {result.model.name}</p>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 900, margin: "8px 0" }}>
            {result.prediction.class}
          </h2>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
            Confidence: <strong style={{ fontFamily: "var(--font-mono)", color: "var(--ink-primary)" }}>{(result.prediction.confidence * 100).toFixed(1)}%</strong>
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", margin: "14px 0" }}>
            {Object.entries(result.probabilities).map(([label, probability]) => (
              <div key={label} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                  <span>{label}</span>
                  <strong style={{ fontFamily: "var(--font-mono)" }}>{(probability * 100).toFixed(1)}%</strong>
                </div>
                <div style={{ height: "6px", background: "var(--bg-surface-alt)", borderRadius: "var(--radius-xs)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${probability * 100}%`, background: "var(--ink-primary)" }} />
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontStyle: "italic", borderTop: "1px solid var(--border-subtle)", paddingTop: "8px" }}>
            {result.disclaimer}
          </p>
        </section>
      )}
    </main>
  );
}