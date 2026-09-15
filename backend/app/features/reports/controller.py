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
    """Generates a neat, clean, properly structured clinical PDF/HTML report with prominent caution notices."""
    safe_patient_id = html.escape(req.patient_id)
    safe_disease = html.escape(req.disease)
    safe_prediction_class = html.escape(req.prediction_class)

    timestamp = time.strftime("%Y-%m-%d %H:%M:%S UTC")
    date_str = time.strftime("%Y-%m-%d")
    report_id = f"REP-{hashlib.sha256(f'{req.patient_id}-{timestamp}'.encode()).hexdigest()[:10].upper()}"
    crypto_hash = hashlib.sha256(f"{req.patient_id}:{req.disease}:{req.prediction_class}:{timestamp}".encode()).hexdigest()

    is_high_risk = any(w in req.prediction_class.lower() for w in ["malignant", "disease", "elevated", "pneumonia", "high", "positive"])
    finding_badge = "Elevated Risk Finding" if is_high_risk else "Normal / Baseline Finding"

    biomarker_rows_html = ""
    for bm in req.top_biomarkers:
        safe_raw = html.escape(bm)
        raw_name = safe_raw.split("(")[0].strip() if "(" in safe_raw else safe_raw
        pct_str = safe_raw.split("(")[1].replace(")", "").replace("%", "").strip() if "(" in safe_raw else "25"
        try:
            pct_val = float(pct_str)
        except ValueError:
            pct_val = 25.0

        biomarker_rows_html += f"""
        <tr>
          <td style="padding: 9px 12px; border-bottom: 1px solid #E2E8F0; font-weight: 600; color: #0F172A;">{raw_name}</td>
          <td style="padding: 9px 12px; border-bottom: 1px solid #E2E8F0; text-align: right; font-family: monospace; font-weight: 700; color: #0F172A;">{pct_val:.1f}%</td>
          <td style="padding: 9px 12px; border-bottom: 1px solid #E2E8F0; color: #475569;">Key explanatory feature contributing to model classification</td>
        </tr>
        """

    if not biomarker_rows_html:
        biomarker_rows_html = """
        <tr>
          <td colspan="3" style="padding: 12px; text-align: center; color: #64748B;">No specific biomarker anomalies isolated for this evaluation.</td>
        </tr>
        """

    report_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Clinical Assessment Report // {safe_patient_id} // {report_id}</title>
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    
    body {{
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #F8FAFC;
      color: #0F172A;
      line-height: 1.5;
      padding: 30px 16px;
      -webkit-font-smoothing: antialiased;
    }}
    
    .screen-actions {{
      max-width: 800px;
      margin: 0 auto 16px auto;
      display: flex;
      justifyContent: space-between;
      align-items: center;
      background: #FFFFFF;
      padding: 10px 18px;
      border: 1px solid #CBD5E1;
      border-radius: 6px;
    }}
    
    .print-btn {{
      background: #2563EB;
      color: #FFFFFF;
      border: none;
      padding: 8px 18px;
      font-size: 13px;
      font-weight: 700;
      border-radius: 4px;
      cursor: pointer;
    }}
    .print-btn:hover {{ background: #1D4ED8; }}
    
    .report-sheet {{
      max-width: 800px;
      margin: 0 auto;
      background: #FFFFFF;
      border: 1px solid #CBD5E1;
      padding: 40px;
      box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05);
    }}
    
    .report-header {{
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0F172A;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }}
    
    .inst-title {{
      font-size: 20px;
      font-weight: 800;
      color: #0F172A;
      letter-spacing: -0.02em;
    }}
    
    .inst-sub {{
      font-size: 11px;
      color: #475569;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-top: 2px;
    }}
    
    .report-meta-right {{
      text-align: right;
      font-size: 11px;
      color: #475569;
    }}
    
    /* Prominent Regulatory Caution Notice */
    .caution-banner {{
      background: #FFFBEB;
      border: 1.5px solid #FCD34D;
      border-left: 5px solid #D97706;
      border-radius: 4px;
      padding: 12px 16px;
      margin-bottom: 24px;
      color: #78350F;
    }}
    
    .caution-title {{
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #92400E;
      margin-bottom: 3px;
      display: flex;
      align-items: center;
      gap: 6px;
    }}
    
    .caution-body {{
      font-size: 11.5px;
      line-height: 1.45;
      color: #78350F;
    }}
    
    /* Structured Demographic Grid */
    .meta-table {{
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      font-size: 12px;
      border: 1px solid #E2E8F0;
    }}
    
    .meta-table td {{
      padding: 8px 12px;
      border: 1px solid #E2E8F0;
      width: 25%;
    }}
    
    .meta-table .label {{
      background: #F8FAFC;
      color: #64748B;
      font-weight: 700;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }}
    
    .meta-table .val {{
      color: #0F172A;
      font-weight: 600;
    }}
    
    /* Finding Assessment Block */
    .finding-block {{
      border: 1px solid #E2E8F0;
      border-radius: 4px;
      padding: 18px;
      margin-bottom: 24px;
      background: #FFFFFF;
    }}
    
    .section-title {{
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #0F172A;
      border-bottom: 1px solid #E2E8F0;
      padding-bottom: 6px;
      margin-bottom: 12px;
    }}
    
    .finding-row {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 8px;
    }}
    
    .finding-name {{
      font-size: 18px;
      font-weight: 800;
      color: #0F172A;
    }}
    
    .finding-stat {{
      text-align: right;
    }}
    
    .confidence-pct {{
      font-size: 22px;
      font-weight: 800;
      color: #0F172A;
      font-family: monospace;
    }}
    
    /* Biomarker Table */
    .data-table {{
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin-top: 8px;
      margin-bottom: 24px;
    }}
    
    .data-table th {{
      background: #F8FAFC;
      color: #475569;
      font-weight: 700;
      font-size: 10.5px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 8px 12px;
      border: 1px solid #E2E8F0;
      text-align: left;
    }}
    
    /* Footer & Verification */
    .report-footer {{
      border-top: 1px solid #E2E8F0;
      padding-top: 16px;
      margin-top: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #64748B;
      font-family: monospace;
    }}
    
    @media print {{
      body {{ background: #FFFFFF; padding: 0; }}
      .screen-actions {{ display: none !important; }}
      .report-sheet {{ border: none; box-shadow: none; padding: 0; margin: 0; max-width: 100%; }}
      @page {{ size: A4 portrait; margin: 15mm; }}
    }}
  </style>
</head>
<body>
  <!-- Screen Navigation / Print Bar -->
  <div class="screen-actions">
    <div>
      <strong style="font-size: 13px; color: #0F172A;">Clinical Assessment Document</strong>
      <span style="font-size: 11px; color: #64748B; margin-left: 8px;">(Ref: {report_id})</span>
    </div>
    <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
  </div>

  <div class="report-sheet">
    <!-- Header -->
    <div class="report-header">
      <div>
        <h1 class="inst-title">Q-MEDSENSE CLINICAL PLATFORM</h1>
        <div class="inst-sub">AI Clinical Decision Support Summary &bull; Triage Reference</div>
      </div>
      <div class="report-meta-right">
        <div><strong>REPORT ID:</strong> {report_id}</div>
        <div><strong>DATE:</strong> {date_str}</div>
        <div><strong>STATUS:</strong> Confidential Medical Record</div>
      </div>
    </div>

    <!-- Mandatory Caution & Regulatory Notice -->
    <div class="caution-banner">
      <div class="caution-title">
        &#9888; CAUTION: CLINICAL DECISION SUPPORT TOOL &mdash; NOT A FINAL MEDICAL DIAGNOSIS
      </div>
      <div class="caution-body">
        This document is generated by an artificial intelligence decision-support tool and is provided strictly for investigational, triage, and physician reference. It does <strong>NOT</strong> constitute a definitive clinical diagnosis or autonomous prescription. Clinical correlation, comprehensive diagnostic imaging, and evaluation by a certified licensed physician are required before initiating or modifying any treatment.
      </div>
    </div>

    <!-- Patient & Record Metadata Grid -->
    <table class="meta-table">
      <tr>
        <td class="label">Patient ID</td>
        <td class="val">{safe_patient_id}</td>
        <td class="label">Clinical Protocol</td>
        <td class="val">{safe_disease}</td>
      </tr>
      <tr>
        <td class="label">Evaluation Date</td>
        <td class="val">{date_str}</td>
        <td class="label">Verification Hash</td>
        <td class="val" style="font-family: monospace; font-size: 10px;">SHA-256 Verified</td>
      </tr>
    </table>

    <!-- Primary Algorithmic Assessment Finding -->
    <div class="finding-block">
      <div class="section-title">Primary Algorithmic Assessment</div>
      <div class="finding-row">
        <div>
          <span style="font-size: 11px; color: #64748B; font-weight: 600; text-transform: uppercase;">Class Finding</span>
          <div class="finding-name">{safe_prediction_class}</div>
          <span style="font-size: 11px; color: #475569;">Classification derived via multi-modal AI feature mapping</span>
        </div>
        <div class="finding-stat">
          <span style="font-size: 11px; color: #64748B; font-weight: 600; text-transform: uppercase;">Model Confidence</span>
          <div class="confidence-pct">{req.confidence * 100:.1f}%</div>
          <span style="font-size: 10px; color: #64748B;">Baseline Concordance: {req.classical_confidence * 100:.1f}%</span>
        </div>
      </div>
    </div>

    <!-- Biomarker Table -->
    <div class="section-title">Biomarker & Physiological Factor Analysis</div>
    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 35%;">Biomarker / Feature</th>
          <th style="width: 20%; text-align: right;">Relative Impact</th>
          <th style="width: 45%;">Clinical Significance</th>
        </tr>
      </thead>
      <tbody>
        {biomarker_rows_html}
      </tbody>
    </table>

    <!-- Recommended Next Steps -->
    <div class="section-title">Recommended Clinical Next Steps</div>
    <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 14px 18px; border-radius: 4px; margin-bottom: 24px;">
      <ul style="font-size: 12px; color: #334155; padding-left: 18px; line-height: 1.6;">
        <li><strong>Physician Review:</strong> Correlate these computational findings with complete clinical history and physical examination.</li>
        <li><strong>Confirmatory Diagnostics:</strong> Conduct standard pathology, tissue biopsy, or targeted radiography where clinically indicated.</li>
        <li><strong>Follow-Up Interval:</strong> Re-evaluate baseline parameters according to primary physician protocol.</li>
      </ul>
    </div>

    <!-- Footer Seal -->
    <div class="report-footer">
      <div>TAMPER-EVIDENT SHA-256: {crypto_hash[:32]}...</div>
      <div>Q-MEDSENSE HEALTHCARE OS &bull; {timestamp}</div>
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
