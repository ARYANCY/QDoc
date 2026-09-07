from __future__ import annotations

import json
import pytest
from fastapi.testclient import TestClient

from backend.app.features.ingestion.parser import parse_fhir_bundle, parse_vcf_genomic_variants
from backend.app.main import app

client = TestClient(app)


def test_fhir_json_bundle_parsing():
    fhir_bundle = {
        "resourceType": "Bundle",
        "entry": [
            {
                "resource": {
                    "resourceType": "Patient",
                    "id": "PT-FHIR-99",
                }
            },
            {
                "resource": {
                    "resourceType": "Observation",
                    "code": {
                        "coding": [{"code": "2339-0", "display": "Glucose [Mass/volume] in Blood"}]
                    },
                    "valueQuantity": {"value": 118.0, "unit": "mg/dL"},
                }
            },
        ],
    }
    extracted = parse_fhir_bundle(fhir_bundle)
    assert extracted["patient_id"] == "PT-FHIR-99"
    assert "2339-0" in extracted["observations"]
    assert extracted["biomarkers"]["glucose_[mass/volume]_in_blood"] == 118.0


def test_vcf_genomic_variants_parsing():
    vcf_content = (
        "##fileformat=VCFv4.2\n"
        "#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\n"
        "chr17\t41197708\trs123\tA\tG\t99\tPASS\tBRCA1_MUT=1\n"
        "chr13\t32890572\trs456\tT\tC\t95\tPASS\tBRCA2_MUT=1\n"
    )
    res = parse_vcf_genomic_variants(vcf_content)
    assert res["total_variants"] == 2
    assert res["snps"] == 2


def test_early_detection_pathway_endpoint():
    res = client.get("/api/v1/early-detection/pathway/breast_cancer")
    assert res.status_code == 200
    data = res.json()
    assert "early_detection_window_months" in data
    assert len(data["stages"]) == 3


def test_researcher_retraining_endpoint():
    res = client.post(
        "/api/v1/researcher/train",
        json={"dataset": "wdbc", "model_architecture": "VQC", "n_qubits": 4, "n_layers": 2, "epochs": 2, "learning_rate": 0.02},
    )
    assert res.status_code == 200
    data = res.json()
    assert "training_history" in data
    assert data["status"] == "COMPLETED"


def test_quantum_circuit_telemetry_endpoint():
    res = client.get("/api/v1/quantum-telemetry/circuit/VQC-8Q")
    assert res.status_code == 200
    data = res.json()
    assert data["n_qubits"] == 8
    assert "gate_breakdown" in data
