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

    def __
