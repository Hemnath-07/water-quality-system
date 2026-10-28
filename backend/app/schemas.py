from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any


# --- Input Schemas ---

class SamplePredictionInput(BaseModel):
    """Data model for single water quality sample prediction input."""
    ph: float = Field(
        ..., 
        ge=0.0, 
        le=14.0, 
        description="pH value of water (0 to 14)", 
        examples=[7.2]
    )
    Hardness: float = Field(
        ..., 
        ge=0.0, 
        description="Hardness in mg/L", 
        examples=[190.5]
    )
    Solids: float = Field(
        ..., 
        ge=0.0, 
        description="Total Dissolved Solids (TDS) in ppm", 
        examples=[20500.0]
    )
    Chloramines: float = Field(
        ..., 
        ge=0.0, 
        description="Chloramines amount in ppm", 
        examples=[7.1]
    )
    Sulfate: float = Field(
        ..., 
        ge=0.0, 
        description="Sulfate amount in mg/L", 
        examples=[333.3]
    )
    Conductivity: float = Field(
        ..., 
        ge=0.0, 
        description="Electrical Conductivity in μS/cm", 
        examples=[420.0]
    )
    Organic_carbon: float = Field(
        ..., 
        ge=0.0, 
        description="Organic Carbon amount in ppm", 
        examples=[14.2]
    )
    Trihalomethanes: float = Field(
        ..., 
        ge=0.0, 
        description="Trihalomethanes amount in μg/L", 
        examples=[66.3]
    )
    Turbidity: float = Field(
        ..., 
        ge=0.0, 
        description="Turbidity level in NTU", 
        examples=[3.9]
    )


class WaterParametersBatchInput(BaseModel):
    """Data model for batch water quality predictions."""
    samples: List[SamplePredictionInput]


# --- Output / Response Schemas ---

class ModelEvaluationMetrics(BaseModel):
    """Metrics for evaluated classification algorithms."""
    accuracy: float
    precision: float
    recall: float
    f1_score: float


class ParameterStats(BaseModel):
    """Descriptive statistics for dataset parameters."""
    mean: float
    std: float
    min: float
    max: float
    median: float


class DatasetTrainResponse(BaseModel):
    """Structured response for dataset upload and model training execution."""
    message: str
    best_model: str
    model_evaluations: Dict[str, ModelEvaluationMetrics]
    feature_importance: Dict[str, float]
    parameter_summary: Dict[str, ParameterStats]
    disclaimer: str


class PredictionResponse(BaseModel):
    """Structured response for sample prediction queries."""
    prediction_code: int = Field(..., description="0 for Non-Potable, 1 for Potable")
    category: str = Field(..., description="Human-readable classification category")
    confidence: Optional[float] = Field(None, description="Prediction probability confidence score")
    input_parameters: Dict[str, float]
    disclaimer: str


class HealthCheckResponse(BaseModel):
    """API health status and service verification details."""
    status: str
    service: str
    disclaimer: str
