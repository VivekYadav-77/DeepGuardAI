"""
DeepGuard AI — REST API Unit Tests
==================================
Tests for src/api.py FastAPI endpoints:
- GET  /
- GET  /health
- GET  /metrics
- POST /predict (CSV & records payloads, error handling)
- GET  /model/image/{image_name}
"""

import asyncio
import os
import pytest

from src.api import (
    app,
    root,
    health,
    get_metrics,
    predict_traffic,
    get_model_image,
    PredictRequest,
)

SAMPLE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "public")
if not os.path.exists(SAMPLE_DIR):
    SAMPLE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "dashboard", "public")


@pytest.fixture
def benign_csv_content():
    path = os.path.join(SAMPLE_DIR, "sample_benign.csv")
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


@pytest.fixture
def attack_csv_content():
    path = os.path.join(SAMPLE_DIR, "sample_attack.csv")
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def test_api_root():
    data = asyncio.run(root())
    assert data["status"] == "operational"
    assert "version" in data
    assert data["docs_url"] == "/docs"


def test_api_health():
    data = asyncio.run(health())
    assert data["status"] == "healthy"
    assert data["model_ready"] is True
    assert "framework" in data


def test_api_metrics():
    data = asyncio.run(get_metrics())
    assert data["success"] is True
    assert data["readiness"] in ["ready", "partial"]
    assert data["totalExpected"] == 10
    assert len(data["artifacts"]) == 10
    assert "evaluationMetrics" in data
    assert "modelMetadata" in data


def test_api_predict_benign_csv(benign_csv_content):
    req = PredictRequest(csvText=benign_csv_content)
    res = asyncio.run(predict_traffic(req))
    assert res["success"] is True
    assert res["row_count"] > 0
    assert "predictions" in res
    assert "confidence_scores" in res
    assert "labels" in res
    assert all(0.0 <= c <= 1.0 for c in res["confidence_scores"])


def test_api_predict_attack_csv(attack_csv_content):
    req = PredictRequest(csvText=attack_csv_content)
    res = asyncio.run(predict_traffic(req))
    assert res["success"] is True
    assert res["row_count"] > 0
    assert res["summary"]["suspicious_count"] > 0


def test_api_predict_empty_payload():
    req = PredictRequest()
    res = asyncio.run(predict_traffic(req))
    # Returns JSONResponse with 400
    assert res.status_code == 400


def test_api_predict_invalid_csv():
    req = PredictRequest(csvText="col1,col2\n1,2\n3,4")
    res = asyncio.run(predict_traffic(req))
    assert res.status_code == 400


def test_api_predict_records():
    # Pass valid single record
    valid_record = {
        "duration": 0, "protocol_type": "tcp", "service": "http", "flag": "SF",
        "src_bytes": 181, "dst_bytes": 5450, "land": 0, "wrong_fragment": 0, "urgent": 0,
        "hot": 0, "num_failed_logins": 0, "logged_in": 1, "num_compromised": 0, "root_shell": 0,
        "su_attempted": 0, "num_root": 0, "num_file_creations": 0, "num_shells": 0,
        "num_access_files": 0, "num_outbound_cmds": 0, "is_host_login": 0, "is_guest_login": 0,
        "count": 8, "srv_count": 8, "serror_rate": 0.0, "srv_serror_rate": 0.0,
        "rerror_rate": 0.0, "srv_rerror_rate": 0.0, "same_srv_rate": 1.0, "diff_srv_rate": 0.0,
        "srv_diff_host_rate": 0.0, "dst_host_count": 9, "dst_host_srv_count": 9,
        "dst_host_same_srv_rate": 1.0, "dst_host_diff_srv_rate": 0.0,
        "dst_host_same_src_port_rate": 0.11, "dst_host_srv_diff_host_rate": 0.0,
        "dst_host_serror_rate": 0.0, "dst_host_srv_serror_rate": 0.0,
        "dst_host_rerror_rate": 0.0, "dst_host_srv_rerror_rate": 0.0
    }
    req = PredictRequest(records=[valid_record])
    res = asyncio.run(predict_traffic(req))
    assert res["success"] is True
    assert res["row_count"] == 1
    assert len(res["predictions"]) == 1


def test_api_model_image():
    res = asyncio.run(get_model_image("confusion_matrix.png"))
    assert res.status_code == 200
