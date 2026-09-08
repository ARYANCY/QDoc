from __future__ import annotations

import numpy as np
import pandas as pd
import pytest

from ml.preprocessing.reduction import DimensionalityReducer
from ml.preprocessing.splitting import PatientGroupedSplitter, audit_leakage
from ml.preprocessing.validation import validate_clinical_sample, validate_dataset_schema


def test_patient_grouped_splitting_zero_leakage():
    # Synthetic dataset with 20 samples from 5 unique patients
    data = {
        "patient_id": ["P1", "P1", "P1", "P1", "P2", "P2", "P2", "P3", "P3", "P3", "P3", "P4", "P4", "P4", "P5", "P5", "P5", "P5", "P5", "P5"],
        "feature_1": np.random.randn(20),
        "feature_2": np.random.randn(20),
        "diagnosis": [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    }
    df = pd.DataFrame(data)

    splitter = PatientGroupedSplitter(train_size=0.60, val_size=0.20, test_size=0.20, random_state=42)
    train_df, val_df, test_df = splitter.split(df, target_column="diagnosis", patient_id_column="patient_id")

    # Strict Patient Overlap Check
    train_pts = set(train_df["patient_id"].unique())
    val_pts = set(val_df["patient_id"].unique())
    test_pts = set(test_df["patient_id"].unique())

    assert len(train_pts.intersection(val_pts)) == 0
    assert len(train_pts.intersection(test_pts)) == 0
    assert len(val_pts.intersection(test_pts)) == 0


def test_train_only_dimensionality_reduction():
    # 512-dim synthetic foundation embeddings
    X_train = np.random.randn(30, 512).astype(np.float32)
    y_train = np.random.randint(0, 2, size=30)
    X_test = np.random.randn(10, 512).astype(np.float32)

    reducer = DimensionalityReducer(target_dim=8, method="pca", angle_scaling=True)
    assert not reducer.is_fitted

    # Transformation before fitting must raise RuntimeError
    with pytest.raises(RuntimeError):
        reducer.transform(X_test)

    X_train_reduced = reducer.fit_transform(X_train, y_train)
    assert reducer.is_fitted
    assert X_train_reduced.shape == (30, 8)
    assert np.all(X_train_reduced >= 0.0) and np.all(X_train_reduced <= np.pi)

    # Test transform uses fitted parameters
    X_test_reduced = reducer.transform(X_test)
    assert X_test_reduced.shape == (10, 8)


def test_validation_detects_corrupted_inputs():
    with pytest.raises(ValueError, match="Invalid or empty patient identifier"):
        validate_clinical_sample([1.0, 2.0], modality="tabular", patient_id="   ")

    with pytest.raises(ValueError, match="NaN or Infinite"):
        validate_clinical_sample(np.array([1.0, np.nan, 3.0]), modality="tabular")
