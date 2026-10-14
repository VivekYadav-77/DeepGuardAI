"""
DeepGuard AI — Production REST API (FastAPI)
=============================================
FastAPI service for DeepGuard AI Network Intrusion Detection System.
Designed for deployment on Render (free tier) and consumption by the Vercel Next.js dashboard.

Endpoints:
- GET  /         : Service status & API overview
- GET  /health   : Health check and artifact verification
- GET  /metrics  : Evaluation metrics, training history, and model metadata
- POST /predict  : High-throughput batch inference from raw CSV or JSON records
"""

from __future__ import annotations

import io
import json
import os
from typing import Any, Dict, List, Optional, Union

import pandas as pd
from fastapi import FastAPI, HTTPException, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field

from src.inference import DeepGuardPredictor, DEFAULT_MODEL_DIR
from src.validation import TrafficValidator


# Initialize FastAPI app
app = FastAPI(
    title="DeepGuard AI — Intrusion Detection API",
    description="Production REST API for deep learning network traffic classification & risk analytics (NSL-KDD Benchmark)",
    version="1.0.0",
)

# Enable CORS for Vercel frontend and local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global lazy-loaded predictor & validator singletons
_predictor: Optional[DeepGuardPredictor] = None
_validator: Optional[TrafficValidator] = None


def get_predictor() -> DeepGuardPredictor:
    """Lazy-load and cache the PyTorch model predictor."""
    global _predictor
    if _predictor is None:
        _predictor = DeepGuardPredictor(model_dir=DEFAULT_MODEL_DIR)
    return _predictor


def get_validator() -> TrafficValidator:
    """Lazy-load and cache the schema traffic validator."""
    global _validator
    if _validator is None:
        schema_path = os.path.join(DEFAULT_MODEL_DIR, "feature_schema.json")
        _validator = TrafficValidator(schema_path_or_dict=schema_path)
    return _validator


class PredictRequest(BaseModel):
    csvText: Optional[str] = Field(None, description="Raw CSV string with 41 NSL-KDD features")
    records: Optional[List[Dict[str, Any]]] = Field(None, description="List of feature dict records")


