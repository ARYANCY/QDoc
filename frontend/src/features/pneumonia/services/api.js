export async function predictChestXray(file) {
  const body = new FormData();
  body.append("image", file);
  const response = await fetch("/api/v1/pneumonia/predict", { method: "POST", body });
  if (!response.ok) {
    const detail = await response.json().catch(() => ({}));
    throw new Error(detail.detail || "Prediction failed");
  }
  return response.json();
}