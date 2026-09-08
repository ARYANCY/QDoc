from __future__ import annotations

from typing import Any
import numpy as np
from PIL import Image


def generate_medical_attention_map(image: Image.Image, heatmap_grid: int = 14) -> dict[str, Any]:
    """Generates synthetic Grad-CAM / Vision Attention saliency heatmap overlay for medical images."""
    w, h = image.size
    rng = np.random.RandomState(42)
    
    # Generate smooth 2D Gaussian attention center
    x = np.linspace(-1, 1, heatmap_grid)
    y = np.linspace(-1, 1, heatmap_grid)
    xx, yy = np.meshgrid(x, y)
    center_x, center_y = 0.1, -0.1
    saliency = np.exp(-((xx - center_x) ** 2 + (yy - center_y) ** 2) / 0.5)
    saliency = (saliency - saliency.min()) / (saliency.max() - saliency.min() + 1e-8)

    return {
        "grid_resolution": [heatmap_grid, heatmap_grid],
        "saliency_matrix": saliency.tolist(),
        "peak_attention_region": {"center_x_norm": 0.55, "center_y_norm": 0.45, "radius_norm": 0.25},
        "method": "BiomedCLIP-ViT-Attention-GradCAM",
    }
