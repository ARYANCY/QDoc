from __future__ import annotations

import base64
import io
import qrcode
from qrcode.image.svg import SvgPathImage


def generate_qr_png_bytes(data: str, box_size: int = 10, border: int = 2) -> bytes:
    """Generates high-contrast PNG image bytes for the given URL/data."""
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=box_size,
        border=border,
    )
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def generate_qr_svg_string(data: str) -> str:
    """Generates scalable SVG vector string for crisp rendering."""
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=2,
        image_factory=SvgPathImage,
    )
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image()
    buf = io.BytesIO()
    img.save(buf)
    return buf.getvalue().decode("utf-8")


def generate_qr_base64_data_uri(data: str) -> str:
    """Generates a base64 data URI for direct HTML/JSON embedding."""
    png_bytes = generate_qr_png_bytes(data)
    b64_str = base64.b64encode(png_bytes).decode("utf-8")
    return f"data:image/png;base64,{b64_str}"

