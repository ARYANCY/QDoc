import { useState, useEffect, useRef } from "react";
import { BarChart3, Zap, Activity, CheckCircle2, RefreshCw } from "lucide-react";
import { benchmarksApi } from "../../api/benchmarks";
import { animateEntrance, animateCardStagger } from "../../utils/motion";

export default function BenchmarkMatrix({ disease = "breast_cancer" }) {
  const containerRef = useRef(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    benchmarksApi.getBenchmarkMatrix(disease)
      .then((res) => {
        setData(res);
        if (containerRef.current) {
          animateEntrance(containerRef.current, { y: 15, duration: 0.35 });
          animateCardStagger(containerRef.current, ".bento-stat");
        }
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [disease]);

  const models = data?.models || [];
  const qas = data?.quantum_advantage_score ?? 0.0;
  const bestModel = models.find((m) => m.status === "Active SOTA") || models[0] || {};
  const activeEngine = data?.active_engine || (qas > 0 ? "quantum" : "classical");
  const activeModel = data?.active_model || (activeEngine === "quantum" ? "Quantum VQC" : "Sentinel Baseline");
  const routingRationale = data?.routing_rationale || "";

  return (
    <div ref={containerRef} style={{ display: "flex", flexDirection: "column", gap: "16px", height: "100%", overflowY: "auto", padding: "6px" }}>
      {/* Dynamic Q-Triage Arbiter Deployment Banner */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        padding: "10px 14px",
        borderRadius: "var(--radius-sm)",
        background: activeEngine === "quantum" ? "rgba(0, 242, 254, 0.06)" : "rgba(245, 158, 11, 0.06)",
        border: `1px solid ${activeEngine === "quantum" ? "rgba(0, 242, 254, 0.25)" : "rgba(245, 158, 11, 0.25)"}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            padding: "3px 8px",
            borderRadius: "4px",
            background: activeEngine === "quantum" ? "rgba(0, 242, 254, 0.15)" : "rgba(245, 158, 11, 0.15)",
            color: activeEngine === "quantum" ? "var(--primary)" : "#f59e0b",
            fontFamily: "var(--font-mono)",
          }}>
            {activeEngine === "quantum" ? "⚛️ QUANTUM ACTIVE" : "🛡️ CLASSICAL SENTINEL ACTIVE"}
          </span>
          <span style={{ fontSize: "0.78rem", color: "var(--text-primary)", fontWeight: 600 }}>
            {activeModel}
          </span>
        </div>
        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", maxWidth: "55%", textAlign: "right" }}>
          {routingRationale || (activeEngine === "quantum" ? "Quantum advantage confirmed for this clinical modality." : "Autonomous fallback: Classical baseline protects diagnostic accuracy & specificity.")}
        </div>
      </div>

      {/* QAS Bento Hero Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "8px" }}>
        <div className="bento-stat">
          <div className="corner-tag-arrow">↗</div>
          <div className="bento-stat-num" style={{ color: qas > 0 ? "var(--primary)" : qas < 0 ? "#f59e0b" : "var(--text-muted)" }}>
            {qas > 0 ? `+${(qas * 100).toFixed(2)}%` : qas < 0 ? `${(qas * 100).toFixed(2)}%` : "0.00%"}
          </div>
          <div className="bento-stat-label">
            Quantum Advantage Score ({qas > 0 ? "Quantum Lead" : qas < 0 ? "Classical Advantage" : "Parity"})
          </div>
        </div>
        <div className="bento-stat" style={{ background: "var(--bg-surface-alt)" }}>
          <div className="corner-tag-arrow">↗</div>
          <div className="bento-stat-num" style={{ color: "var(--risk-low)" }}>
            {bestModel.accuracy ? `${(bestModel.accuracy * 100).toFixed(2)}%` : "0.00%"}
          </div>
          <div className="bento-stat-label">Peak Accuracy ({bestModel.model || "Active"})</div>
        </div>
        <div className="bento-stat">
          <div className="corner-tag-arrow">↗</div>
          <div className="bento-stat-num" style={{ color: "var(--text-primary)" }}>
            {bestModel.auc_roc ? Number(bestModel.auc_roc).toFixed(4) : "0.0000"}
          </div>
          <div className="bento-stat-label">ROC-AUC Discrimination</div>
        </div>
        <div className="bento-stat" style={{ background: "var(--bg-surface-alt)" }}>
          <div className="corner-tag-arrow">↗</div>
          <div className="bento-stat-num" style={{ color: "var(--primary)" }}>
            {bestModel.mcc ? Number(bestModel.mcc).toFixed(4) : "0.0000"}
          </div>
          <div className="bento-stat-label">Matthews Correlation (MCC)</div>
        </div>
      </div>

      {/* Comparative Matrix Table */}
      <div className="card-panel" style={{ borderRadius: "var(--radius-sm)", border: "1px solid var(--border-default)" }}>
        <div className="card-header">
          <span className="card-title">
            <BarChart3 size={15} color="var(--primary)" /> Standardized Comparative Evaluation Matrix
          </span>
          <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            {loading ? "Syncing from Backend API..." : "Stratified 70/15/15 Benchmark"}
          </span>
        </div>

        <div className="data-table-wrap" style={{ borderRadius: "var(--radius-sm)", border: "1px solid var(--border-default)" }}>
          <table className="clinical-data-table">
            <thead>
              <tr>
                <th>Model Architecture</th>
                <th>Paradigm</th>
                <th>Accuracy</th>
                <th>Sensitivity</th>
                <th>Specificity</th>
                <th>F1-Score</th>
                <th>AUC-ROC</th>
                <th>MCC</th>
                <th>Latency</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {models.length > 0 ? (
                models.map((m, i) => (
                  <tr key={i}>
                    <td><strong>{m.model}</strong></td>
                    <td>{m.type}</td>
                    <td>{(m.accuracy * 100).toFixed(2)}%</td>
                    <td>{(m.sensitivity * 100).toFixed(2)}%</td>
                    <td>{(m.specificity * 100).toFixed(2)}%</td>
                    <td>{Number(m.f1_score).toFixed(4)}</td>
                    <td><strong>{Number(m.auc_roc).toFixed(4)}</strong></td>
                    <td>{Number(m.mcc).toFixed(4)}</td>
                    <td>{m.inference_time_ms} ms</td>
                    <td>
                      {m.model === activeModel ? (
                        <span style={{
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          padding: "2px 6px",
                          background: activeEngine === "quantum" ? "rgba(0, 242, 254, 0.15)" : "rgba(245, 158, 11, 0.15)",
                          color: activeEngine === "quantum" ? "var(--primary)" : "#f59e0b",
                          border: `1px solid ${activeEngine === "quantum" ? "var(--primary)" : "#f59e0b"}`,
                          borderRadius: "var(--radius-sm)",
                        }}>
                          {activeEngine === "quantum" ? "⚛️ Active Deployed" : "🛡️ Active Deployed"}
                        </span>
                      ) : (
                        <span style={{
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          padding: "1px 5px",
                          background: m.status === "Active SOTA" ? "var(--risk-low-bg)" : "var(--bg-surface-alt)",
                          color: m.status === "Active SOTA" ? "var(--risk-low)" : "var(--text-secondary)",
                          border: "1px solid var(--border-default)",
                          borderRadius: "var(--radius-sm)",
                        }}>
                          {m.status || "Benchmarked"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center", padding: "14px" }}>
                    {loading ? "Fetching benchmark parameters from API..." : "0 benchmark models evaluated. Select disease protocol to load metrics."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
