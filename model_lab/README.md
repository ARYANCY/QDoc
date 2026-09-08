# Model Lab — Isolated Medical Foundation Model Staging Workspace

This directory provides an isolated staging ground for downloading, verifying, caching, and benchmarking foundation models (`BiomedCLIP`, `MedSigLIP`, `MedGemma`, `MedicalNet`, `VISTA3D`) separately from the production application.

---

## Directory Structure

```
model_lab/
├── configs/
│   └── models.yaml              # Master configuration of foundation models & hyperparameters
├── scripts/
│   ├── download_models.py       # Download/stage models with SHA-256 checksum verification
│   ├── verify_models.py         # Smoke tests (shapes, L2 norm, determinism, device auto-select)
│   └── benchmark_encoders.py    # Latency, throughput, and memory benchmarking
├── artifacts/
│   ├── weights/                 # Local model weight checkpoints (offline cache)
│   ├── embeddings/              # Cached foundation representations
│   ├── benchmarks/              # Performance metrics & verification reports
│   └── checksums/               # SHA-256 integrity verification files
└── README.md
```

---

## Usage Instructions

### 1. Download & Stage Models
```bash
python model_lab/scripts/download_models.py --model all
```

### 2. Verify Models (Smoke Tests)
```bash
python model_lab/scripts/verify_models.py
```

### 3. Run Benchmark Latency Suite
```bash
python model_lab/scripts/benchmark_encoders.py
```

---

## Foundation Models & Licensing

| Model | ID / Source | Dimension | Modalities | License |
|---|---|---|---|---|
| **BiomedCLIP** | `microsoft/BiomedCLIP-PubMedBERT_256-vit_base_patch16_224` | 512 | 2D X-Ray, Derm, Histopathology | Microsoft Research |
| **MedSigLIP** | `google/medsiglip-448` | 768 | Vision-Language Benchmark | Health AI Foundations |
| **MedGemma** | `google/medgemma-4b-it` | 2048 | Clinical Multimodal Reasoning | Health AI Foundations |
| **MedicalNet** | `Warvito/MedicalNet-models` | 512 | 3D Volumetric CT/MRI | Open Academic |
| **VISTA3D** | `Project-MONAI/VISTA` | 512 | 3D Segmentation & ROI | Apache 2.0 |
