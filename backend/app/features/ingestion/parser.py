from __future__ import annotations

import json
from typing import Any


def parse_fhir_bundle(fhir_json_str: str | bytes | dict) -> dict[str, Any]:
    """Parses HL7 FHIR Observation and Patient resource bundles per SRS FR-1 & Section 5.2.
    Extracts standardized LOINC clinical biomarkers (glucose, blood pressure, cholesterol, troponin).
    """
    if isinstance(fhir_json_str, (str, bytes)):
        bundle = json.loads(fhir_json_str)
    else:
        bundle = fhir_json_str

    extracted = {
        "patient_id": None,
        "observations": {},
        "biomarkers": {},
        "raw_entries_count": 0,
    }

    entries = bundle.get("entry", []) if isinstance(bundle, dict) else []
    extracted["raw_entries_count"] = len(entries)

    for item in entries:
        resource = item.get("resource", {})
        rtype = resource.get("resourceType")

        if rtype == "Patient" and not extracted["patient_id"]:
            extracted["patient_id"] = resource.get("id") or resource.get("identifier", [{}])[0].get("value")

        elif rtype == "Observation":
            code = resource.get("code", {}).get("coding", [{}])[0].get("code", "UNKNOWN")
            display = resource.get("code", {}).get("coding", [{}])[0].get("display", code)
            value_qty = resource.get("valueQuantity", {})
            val = value_qty.get("value")
            unit = value_qty.get("unit", "")

            # Fallback to valueCodeableConcept for qualitative observations
            if val is None and "valueCodeableConcept" in resource:
                concept_coding = resource.get("valueCodeableConcept", {}).get("coding", [{}])[0]
                val = concept_coding.get("display") or concept_coding.get("code")
                unit = "categorical"

            # Parse composite observations (e.g. BP panel with systolic & diastolic)
            components = resource.get("component", [])
            component_data = []
            for comp in components:
                c_code = comp.get("code", {}).get("coding", [{}])[0].get("code", "")
                c_display = comp.get("code", {}).get("coding", [{}])[0].get("display", c_code)
                c_val = comp.get("valueQuantity", {}).get("value")
                c_unit = comp.get("valueQuantity", {}).get("unit", "")
                if c_val is not None:
                    component_data.append({"code": c_code, "display": c_display, "value": c_val, "unit": c_unit})
                    extracted["biomarkers"][c_display.lower().replace(" ", "_")] = float(c_val)

            extracted["observations"][code] = {
                "display": display,
                "value": val,
                "unit": unit,
                "components": component_data if component_data else None,
            }
            if val is not None and isinstance(val, (int, float)):
                extracted["biomarkers"][display.lower().replace(" ", "_")] = float(val)

    return extracted


def parse_vcf_genomic_variants(vcf_text: str | bytes) -> dict[str, Any]:
    """Parses Genomic Variant Call Format (VCF) files per SRS FR-1 & Section 5.2.
    Extracts single-nucleotide polymorphisms (SNPs), insertion/deletions, quality scores, and pathogenicity flags.
    """
    if isinstance(vcf_text, bytes):
        text = vcf_text.decode("utf-8", errors="ignore")
    else:
        text = str(vcf_text)

    variants = []
    lines = text.strip().split("\n")
    for line in lines:
        if line.startswith("#"):
            continue
        parts = line.split("\t")
        if len(parts) >= 8:
            chrom, pos, var_id, ref, alt, qual, flt, info = parts[:8]
            variants.append({
                "chromosome": chrom,
                "position": pos,
                "id": var_id,
                "ref": ref,
                "alt": alt,
                "quality": qual,
                "filter": flt,
                "info": info[:100] if info else "",
            })

    return {
        "total_variants": len(variants),
        "snps": len([v for v in variants if len(v["ref"]) == 1 and len(v["alt"]) == 1]),
        "indels": len([v for v in variants if len(v["ref"]) != len(v["alt"])]),
        "variants": variants[:50],  # Sample limit
    }
