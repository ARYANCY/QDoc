from __future__ import annotations

import time
from typing import Any

import numpy as np
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.neural_network import MLPClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC


class ClassicalBaselineSuite:
    """Trains and evaluates classical machine learning baselines per SRS Section 4.6:
    - Logistic Regression (L2 regularization with StandardScaler)
    - Random Forest (100 estimators)
    - Classical SVM (RBF kernel calibrated)
    - Gradient Boosted Decision Trees (HistGradientBoosting)
    - Multi-Layer Perceptron (MLP with StandardScaler)
    """

    def __init__(self, random_state: int = 42):
        self.random_state = random_state
        self.models: dict[str, Any] = {
            "Logistic Regression": make_pipeline(
                StandardScaler(),
                LogisticRegression(max_iter=1000, random_state=random_state)
            ),
            "Random Forest": RandomForestClassifier(n_estimators=100, random_state=random_state),
            "SVM (RBF)": make_pipeline(
                StandardScaler(),
                CalibratedClassifierCV(SVC(kernel="rbf", random_state=random_state), cv=2)
            ),
            "Gradient Boosting": HistGradientBoostingClassifier(random_state=random_state),
            "MLP Classifier": make_pipeline(
                StandardScaler(),
                MLPClassifier(hidden_layer_sizes=(64, 32), max_iter=500, random_state=random_state)
            ),
        }
        self.fit_times: dict[str, float] = {}

    def fit_all(self, X_train: np.ndarray, y_train: np.ndarray) -> dict[str, float]:
        for name, model in self.models.items():
            start = time.perf_counter()
            model.fit(X_train, y_train)
            self.fit_times[name] = time.perf_counter() - start
        return self.fit_times

    def predict_all(self, X_test: np.ndarray) -> dict[str, np.ndarray]:
        return {name: model.predict(X_test) for name, model in self.models.items()}

    def predict_proba_all(self, X_test: np.ndarray) -> dict[str, np.ndarray]:
        return {name: model.predict_proba(X_test) for name, model in self.models.items()}
