const API = "/api/v1/skin-cancer";

export async function predictLesion(file, model, explain = true) {
  const body = new FormData();
  body.append("image", file);
  body.append("model", model);
  body.append("explain", String(explain));
  const res = await fetch(`${API}/predict`, { method: "POST", body });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.detail || "Prediction failed");
  }
  return res.json();
}
