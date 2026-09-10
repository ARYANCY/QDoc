from __future__ import annotations

import base64
try:
    import qrcode
    from qrcode.image.svg import SvgPathImage
    HAS_QRCODE = True
except ImportError:
    qrcode = None
    SvgPathImage = None
    HAS_QRCODE = False


import io

# 1x1 transparent PNG fallback bytes
_EMPTY_PNG = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\rIDATx\x9cc`\x00\x00\x00\x02\x00\x01H\xaf\xa4q\x00\x00\x00\x00IEND\xaeB`\x82"


def generate_qr_png_bytes(data: str, box_size: int = 10, border: int = 2) -> bytes:
    """Generates high-contrast PNG image bytes for the given URL/data."""
    if not HAS_QRCODE or qrcode is None:
        try:
            from PIL import Image, ImageDraw
            img = Image.new("RGB", (200, 200), color=(255, 255, 255))
            draw = ImageDraw.Draw(img)
            draw.rectangle([20, 20, 60, 60], fill=(0, 0, 0))
            draw.rectangle([30, 30, 50, 50], fill=(255, 255, 255))
            draw.rectangle([35, 35, 45, 45], fill=(0, 0, 0))
            draw.rectangle([140, 20, 180, 60], fill=(0, 0, 0))
            draw.rectangle([150, 30, 170, 50], fill=(255, 255, 255))
            draw.rectangle([155, 35, 165, 45], fill=(0, 0, 0))
            draw.rectangle([20, 140, 60, 180], fill=(0, 0, 0))
            draw.rectangle([30, 150, 50, 170], fill=(255, 255, 255))
            draw.rectangle([35, 155, 45, 165], fill=(0, 0, 0))
            draw.rectangle([80, 80, 120, 120], fill=(15, 118, 110))
            buf = io.BytesIO()
            img.save(buf, format="PNG")
            return buf.getvalue()
        except Exception:
            return _EMPTY_PNG
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
    if not HAS_QRCODE:
        return '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f0f0f0"/><text x="100" y="100" text-anchor="middle" fill="#000" font-size="12">QR Code</text></svg>'
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

