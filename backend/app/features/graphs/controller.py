from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from backend.graphs.generate_graphs import GRAPH_ROOT, generate_all_graphs

router = APIRouter(prefix="/api/v1/graphs", tags=["graphs"])


@router.get("")
def list_graphs():
    generated = generate_all_graphs()
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