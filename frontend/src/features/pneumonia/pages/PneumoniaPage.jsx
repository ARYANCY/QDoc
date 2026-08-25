import { useState } from "react";
import { predictChestXray } from "../services/api";

export default function PneumoniaPage() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (!file) return;
    setLoading(true); setError(null); setResult(null);
    try { setResult(await predictChestXray(file)); } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <main className="page">
      <header className="card">
        <p className="badge">PNEUMONIA / CHEST X-RAY</p>
        <h1>Thorax screening workspace</h1>
        <p>Research decision support for NORMAL and PNEUMONIA chest X-rays.</p>
      </header>
      <section className="card">
        <form onSubmit={submit}>
          <label htmlFor="xray">Choose a chest X-ray</label>
          <input id="xray" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setFile(event.target.files?.[0] || null)} />
          <button className="btn" type="submit" disabled={!file || loading}>{loading ? "Analysing..." : "Analyse X-ray"}</button>
        </form>
        {error && <p className="warn">{error}</p>}
      </section>
      {result && (
        <section className="card result">
          <p className="badge">MODEL: {result.model.name}</p>
          <h2>{result.prediction.class}</h2>
          <p>Confidence: {(result.prediction.confidence * 100).toFixed(1)}%</p>
          {Object.entries(result.probabilities).map(([label, probability]) => (
            <div className="probability" key={label}><span>{label}</span><strong>{(probability * 100).toFixed(1)}%</strong><div className="bar"><span style={{ width: `${probability * 100}%` }} /></div></div>
          ))}
          <p className="warn">{result.disclaimer}</p>
        </section>
      )}
    </main>
  );
}