from __future__ import annotations

import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns


def save_confusion_matrix(cm: np.ndarray, class_names: list[str], path, title: str = "Confusion matrix"):
    fig, ax = plt.subplots(figsize=(7, 6))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", xticklabels=class_names, yticklabels=class_names, ax=ax)
    ax.set_xlabel("Predicted")
    ax.set_ylabel("True")
    ax.set_title(title)
    fig.tight_layout()
    fig.savefig(path, dpi=140)
    plt.close(fig)
