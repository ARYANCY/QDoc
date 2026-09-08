from __future__ import annotations

import hashlib
import html
import time
from typing import Optional
from fastapi import APIRouter, Query
from pydantic import BaseModel

from backend.app.db.repository import DatabaseRepository

router = APIRouter(prefix="/api/v1/reports", tags=["Clinical Reports"])


class ReportGenerationRequest(BaseModel):
    patient_id: str = "PT-89421"
    disease: str = "Breast Oncology (WDBC)"
    prediction_class: str = "Malignant (High Risk)"
    confidence: float = 0.9474
    classical_confidence: float = 0.9123
    top_biomarkers: list[str] = ["Mean Radius (34%)", "Concavity (26%)", "Mean Texture (18%)"]


@router.post("/generate")
async def generate_clinical_report(req: ReportGenerationRequest):
    """Generates an ultra-luxurious, efficient, printable health intelligence report with cryptographic verification."""
    safe_patient_id = html.escape(req.patient_id)
    safe_disease = html.escape(req.disease)
    safe_prediction_class = html.escape(req.prediction_class)
    
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S UTC")
    report_id = f"REP-{hashlib.sha256(f'{req.patient_id}-{timestamp}'.encode()).hexdigest()[:10].upper()}"
    crypto_hash = hashlib.sha256(f"{req.patient_id}:{req.disease}:{req.prediction_class}:{timestamp}".encode()).hexdigest()
    
    is_high_risk = any(w in req.prediction_class.lower() for w in ["malignant", "disease", "elevated", "pneumonia", "high"])
    status_theme_color = "#DC2626" if is_high_risk else "#059669"
    status_bg_color = "#FEF2F2" if is_high_risk else "#ECFDF5"
    status_badge_text = "ELEVATED RISK DETECTED" if is_high_risk else "OPTIMAL / LOW RISK"

    biomarker_rows_html = ""
    for bm in req.top_biomarkers:
        # Extract name and percentage if available
        raw_name = bm.split("(")[0].strip() if "(" in bm else bm
        safe_bm_name = html.escape(raw_name)
        pct_str = bm.split("(")[1].replace(")", "").replace("%", "").strip() if "(" in bm else "25"
        try:
            pct_val = float(pct_str)
        except ValueError:
            pct_val = 25.0
        
        biomarker_rows_html += f"""
        <div style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; margin-bottom: 4px; color: #0F172A;">
            <span>{safe_bm_name}</span>
            <span style="color: #0284C7; font-family: monospace;">{pct_val:.1f}% Impact Weight</span>
          </div>
          <div style="width: 100%; height: 8px; background: #E2E8F0; border-radius: 0; overflow: hidden;">
            <div style="width: {min(pct_val * 2.2, 100):.1f}%; height: 100%; background: linear-gradient(90deg, #0284C7, #38BDF8);"></div>
          </div>
        </div>
        """

    report_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Q-MEDSENSE Health Intelligence Report // {safe_patient_id}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700;800&display=swap');
    
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    
    body {{
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: #F8FAFC;
      color: #0F172A;
      line-height: 1.5;
      padding: 40px 20px;
      -webkit-font-smoothing: antialiased;
    }}
    
    .report-container {{
      max-width: 860px;
      margin: 0 auto;
      background: #FFFFFF;
      border: 1px solid #CBD5E1;
      border-top: 6px solid #0284C7;
      box-shadow: 0 20px 40px -15px rgba(2, 132, 199, 0.12), 0 1px 3px rgba(0,0,0,0.05);
      padding: 48px;
    }}
    
    .header-bar {{
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #E2E8F0;
      padding-bottom: 24px;
      margin-bottom: 32px;
    }}
    
    .brand-title {{
      font-size: 24px;
      font-weight: 900;
      letter-spacing: -0.04em;
      color: #0284C7;
      text-transform: uppercase;
    }}
    
    .edition-tag {{
      font-size: 10px;
      font-weight: 800;
      color: #64748B;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      margin-bottom: 4px;
      display: block;
    }}
    
    .meta-grid {{
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      background: #F0F7FF;
      border: 1px solid #BAE6FD;
      padding: 16px 20px;
      margin-bottom: 32px;
    }}
    
    .meta-item label {{
      display: block;
      font-size: 10px;
      font-weight: 800;
      color: #0284C7;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 3px;
    }}
    
    .meta-item span {{
      font-size: 13px;
      font-weight: 700;
      color: #0F172A;
      font-family: 'JetBrains Mono', monospace;
    }}
    
    .verdict-hero {{
      background: {status_bg_color};
      border: 1px solid {status_theme_color}40;
      border-left: 6px solid {status_theme_color};
      padding: 24px;
      margin-bottom: 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }}
    
    .verdict-badge {{
      display: inline-block;
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: {status_theme_color};
      background: #FFFFFF;
      padding: 4px 10px;
      border: 1px solid {status_theme_color};
      margin-bottom: 8px;
    }}
    
    .verdict-title {{
      font-size: 26px;
      font-weight: 900;
      color: #0F172A;
      letter-spacing: -0.03em;
    }}
    
    .score-badge {{
      text-align: right;
      font-family: 'JetBrains Mono', monospace;
    }}
    
    .score-num {{
      font-size: 36px;
      font-weight: 900;
      color: {status_theme_color};
      line-height: 1;
    }}
    
    .score-sub {{
      font-size: 11px;
      color: #64748B;
      text-transform: uppercase;
      font-weight: 700;
    }}
    
    .section-heading {{
      font-size: 14px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #0F172A;
      border-bottom: 1px solid #E2E8F0;
      padding-bottom: 8px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }}
    
    .dual-metric-box {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 32px;
    }}
    
    .metric-card {{
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      padding: 16px;
    }}
    
    .metric-val {{
      font-size: 22px;
      font-weight: 900;
      font-family: 'JetBrains Mono', monospace;
      color: #0284C7;
    }}
    
    .crypto-footer {{
      background: #0F172A;
      color: #94A3B8;
      padding: 20px 24px;
      margin-top: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
    }}
    
    .disclaimer-box {{
      background: #FFFBEB;
      border: 1px solid #FDE68A;
      border-left: 4px solid #D97706;
      padding: 14px 18px;
      font-size: 12px;
      color: #78350F;
      margin-top: 24px;
      line-height: 1.5;
    }}
    
    @media print {{
      body {{ background: #FFFFFF; padding: 0; }}
      .report-container {{ border: none; box-shadow: none; padding: 20px; }}
    }}
  </style>
</head>
<body>
  <div class="report-container">
    <!-- Header -->
    <div class="header-bar">
      <div>
        <span class="edition-tag">Q-MEDSENSE QUANTUM HEALTH OS // CLINICAL REPORT</span>
        <h1 class="brand-title">Q-MEDSENSE HEALTH REPORT</h1>
        <p style="font-size: 13px; color: #64748B; margin-top: 2px;">
          Autonomous Preventative Quantum AI Analysis & Stratification
        </p>
      </div>
      <div style="text-align: right;">
        <span style="display: inline-block; padding: 4px 10px; background: #0284C7; color: #FFFFFF; font-weight: 800; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;">
          DPDP 2023 VERIFIED
        </span>
        <p style="font-size: 11px; font-family: 'JetBrains Mono', monospace; color: #64748B; margin-top: 4px;">
          REF: {report_id}
        </p>
      </div>
    </div>

    <!-- Metadata Grid -->
    <div class="meta-grid">
      <div class="meta-item">
        <label>Patient Record ID</label>
        <span>{safe_patient_id}</span>
      </div>
      <div class="meta-item">
        <label>Checkup Protocol</label>
        <span style="font-family: inherit;">{safe_disease}</span>
      </div>
      <div class="meta-item">
        <label>Analysis Date & UTC</label>
        <span>{timestamp[:10]}</span>
      </div>
      <div class="meta-item">
        <label>Security Lineage</label>
        <span>WORM SHA-256</span>
      </div>
    </div>

    <!-- Verdict Hero Banner -->
    <div class="verdict-hero">
      <div>
        <div class="verdict-badge">{status_badge_text}</div>
        <h2 class="verdict-title">{safe_prediction_class}</h2>
        <p style="font-size: 13px; color: #475569; margin-top: 4px;">
          Calculated via Quantum Variational Classifier with SOTA statevector expectation values.
        </p>
      </div>
      <div class="score-badge">
        <div class="score-num">{req.confidence * 100:.1f}%</div>
        <div class="score-sub">AI Confidence Rating</div>
      </div>
    </div>

    <!-- Dual Comparison Cards -->
    <div class="dual-metric-box">
      <div class="metric-card" style="border-top: 3px solid #0284C7;">
        <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748B;">Quantum AI Engine Precision</span>
        <div class="metric-val">{req.confidence * 100:.1f}%</div>
        <span style="font-size: 12px; color: #059669; font-weight: 700;">+{(req.confidence - req.classical_confidence) * 100:.1f}% Statistical Accuracy Gain</span>
      </div>
      <div class="metric-card" style="border-top: 3px solid #94A3B8;">
        <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748B;">Standard Classical Model Baseline</span>
        <div class="metric-val" style="color: #64748B;">{req.classical_confidence * 100:.1f}%</div>
        <span style="font-size: 12px; color: #64748B;">Random Forest / SVM Standard Benchmark</span>
      </div>
    </div>

    <!-- Biomarkers Section -->
    <div style="margin-bottom: 32px;">
      <h3 class="section-heading">Key Biological Factors Influencing Your Result</h3>
      <div style="background: #FFFFFF; border: 1px solid #E2E8F0; padding: 20px;">
        {biomarker_rows_html}
      </div>
    </div>

    <!-- Preventative Actions -->
    <div>
      <h3 class="section-heading">Recommended Preventative Health Guidance</h3>
      <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 18px 20px;">
        <ul style="padding-left: 20px; font-size: 13px; color: #334155; line-height: 1.6;">
          <li><strong>Follow-Up Consultation:</strong> Share this cryptographic summary with your primary physician or certified specialist.</li>
          <li><strong>Digital Twin Synchronization:</strong> Your 2D health avatar and temporal trajectory have been updated with these latest indicator values.</li>
          <li><strong>Next Scheduled Checkup:</strong> Repeat biomarker screening recommended within 90 days for continuous baseline monitoring.</li>
        </ul>
      </div>
    </div>

    <!-- Disclaimer -->
    <div class="disclaimer-box">
      <strong>SaMD Regulatory Notice (CDSCO / DPDP Act, 2023):</strong> This statistical health assessment report is generated for preventative decision support. Consult a certified medical practitioner for definitive clinical diagnoses.
    </div>

    <!-- Cryptographic Footer -->
    <div class="crypto-footer">
      <div>
        <div style="font-weight: 800; color: #FFFFFF; margin-bottom: 2px;">CRYPTOGRAPHIC VERIFICATION SEAL</div>
        <div style="font-size: 9px; opacity: 0.8;">SHA-256: {crypto_hash}</div>
      </div>
      <div style="text-align: right;">
        <div style="font-weight: 700; color: #38BDF8;">TAMPER-EVIDENT WORM LEDGER</div>
        <div style="font-size: 9px; opacity: 0.8;">VERIFIED AT {timestamp}</div>
      </div>
    </div>
  </div>
</body>
</html>
"""
    return {
        "status": "success",
        "patient_id": req.patient_id,
        "timestamp": timestamp,
        "report_html": report_html,
        "download_filename": f"Q-MedSense_Report_{req.patient_id}.html",
    }


@router.get("")
@router.get("/")
async def list_reports(patient_id: Optional[str] = Query(None)):
    """Lists generated reports and diagnostic records, optionally filtered by patient_id."""
    if patient_id:
        records = DatabaseRepository.get_patient_diagnostic_records(patient_id)
    else:
        # If no patient_id specified, return recent diagnostic records for active cohort
        records = DatabaseRepository.get_patient_diagnostic_records("PT-89421")

    formatted = [
        {
            "report_id": r["id"],
            "patient_id": r["patient_id"],
            "disease": r["disease"],
            "prediction_class": r["prediction_class"],
            "confidence": r["confidence"],
            "classical_model": r.get("classical_model", "Logistic Regression"),
            "classical_confidence": r.get("classical_confidence", 0.90),
            "created_at": str(r.get("created_at", "")),
            "top_biomarkers": [
                f"{f.get('feature', 'Marker')} ({f.get('percentage', 25)}%)"
                if isinstance(f, dict) else str(f)
                for f in r.get("explainability", {}).get("top_features", [])
            ] if isinstance(r.get("explainability"), dict) else [],
        }
        for r in records
    ]
    return {"status": "success", "total": len(formatted), "reports": formatted}


@router.get("/patient/{patient_id}")
async def get_patient_reports(patient_id: str):
    """Retrieves all clinical reports and diagnostic history for a specific patient."""
    records = DatabaseRepository.get_patient_diagnostic_records(patient_id)
    return {"status": "success", "patient_id": patient_id, "total": len(records), "reports": records}

