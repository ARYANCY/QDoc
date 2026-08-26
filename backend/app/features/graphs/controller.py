from functools import lru_cache
from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

try:
    from backend.graphs.generate_graphs import GRAPH_ROOT, generate_all_graphs
except Exception as exc:  # pragma: no cover - defensive import guard
    GRAPH_ROOT = None
    generate_all_graphs = None
    _GRAPH_IMPORT_ERROR = exc
else:
    _GRAPH_IMPORT_ERROR = None

router = APIRouter(prefix="/api/v1/graphs", tags=["graphs"])


@lru_cache(maxsize=1)
def cached_graphs() -> dict[str, list[str]]:
    if generate_all_graphs is None:
        raise HTTPException(status_code=503, detail=f"Graph generation is unavailable: {_GRAPH_IMPORT_ERROR}")
    return generate_all_graphs()


@router.get("")
def list_graphs():
    try:
        generated = cached_graphs()
    except HTTPException:
        raise
    return {
        "graphs": {
            disease: [f"/api/v1/graphs/{path}" for path in paths]
            for disease, paths in generated.items()
        }
    }


@router.get("/{disease}/{filename}")
def get_graph(disease: str, filename: str):
    if disease not in {"skin_cancer", "pneumonia"} or Path(filename).name != filename:
        raise HTTPException(status_code=404, detail="Graph not found")
    path = GRAPH_ROOT / disease / filename
    if not path.is_file() or path.suffix.lower() != ".png":
        raise HTTPException(status_code=404, detail="Graph not found")
    return FileResponse(path, media_type="image/png")