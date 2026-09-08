"""
Q-MedSense — Universal Application Entry Point
Smart India Hackathon (SIH) Problem Statement ID: 26139

This top-level entry point allows running the Q-MedSense platform via:
    python main.py
or importing the FastAPI application:
    from main import app
"""

from __future__ import annotations

import argparse
import os
import sys

# Ensure project root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import uvicorn
from backend.app.core.config import settings
from backend.app.main import app

__all__ = ["app"]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Q-MedSense Quantum Clinical Decision Support Platform"
    )
    parser.add_argument(
        "--host",
        type=str,
        default=os.getenv("HOST", "127.0.0.1"),
        help="Host IP to bind the server to (default: 127.0.0.1)",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=int(os.getenv("PORT", "8000")),
        help="Port to bind the server to (default: 8000)",
    )
    parser.add_argument(
        "--reload",
        action="store_true",
        default=True,
        help="Enable auto-reload on code changes (default: True)",
    )
    parser.add_argument(
        "--no-reload",
        dest="reload",
        action="store_false",
        help="Disable auto-reload",
    )
    parser.add_argument(
        "--mode",
        choices=["production", "demo"],
        default=os.getenv("QMED_DB_MODE", "production"),
        help="Database mode: 'production' (default) or 'demo'",
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=1,
        help="Number of worker processes (default: 1)",
    )
    return parser.parse_args()


if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass


def print_banner(host: str, port: int, mode: str) -> None:
    banner = r"""
================================================================================
   ____       __  __          _  ____                      
  / __ \     |  \/  |        | |/ ___|  ___ _ __  ___  ___ 
 | |  | |____| |\/| | ___  __| |\___ \ / _ \ '_ \/ __|/ _ \
 | |__| |____| |  | |/ _ \/ _` | ___) |  __/ | | \__ \  __/
  \___\_\    |_|  |_|\___/\__,_||____/ \___|_| |_|___/\___|
                                                           
  Hybrid Quantum Machine Learning Clinical Decision Support Platform
  Smart India Hackathon (SIH) Problem Statement ID: 26139
================================================================================
  API Server:       http://""" + f"{host}:{port}\n" + r"""  Swagger Docs:     http://""" + f"{host}:{port}/docs\n" + r"""  ReDoc:            http://""" + f"{host}:{port}/redoc\n" + f"""  Database Mode:   {mode.upper()} ({settings.DB_PATH.name})
  Quantum Engine:  {settings.QUANTUM_BACKEND.upper()} ({settings.SIMULATOR_SHOTS} shots)
  Frontend:        {settings.FRONTEND_URL}
================================================================================
"""
    try:
        print(banner)
    except Exception:
        pass


def main() -> None:
    args = parse_args()
    os.environ["QMED_DB_MODE"] = args.mode

    print_banner(args.host, args.port, args.mode)

    uvicorn.run(
        "backend.app.main:app",
        host=args.host,
        port=args.port,
        reload=args.reload,
        reload_excludes=[".venv/**", "node_modules/**", "frontend/**", "card-frontend/**"],
        workers=args.workers if not args.reload else 1,
    )


if __name__ == "__main__":
    main()
