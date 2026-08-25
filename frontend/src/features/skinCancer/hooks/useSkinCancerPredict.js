import { useState } from "react";
import { predictLesion } from "../services/api";

export function useSkinCancerPredict() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  async function run(file, model) {
    setLoading(true);
    setError(null);
    try {
      const data = await predictLesion(file, model, true);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, result, run };
}
