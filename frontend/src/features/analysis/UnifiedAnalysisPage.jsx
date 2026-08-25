import { useEffect, useRef, useState } from "react";

const STUDIES = {
  pneumonia: {
    label: "Pneumonia - Chest X-ray",
    models: [{ value: "PneuVision", label: "PneuVision - EfficientNet-B0" }],
    endpoint: "/api/v1/pneumonia/predict",
  },
  skin: {
    label: "Skin Cancer - Lesion Image",
    models: [
      { value: "QuantumDerma", label: "QuantumDerma - Hybrid QML" },
      { value: "DermisNova", label: "DermisNova - EfficientNet-B0" },
      { value: "DenseNet121", label: "DenseNet121 - Classical benchmark" },
      { value: "production", label: "Production model" },
    ],
    endpoint: "/api/v1/skin-cancer/predict",
  },
};

const ACCEPTED_TYPES = "image/*";

const CLASS_LABELS = {
  skin: {
    akiec: "Actinic keratoses / intraepithelial carcinoma",
    bcc: "Basal cell carcinoma",
    bkl: "Benign keratosis-like lesions",
    df: "Dermatofibroma",
    nv: "Melanocytic nevi",
    vasc: "Vascular lesions",
    mel: "Melanoma",
  },
  pneumonia: {
    NORMAL: "Normal",
    PNEUMONIA: "Pneumonia",
  },
};

async function requestAnalysis(file, study, model) {
  const body = new FormData();
  body.append("image", file);
  body.append("model", model);
  const response = await fetch(STUDIES[study].endpoint, { method: "POST", body });
  if (!response.ok) {
    const detail = await response.json().catch(() => ({}));
    throw new Error(detail.detail || "Analysis failed");
  }
  return response.json();
}

