from __future__ import annotations

import numpy as np
import pandas as pd
import pytest

from ml.data.preprocessing import QuantumPreprocessor, deidentify_dataframe, smote_oversample


def test_deidentify_dataframe():
    df = pd.DataFrame({
        "patient_name": ["Alice", "Bob"],
        "mrn": ["12345", "67890"],
        "age": [45, 62],
        "mean_radius": [14.2, 18.5],
    })
    clean_df, removed = deidentify_dataframe(df)
    assert "patient_name" in removed
    assert "mrn" in removed
    assert "age" not in removed
    assert "mean_radius" in clean_df.columns
    assert len(clean_df.columns) == 2


def test_quantum_preprocessor_scaling_and_pca():
    X = np.random.randn(50, 16)
    y = np.random.randint(0, 2, size=50)

    preprocessor = QuantumPreprocessor(n_qubits=8, scaling="quantum_angle", use_pca=True)
    X_q = preprocessor.fit_transform(X, y)

    # Must be projected down to 8 qubits
    assert X_q.shape == (50, 8)
    # Scaled into [0, pi]
    assert np.all(X_q >= 0.0)
    assert np.all(X_q <= np.pi + 1e-4)


def test_smote_oversample():
    # 80 class 0, 20 class 1
    X = np.random.randn(100, 4)
    y = np.array([0] * 80 + [1] * 20)

    X_bal, y_bal = smote_oversample(X, y)
    assert len(y_bal) == 160  # 80 + 80
    assert (y_bal == 0).sum() == 80
    assert (y_bal == 1).sum() == 80
