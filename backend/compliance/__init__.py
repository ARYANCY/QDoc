"""Backend Compliance Module bridging to immutable audit trail and DPDP consent controllers."""
from backend.app.features.compliance.controller import router as compliance_router

__all__ = ["compliance_router"]
