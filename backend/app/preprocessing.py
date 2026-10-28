import pandas as pd
import numpy as np
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from typing import Tuple, List, Optional


class DataPreprocessor:
    """
    Handles data cleaning, missing value imputation, outlier management,
    and feature scaling for water quality datasets.
    """

    def __init__(self, imputation_strategy: str = "median"):
        self.imputation_strategy = imputation_strategy
        self.imputer = SimpleImputer(strategy=self.imputation_strategy)
        self.scaler = StandardScaler()
        self.is_fitted = False
        self.feature_names: List[str] = []

    def handle_outliers_iqr(
        self, df: pd.DataFrame, columns: List[str], factor: float = 1.5
    ) -> pd.DataFrame:
        """
        Clips extreme values outside [Q1 - factor*IQR, Q3 + factor*IQR]
        to avoid skewing machine learning predictions.
        """
        df_capped = df.copy()
        for col in columns:
            if col in df_capped.columns and pd.api.types.is_numeric_dtype(df_capped[col]):
                q1 = df_capped[col].quantile(0.25)
                q3 = df_capped[col].quantile(0.75)
                iqr = q3 - q1
                
                lower_bound = q1 - (factor * iqr)
                upper_bound = q3 + (factor * iqr)
                
                df_capped[col] = np.clip(df_capped[col], lower_bound, upper_bound)
                
        return df_capped

    def fit_transform(
        self, df: pd.DataFrame, target_column: Optional[str] = None
    ) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        Fits imputer and scaler on input DataFrame, removes/caps outliers,
        and returns both scaled features and unscaled clean features.
        """
        # Separate feature columns from target if target column is provided
        if target_column and target_column in df.columns:
            feature_cols = [c for c in df.columns if c != target_column]
        else:
            feature_cols = list(df.columns)

        self.feature_names = feature_cols

        # 1. Impute missing values
        imputed_array = self.imputer.fit_transform(df[feature_cols])
        df_imputed = pd.DataFrame(imputed_array, columns=feature_cols)

        # 2. Cap outliers using IQR bounds
        df_clean = self.handle_outliers_iqr(df_imputed, feature_cols)

        # 3. Standardize feature distributions (mean=0, variance=1)
        scaled_array = self.scaler.fit_transform(df_clean[feature_cols])
        df_scaled = pd.DataFrame(scaled_array, columns=feature_cols)

        self.is_fitted = True

        return df_scaled, df_clean

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Transforms incoming single sample or batch using already fitted imputer and scaler.
        Used for inference / live user predictions.
        """
        if not self.is_fitted:
            raise ValueError(
                "Preprocessor has not been fitted yet. Run fit_transform on training data first."
            )

        # Align columns with training features
        df_aligned = df[self.feature_names]

        # Impute missing values
        imputed_array = self.imputer.transform(df_aligned)
        df_imputed = pd.DataFrame(imputed_array, columns=self.feature_names)

        # Cap outliers
        df_clean = self.handle_outliers_iqr(df_imputed, self.feature_names)

        # Scale features
        scaled_array = self.scaler.transform(df_clean[self.feature_names])
        return pd.DataFrame(scaled_array, columns=self.feature_names)
