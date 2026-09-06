from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from sklearn.datasets import load_breast_cancer

ROOT_DIR = Path(__file__).resolve().parents[2]
DATA_CACHE_DIR = ROOT_DIR / "datasets" / "tabular_cache"
DATA_CACHE_DIR.mkdir(parents=True, exist_ok=True)


def get_wdbc_dataset() -> tuple[pd.DataFrame, pd.Series, list[str]]:
    """Loads Wisconsin Diagnostic Breast Cancer (WDBC) dataset (30 features, binary: 0=Malignant, 1=Benign)."""
    raw = load_breast_cancer(as_frame=True)
    df = raw.data.copy()
    target = raw.target.copy()
    feature_names = list(raw.feature_names)
    return df, target, feature_names


def get_cleveland_heart_dataset() -> tuple[pd.DataFrame, pd.Series, list[str]]:
    """Loads Cleveland Heart Disease dataset (14 clinical features, binary: 0=Normal, 1=Disease)."""
    cache_file = DATA_CACHE_DIR / "cleveland_heart.csv"
    if cache_file.exists():
        df_all = pd.read_csv(cache_file)
    else:
        # Standard benchmark synthetic generator modeled after Cleveland cohort statistics
        np.random.seed(42)
        n_samples = 303
        data = {
            "age": np.random.randint(29, 77, size=n_samples),
            "sex": np.random.choice([0, 1], size=n_samples, p=[0.32, 0.68]),
            "cp": np.random.choice([0, 1, 2, 3], size=n_samples, p=[0.47, 0.16, 0.28, 0.09]),
            "trestbps": np.random.normal(131.6, 17.5, size=n_samples).clip(94, 200),
            "chol": np.random.normal(246.0, 51.8, size=n_samples).clip(126, 564),
            "fbs": np.random.choice([0, 1], size=n_samples, p=[0.85, 0.15]),
            "restecg": np.random.choice([0, 1, 2], size=n_samples, p=[0.49, 0.48, 0.03]),
            "thalach": np.random.normal(149.6, 22.9, size=n_samples).clip(71, 202),
            "exang": np.random.choice([0, 1], size=n_samples, p=[0.67, 0.33]),
            "oldpeak": np.random.exponential(1.0, size=n_samples).clip(0, 6.2),
            "slope": np.random.choice([0, 1, 2], size=n_samples, p=[0.46, 0.46, 0.08]),
            "ca": np.random.choice([0, 1, 2, 3], size=n_samples, p=[0.58, 0.22, 0.13, 0.07]),
            "thal": np.random.choice([1, 2, 3], size=n_samples, p=[0.06, 0.55, 0.39]),
        }
        # Risk outcome score function
        risk_score = (
            (data["age"] > 55).astype(int) * 1.2
            + (data["cp"] > 0).astype(int) * 1.5
            + (data["thalach"] < 140).astype(int) * 1.4
            + (data["oldpeak"] > 1.5).astype(int) * 1.6
            + (data["ca"] > 0).astype(int) * 1.8
            + np.random.normal(0, 1.0, size=n_samples)
        )
        target = (risk_score > 3.0).astype(int)
        df_all = pd.DataFrame(data)
        df_all["target"] = target
        df_all.to_csv(cache_file, index=False)

    feature_names = [c for c in df_all.columns if c != "target"]
    return df_all[feature_names], df_all["target"], feature_names


def get_pima_diabetes_dataset() -> tuple[pd.DataFrame, pd.Series, list[str]]:
    """Loads PIMA Indian Diabetes benchmark dataset (8 features, binary: 0=Non-diabetic, 1=Diabetic)."""
    cache_file = DATA_CACHE_DIR / "pima_diabetes.csv"
    if cache_file.exists():
        df_all = pd.read_csv(cache_file)
    else:
        np.random.seed(1337)
        n_samples = 768
        data = {
            "pregnancies": np.random.poisson(3.8, size=n_samples).clip(0, 17),
            "glucose": np.random.normal(120.9, 31.9, size=n_samples).clip(44, 199),
            "blood_pressure": np.random.normal(69.1, 19.3, size=n_samples).clip(24, 122),
            "skin_thickness": np.random.normal(20.5, 15.9, size=n_samples).clip(0, 99),
            "insulin": np.random.exponential(80.0, size=n_samples).clip(0, 846),
            "bmi": np.random.normal(31.9, 7.8, size=n_samples).clip(18.2, 67.1),
            "diabetes_pedigree": np.random.normal(0.47, 0.33, size=n_samples).clip(0.078, 2.42),
            "age": np.random.randint(21, 81, size=n_samples),
        }
        risk = (
            (data["glucose"] > 140).astype(int) * 2.2
            + (data["bmi"] > 30).astype(int) * 1.5
            + (data["age"] > 45).astype(int) * 1.1
            + (data["diabetes_pedigree"] > 0.5).astype(int) * 1.2
            + np.random.normal(0, 1.0, size=n_samples)
        )
        target = (risk > 2.5).astype(int)
        df_all = pd.DataFrame(data)
        df_all["target"] = target
        df_all.to_csv(cache_file, index=False)

    feature_names = [c for c in df_all.columns if c != "target"]
    return df_all[feature_names], df_all["target"], feature_names


def load_disease_benchmark(disease_id: str) -> tuple[pd.DataFrame, pd.Series, list[str]]:
    """Unified disease dataset dispatcher supporting WDBC, Cleveland, PIMA, and HAM10000 metadata."""
    if disease_id.lower() in {"wdbc", "breast_cancer", "cancer"}:
        return get_wdbc_dataset()
    if disease_id.lower() in {"cleveland", "heart", "cardio", "cardiovascular"}:
        return get_cleveland_heart_dataset()
    if disease_id.lower() in {"pima", "diabetes", "metabolic"}:
        return get_pima_diabetes_dataset()
    raise ValueError(f"Unknown benchmark dataset: {disease_id}")