def _read_json_safe(path_to_file: str) -> Optional[Any]:
    if os.path.exists(path_to_file):
        try:
            with open(path_to_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return None
    return None


@app.get("/", tags=["General"])
async def root():
    """Root overview endpoint."""
    return {
        "service": "DeepGuard AI REST API",
        "status": "operational",
        "version": "1.0.0",
        "docs_url": "/docs",
        "model": "PyTorch Multilayer Perceptron (MLP)",
        "deployment": "Render Web Service",
    }


@app.get("/health", tags=["General"])
async def health():
    """Healthcheck endpoint reporting model readiness and loaded artifacts."""
    model_dir = DEFAULT_MODEL_DIR
    weights_path = os.path.join(model_dir, "deepguard_model.pth")
    schema_path = os.path.join(model_dir, "feature_schema.json")
    prep_path = os.path.join(model_dir, "preprocessor.joblib")

    model_ready = all(os.path.exists(p) for p in [weights_path, schema_path, prep_path])

    return {
        "status": "healthy" if model_ready else "degraded",
        "model_ready": model_ready,
        "framework": "PyTorch 2.x (CPU Inference)",
        "memory_optimized": True,
    }


@app.get("/metrics", tags=["Analytics"])
async def get_metrics():
    """
    Return comprehensive model metadata, evaluation benchmarks, and artifact verification status.
    Directly powers the Next.js metrics and telemetry dashboard.
    """
    model_dir = DEFAULT_MODEL_DIR

    evaluation_metrics = _read_json_safe(os.path.join(model_dir, "evaluation_metrics.json"))
    model_metadata = _read_json_safe(os.path.join(model_dir, "model_metadata.json"))
    training_history = _read_json_safe(os.path.join(model_dir, "training_history.json"))
    label_mapping = _read_json_safe(os.path.join(model_dir, "label_mapping.json"))
    feature_schema = _read_json_safe(os.path.join(model_dir, "feature_schema.json"))

    expected_artifacts = [
        "deepguard_model.pth",
        "preprocessor.joblib",
        "feature_schema.json",
        "label_mapping.json",
        "model_metadata.json",
        "evaluation_metrics.json",
        "training_history.json",
        "confusion_matrix.png",
        "baseline_model.joblib",
        "training_curve.png",
    ]

    artifact_status = []
    for name in expected_artifacts:
        fpath = os.path.join(model_dir, name)
        exists = os.path.exists(fpath)
        size_bytes = os.path.getsize(fpath) if exists else 0
        artifact_status.append({
            "name": name,
            "exists": exists,
            "sizeBytes": size_bytes,
            "status": "verified" if (exists and size_bytes > 0) else "missing",
        })

    verified_count = sum(1 for a in artifact_status if a["status"] == "verified")
    readiness = (
        "ready" if verified_count == len(expected_artifacts)
        else "partial" if verified_count > 0
        else "unready"
    )

    return {
        "success": True,
        "readiness": readiness,
        "verifiedCount": verified_count,
        "totalExpected": len(expected_artifacts),
        "artifacts": artifact_status,
        "evaluationMetrics": evaluation_metrics,
        "modelMetadata": model_metadata,
        "trainingHistory": training_history,
        "labelMapping": label_mapping,
        "featureSchemaSummary": {
            "featureCount": feature_schema.get("feature_count") if feature_schema else 41,
            "categoricalColumns": feature_schema.get("categorical_columns", []) if feature_schema else [],
            "numericalCount": len(feature_schema.get("numerical_columns", [])) if feature_schema else 38,
        } if feature_schema else None,
    }


@app.post("/predict", tags=["Inference"])
async def predict_traffic(req: PredictRequest):
    """
    Execute batch inference on uploaded CSV content or JSON records.
    Validates feature schema and returns predictions with bounded confidence scores.
    """
    df: Optional[pd.DataFrame] = None

    if req.csvText and req.csvText.strip():
        try:
            df = pd.read_csv(io.StringIO(req.csvText.strip()))
        except Exception as e:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"success": False, "error": f"Failed to parse CSV text: {str(e)}"},
            )
    elif req.records and len(req.records) > 0:
        try:
            df = pd.DataFrame(req.records)
        except Exception as e:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"success": False, "error": f"Failed to parse records list: {str(e)}"},
            )
    else:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"success": False, "error": "No CSV data (csvText) or records provided in request payload."},
        )

    if df is None or len(df) == 0:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"success": False, "error": "Uploaded dataset is empty (0 records)."},
        )

    try:
        validator = get_validator()
        is_valid, cleaned_df, errors, warnings = validator.validate_dataframe(df)

        if not is_valid:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "success": False,
                    "error": "; ".join(errors) if errors else "Traffic validation failed",
                    "warnings": warnings,
                },
            )

        predictor = get_predictor()
        results = predictor.predict(cleaned_df)

        return {
            "success": True,
            "row_count": len(cleaned_df),
            "warnings": warnings,
            "predictions": results["predictions"],
            "confidence_scores": results["confidence_scores"],
            "labels": results["labels"],
            "summary": results["summary"],
        }
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"success": False, "error": f"Inference execution failed: {str(e)}"},
        )


@app.get("/model/image/{image_name}", tags=["Artifacts"])
async def get_model_image(image_name: str):
    """Serve visualization artifacts (confusion matrix, training curve)."""
    allowed_images = {
        "confusion_matrix.png": "confusion_matrix.png",
        "training_curve.png": "training_curve.png",
    }
    if image_name not in allowed_images:
        raise HTTPException(status_code=404, detail="Image not found")

    file_path = os.path.join(DEFAULT_MODEL_DIR, allowed_images[image_name])
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Image artifact missing on disk")

    return FileResponse(file_path, media_type="image/png")
