from __future__ import annotations

import argparse
import json
from pathlib import Path

from ml.skin_cancer.data.audit_dataset import audit
from ml.skin_cancer.data.detect_duplicates import detect
from ml.skin_cancer.data.split_dataset import build_split
from ml.skin_cancer.evaluation.evaluate_all import evaluate_all
from ml.skin_cancer.paths import ensure_dirs
from ml.skin_cancer.training.common import train_classical
from ml.skin_cancer.training.train_qderma_fusion import train_fusion
from ml.skin_cancer.training.train_quantum import train_quantum


def run(full: bool = False) -> None:
    ensure_dirs()
    print("== dataset audit ==")
    audit()
    print("== duplicates ==")
    detect()
    print("== stratified split ==")
    build_split()
    print("== train DermisNova ==")
    train_classical("DermisNova")
    print("== train DenseNet121 ==")
    train_classical("DenseNet121")
    print("== train QuantumDerma ==")
    train_quantum("QuantumDerma")
    if full:
        train_classical("MelanoVanta")
        train_classical("DermaLumen")
        train_quantum("QuantumDermaX")
        train_quantum("VitaQ-Derm")
        train_quantum("QSkin-Vortex")
    print("== fusion ==")
    try:
        train_fusion()
    except Exception as exc:
        print(f"fusion skipped: {exc}")
    print("== comparison ==")
    evaluate_all()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--full", action="store_true")
    args = parser.parse_args()
    run(full=args.full)
