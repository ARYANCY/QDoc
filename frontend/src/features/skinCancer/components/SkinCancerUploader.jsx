export default function SkinCancerUploader({ onFile, model, setModel }) {
  return (
    <div className="card">
      <h3>Upload lesion image</h3>
      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => onFile(e.target.files?.[0])} />
      <p>
        Model{" "}
        <select value={model} onChange={(e) => setModel(e.target.value)}>
          <option>QuantumDerma</option>
          <option>DermisNova</option>
          <option>production</option>
        </select>
      </p>
    </div>
  );
}
