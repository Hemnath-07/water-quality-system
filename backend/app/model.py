import os
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple, Optional, List
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

from app.config import settings


class ModelPipeline:
    """
    Handles machine learning model initialization, comparative evaluation,
    feature importance extraction, predictions, and model serialization.
    """

    def __init__(self):
        self.models: Dict[str, Any] = {
            "RandomForest": RandomForestClassifier(
                n_estimators=100, random_state=settings.RANDOM_STATE
            ),
            "DecisionTree": DecisionTreeClassifier(
                random_state=settings.RANDOM_STATE
            ),
            "GradientBoosting": GradientBoostingClassifier(
                random_state=settings.RANDOM_STATE
            ),
            "LogisticRegression": LogisticRegression(
                max_iter=1000, random_state=settings.RANDOM_STATE
            )
        }
        self.best_model: Optional[Any] = None
        self.best_model_name: str = ""
        self.feature_names: List[str] = []

    def train_and_compare(
        self, X: pd.DataFrame, y: pd.Series
    ) -> Tuple[Dict[str, Dict[str, float]], str, Dict[str, float]]:
        """
        Trains all models on the dataset, evaluates performance using standard metrics,
        selects the best model based on F1-score, and calculates feature importances.
        """
        self.feature_names = list(X.columns)

        X_train, X_test, y_train, y_test = train_test_split(
            X,
            y,
            test_size=settings.TEST_SIZE,
            random_state=settings.RANDOM_STATE,
            stratify=y if len(np.unique(y)) > 1 else None
        )

        evaluations: Dict[str, Dict[str, float]] = {}
        best_f1: float = -1.0

        for name, model in self.models.items():
            model.fit(X_train, y_train)
            preds = model.predict(X_test)

            acc = accuracy_score(y_test, preds)
            prec = precision_score(y_test, preds, average="weighted", zero_division=0)
            rec = recall_score(y_test, preds, average="weighted", zero_division=0)
            f1 = f1_score(y_test, preds, average="weighted", zero_division=0)

            evaluations[name] = {
                "accuracy": round(float(acc), 4),
                "precision": round(float(prec), 4),
                "recall": round(float(rec), 4),
                "f1_score": round(float(f1), 4)
            }

            # Select best performer based on F1 score
            if f1 > best_f1:
                best_f1 = f1
                self.best_model = model
                self.best_model_name = name

        # Compute Feature Importance from the selected model
        feature_importance: Dict[str, float] = self._extract_feature_importance(X)

        # Save the best model artifact to disk
        self.save_model()

        return evaluations, self.best_model_name, feature_importance

    def _extract_feature_importance(self, X: pd.DataFrame) -> Dict[str, float]:
        """
        Extracts feature importances or coefficient magnitudes depending on the model architecture.
        """
        feature_importance: Dict[str, float] = {}
        if self.best_model is None:
            return feature_importance

        if hasattr(self.best_model, "feature_importances_"):
            importances = self.best_model.feature_importances_
            feature_importance = dict(
                zip(X.columns, [round(float(val), 4) for val in importances])
            )
        elif hasattr(self.best_model, "coef_"):
            # For linear models, take absolute magnitude of coefficients
            coefficients = np.abs(self.best_model.coef_[0])
            norm_coefficients = coefficients / np.sum(coefficients)
            feature_importance = dict(
                zip(X.columns, [round(float(val), 4) for val in norm_coefficients])
            )

        # Sort features by importance in descending order
        sorted_importance = dict(
            sorted(feature_importance.items(), key=lambda item: item[1], reverse=True)
        )
        return sorted_importance

    def predict_sample(self, sample_df: pd.DataFrame) -> Tuple[np.ndarray, Optional[List[List[float]]]]:
        """
        Generates prediction output and probability scores for a preprocessed sample.
        """
        if self.best_model is None:
            self.load_model()

        if self.best_model is None:
            raise ValueError("No model trained or loaded for inference.")

        predictions = self.best_model.predict(sample_df)
        
        probabilities = None
        if hasattr(self.best_model, "predict_proba"):
            probabilities = self.best_model.predict_proba(sample_df).tolist()

        return predictions, probabilities

    def save_model(self, file_name: str = "best_water_model.pkl") -> str:
        """
        Serializes the trained best model to the configured models directory.
        """
        if self.best_model is None:
            raise ValueError("No best model available to save.")

        save_path = settings.MODEL_DIR / file_name
        joblib.dump(self.best_model, save_path)
        return str(save_path)

    def load_model(self, file_name: str = "best_water_model.pkl") -> bool:
        """
        Loads a saved model checkpoint from disk.
        """
        file_path = settings.MODEL_DIR / file_name
        if os.path.exists(file_path):
            self.best_model = joblib.load(file_path)
            self.best_model_name = type(self.best_model).__name__
            return True
        return False
