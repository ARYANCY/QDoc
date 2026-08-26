from __future__ import annotations

import argparse
from ml.skin_cancer.data.audit_dataset import audit
from ml.skin_cancer.data.detect_duplicates import detect
from ml.skin_cancer.data.split_dataset import build_split
from ml.skin_cancer.evaluation.evaluate_all import evaluate_all
from ml.skin_cancer.paths import MODELS_DIR, ensure_dirs
from ml.skin_cancer.training.common import train_classical
from ml.skin_cancer.training.train_quantum import train_quantum


def run(full: bool = False) -> None:
    """Run the quantum machine learning pipeline.

    1. Audits dataset and checks for duplicates.
    2. Builds stratified split.
    3. Prepares feature extractor backbone (DermisNova) if checkpoint not found.
    4. Trains primary quantum model (QuantumDerma).
    5. If full=True, trains additional quantum variants (QuantumDermaX, VitaQ-Derm, QSkin-Vortex).
    6. Runs evaluation on all trained models.
    """
    ensure_dirs()
    print("== dataset audit ==")
    audit()
    print("== duplicates check ==")
    detect()
    print("== stratified split ==")
    build_split()

    # Feature extractor backbone checkpoint
    backbone_ckpt = MODELS_DIR / "classical" / "DermisNova" / "best.pt"
    if not backbone_ckpt.exists():
        print("== preparing backbone feature extractor (DermisNova) ==")
        train_classical("DermisNova")

    print("== train QuantumDerma (QML) ==")
    train_quantum("QuantumDerma")

    if full:
        print("== train QuantumDermaX (12 qubits QML) ==")
        train_quantum("QuantumDermaX")
        print("== train VitaQ-Derm (Raw-feature QML) ==")
        train_quantum("VitaQ-Derm")
        print("== train QSkin-Vortex (Deep 5-layer QML) ==")
        train_quantum("QSkin-Vortex")

    print("== model evaluation ==")
    evaluate_all()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run the skin cancer QML training pipeline.")
    parser.add_argument("--full", action="store_true", help="Train all quantum model variants")
    args = parser.parse_args()
    run(full=args.full)
