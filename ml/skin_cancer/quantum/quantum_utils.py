from __future__ import annotations

import numpy as np
import torch


def measurement_in_range(values: torch.Tensor | np.ndarray, lo: float = -1.0, hi: float = 1.0) -> bool:
    arr = values.detach().cpu().numpy() if torch.is_tensor(values) else np.asarray(values)
    return bool(np.isfinite(arr).all() and arr.min() >= lo - 1e-5 and arr.max() <= hi + 1e-5)


def count_parameters(module: torch.nn.Module) -> int:
    return sum(p.numel() for p in module.parameters() if p.requires_grad)
