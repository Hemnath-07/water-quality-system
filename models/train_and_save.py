import os
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, f1_score


def generate_mock_water_data(samples: int = 1000) -> pd.DataFrame:
    """Generates synthetic water quality data if no local dataset exists."""
    np.random.seed(42)
    data = {
        "ph": np.random.normal(7.0, 1.2, samples),
        "Hardness": np.random.normal(195.0, 30.0, samples),
        "Solids": np.random.normal(22000.0, 5000.0, samples),
        "Chloramines": np.random.normal(7.1, 1.5, samples),
        "Sulfate": np.random.normal(333.0, 40.0, samples),
        "Conductivity": np.random.normal(420.0, 80.0, samples),
        "Organic_carbon": np.random.normal(14.0, 3.0, samples),
        "Trihalomethanes": np.random.normal(66.0, 15.0, samples),
        "Turbidity": np.random.normal(3.9, 0.8, samples),
        "Potability": np.random.choice([0, 1], size=samples, p=[0.6, 0.4])
    }
    return pd.DataFrame(data)


def build_and_save_model():
    base_dir = Path(__file__).resolve().parent
    models_dir = base_dir / "models"
    models_dir.mkdir(parents=True, exist_ok=True)
    
    csv_path = base_dir / "water_potability.csv"

    # 1. Load Data
    if csv_path.exists():
        print(f"Loading dataset from: {csv_path}")
        df = pd.read_csv(csv_path)
    else:
        print("No local 'water_potability.csv' found. Generating synthetic dataset...")
        df = generate_mock_water_data()

    X = df.drop(columns=["Potability"])
    y = df["Potability"]

    # 2. Impute Missing Values & Scale
    imputer = SimpleImputer(strategy="median")
    scaler = StandardScaler()
    
    X_imputed = imputer.fit_transform(X)
    X_scaled = scaler.fit_transform(X_imputed)

    # 3. Train-Test Split
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42, stratify=y
    )

    # 4. Compare Models
    candidate_models = {
        "RandomForest": RandomForestClassifier(n_estimators=100, random_state=42),
        "DecisionTree": DecisionTreeClassifier(random_state=42),
        "LogisticRegression": LogisticRegression(max_iter=1000, random_state=42)
    }

    best_model = None
    best_name = ""
    best_f1 = -1.0

    print("\n--- Training Models ---")
    for name, model in candidate_models.items():
        model.fit(X_train, y_train)
        preds = model.predict(X_test)
        
        acc = accuracy_score(y_test, preds)
        f1 = f1_score(y_test, preds, average="weighted", zero_division=0)
        
        print(f"Model: {name:<18} | Accuracy: {acc:.4f} | F1 Score: {f1:.4f}")
        
        if f1 > best_f1:
            best_f1 = f1
            best_model = model
            best_name = name

    # 5. Save best model artifact (.pkl)
    save_path = models_dir / "best_water_model.pkl"
    joblib.dump(best_model, save_path)
    
    print("\n--------------------------------------------------")
    print(f"Selected Best Model : {best_name}")
    print(f"Successfully Created : {save_path}")
    print("--------------------------------------------------")


if __name__ == "__main__":
    build_and_save_model()
