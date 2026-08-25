from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

_HISTORY: list[dict[str, Any]] = []
_MODELS: list[dict[str, Any]] = []


def save_prediction(record: dict[str, Any]) -> None:
    record = {**record, "created_at": datetime.now(timezone.utc).isoformat()}
    _HISTORY.append(record)


def list_predictions(limit: int = 50) -> list[dict[str, Any]]:
    return list(reversed(_HISTORY[-limit:]))


def register_model(meta: dict[str, Any]) -> None:
    _MODELS.append(meta)
