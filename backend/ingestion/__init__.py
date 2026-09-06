"""Backend Ingestion Module bridging to HL7 FHIR and Genomic VCF parsers."""
from backend.app.features.ingestion.parser import parse_fhir_bundle, parse_vcf_genomic_variants

__all__ = ["parse_fhir_bundle", "parse_vcf_genomic_variants"]
