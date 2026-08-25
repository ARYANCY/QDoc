from __future__ import annotations

import json
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

from ml.pneumonia.paths import REPORTS_DIR as PNEUMONIA_REPORTS
from ml.skin_cancer.paths import REPORTS_DIR as SKIN_REPORTS

PROJECT_ROOT = Path(__file__).resolve().parents[2]
GRAPH_ROOT = PROJECT_ROOT / "backend" / "graphs" / "generated"
METRICS = ("accuracy", "macro_f1", "weighted_f1", "roc_auc", "pr_auc", "sensitivity_macro", "specificity_macro", "ece")


def _metric_files(disease: str) -> list[tuple[str, Path]]:
    report_root = SKIN_REPORTS if disease == "skin_cancer" else PNEUMONIA_REPORTS
    if not report_root.exists():
        return []
    if (report_root / "metrics.json").exists():
        return [(report_root.name, report_root / "metrics.json")]
    return [
        (path.parent.name, path)
        for path in sorted(report_root.glob("*/metrics.json"))
        if path.parent.name not in {"features", "cache"}
    ]


def _plot_disease(disease: str) -> list[str]:
    records = []
    for model, path in _metric_files(disease):
        data = json.loads(path.read_text(encoding="utf-8"))
        records.append({"model": data.get("model", model), **{key: data.get(key) for key in METRICS}})
    if not records:
        return []

    output_dir = GRAPH_ROOT / disease
    output_dir.mkdir(parents=True, exist_ok=True)
    labels = [record["model"] for record in records]
    available = [key for key in METRICS if any(record[key] is not None for record in records)]
    values = np.array([[record[key] if record[key] is not None else 0 for key in available] for record in records])
    positions = np.arange(len(labels))
    width = 0.8 / max(len(available), 1)
    fig, axis = plt.subplots(figsize=(max(9, len(labels) * 1.4), 5))
    for index, metric in enumerate(available):
        axis.bar(positions + index * width, values[:, index], width, label=metric.replace("_", " ").title())
    axis.set_ylim(0, 1.05)
    axis.set_ylabel("Score")
    axis.set_title(f"{disease.replace('_', ' ').title()} model comparison")
    axis.set_xticks(positions + width * (len(available) - 1) / 2, labels, rotation=25, ha="right")
    axis.legend(ncol=2)
    axis.grid(axis="y", alpha=0.25)
    fig.tight_layout()
    filename = output_dir / "model_metrics.png"
    fig.savefig(filename, dpi=160)
    plt.close(fig)
    return [str(filename.relative_to(GRAPH_ROOT)).replace("\\", "/")]


def generate_all_graphs() -> dict[str, list[str]]:
    return {disease: _plot_disease(disease) for disease in ("skin_cancer", "pneumonia")}


if __name__ == "__main__":
    print(json.dumps(generate_all_graphs(), indent=2))