function AnalysisResult({ result, study }) {
  return (
    <section className="card result-panel" aria-live="polite">
      <div className="result-heading">
        <div>
          <p className="eyebrow">ANALYSIS RESULT</p>
          <h2>{result.model?.display_class || result.prediction.class}</h2>
          <p className="muted">Model: {result.model?.name || "Selected model"}</p>
          {result.status === "completed" && <p className="muted">Completed in {result.inference_ms} ms</p>}
          {result.pipeline && <p className="muted">Pipeline: {result.pipeline}</p>}
          {result.quantum && <p className="muted">Quantum circuit: {result.quantum.qubits} qubits / {result.quantum.layers} layers</p>}
        </div>
        <strong className="confidence">{(result.prediction.confidence * 100).toFixed(1)}%</strong>
      </div>
      <div className="probability-list">
        {Object.entries(result.probabilities).map(([label, probability]) => (
          <div className="probability" key={label}>
            <span>{CLASS_LABELS[study][label] || label}</span>
            <strong>{(probability * 100).toFixed(1)}%</strong>
            <div className="bar" aria-label={`${label}: ${(probability * 100).toFixed(1)} percent`}>
              <span style={{ width: `${probability * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="disclaimer">
        <strong>Important medical notice</strong>
        <p>{result.disclaimer || "This result is not a diagnosis. Professional medical review is required."}</p>
      </div>
    </section>
  );
}

function CameraCapture({ videoRef, onCapture, onClose }) {
  return (
    <div className="camera-box">
      <video ref={videoRef} autoPlay playsInline aria-label="Camera preview" />
      <div className="button-row">
        <button type="button" className="btn" onClick={onCapture}>Capture image</button>
        <button type="button" className="btn btn-secondary" onClick={onClose}>Close camera</button>
      </div>
    </div>
  );
}

function AnalysisControls({ study, model, file, loading, cameraOpen, inputRef, videoRef, onStudyChange, onModelChange, onFile, onSubmit, onCamera, onCapture, onCloseCamera, error }) {
  const studyConfig = STUDIES[study];
  return (
    <form className="card control-panel" onSubmit={onSubmit}>
      <div className="field-grid">
        <label htmlFor="study-select">Study
          <select id="study-select" value={study} onChange={(event) => onStudyChange(event.target.value)}>
            {Object.entries(STUDIES).map(([value, config]) => <option key={value} value={value}>{config.label}</option>)}
          </select>
        </label>
        <label htmlFor="model-select">Model
          <select id="model-select" value={model} onChange={(event) => onModelChange(event.target.value)}>
            {studyConfig.models.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      </div>
      <div className="drop-zone" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); onFile(event.dataTransfer.files[0]); }} onClick={() => inputRef.current?.click()} role="button" tabIndex="0" onKeyDown={(event) => event.key === "Enter" && inputRef.current?.click()}>
        <input ref={inputRef} hidden id="image-input" type="file" accept={ACCEPTED_TYPES} onChange={(event) => onFile(event.target.files?.[0])} />
        <strong>{file ? file.name : "Drop an image here"}</strong>
        <span>or click to browse any supported image format</span>
      </div>
      <div className="button-row">
        <button type="button" className="btn btn-secondary" onClick={onCamera}>{cameraOpen ? "Close camera" : "Use camera"}</button>
        <button className="btn" type="submit" disabled={!file || loading}>{loading ? "Analysing..." : "Analyse image"}</button>
      </div>
      {cameraOpen && <CameraCapture videoRef={videoRef} onCapture={onCapture} onClose={onCloseCamera} />}
      {error && <p className="warn" role="alert">{error}</p>}
    </form>
  );
}

export default function UnifiedAnalysisPage() {
  const [study, setStudy] = useState("pneumonia");
  const [model, setModel] = useState(STUDIES.pneumonia.models[0].value);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setModel(STUDIES[study].models[0].value);
    setResult(null);
  }, [study]);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  function handleFile(nextFile) {
    if (!nextFile || !nextFile.type.startsWith("image/")) {
      setError("Choose a valid image file.");
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setFile(nextFile);
    setPreview(URL.createObjectURL(nextFile));
    setResult(null);
    setError(null);
  }

  async function openCamera() {
    if (cameraOpen) { closeCamera(); return; }
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Camera access is unavailable in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      streamRef.current = stream;
      setCameraOpen(true);
      requestAnimationFrame(() => { if (videoRef.current) videoRef.current.srcObject = stream; });
    } catch {
      setError("Camera permission was not granted.");
    }
  }

  function closeCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOpen(false);
  }

  function captureImage() {
    const video = videoRef.current;
    if (!video?.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) handleFile(new File([blob], `${study}-camera.jpg`, { type: "image/jpeg" }));
      closeCamera();
    }, "image/jpeg", 0.92);
  }

  async function submit(event) {
    event.preventDefault();
    if (!file) return;
    setLoading(true); setError(null); setResult(null);
    try { setResult(await requestAnalysis(file, study, model)); }
    catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  }

  return (
    <main className="page app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">MEDICAL AI / RESEARCH WORKSPACE</p>
          <h1>Image analysis, in one place.</h1>
          <p className="lede">Select a study, bring an image from disk or camera, and review the model output with its confidence profile.</p>
        </div>
        <span className="status-dot">RESEARCH MODE</span>
      </header>
      <section className="workspace-grid">
        <AnalysisControls study={study} model={model} file={file} loading={loading} cameraOpen={cameraOpen} inputRef={inputRef} videoRef={videoRef} onStudyChange={setStudy} onModelChange={setModel} onFile={handleFile} onSubmit={submit} onCamera={openCamera} onCapture={captureImage} onCloseCamera={closeCamera} error={error} />
        <section className="card preview-panel">
          <p className="eyebrow">INPUT PREVIEW</p>
          {preview ? <img className="analysis-preview" src={preview} alt="Selected medical image" /> : <div className="empty-preview">Your selected image will appear here.</div>}
          <p className="muted">Review framing and image quality before submitting.</p>
        </section>
      </section>
      {result && <AnalysisResult result={result} study={study} />}
      <aside className="disclaimer site-disclaimer">
        <strong>Research decision support only</strong>
        <p>This tool does not diagnose disease. Do not use its output as a substitute for a qualified clinician or radiologist. Seek professional medical advice for symptoms or concerns.</p>
      </aside>
    </main>
  );
}
