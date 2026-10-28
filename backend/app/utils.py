import io
from typing import Dict, Any, Optional
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
)


def generate_pdf_report(
    sample_data: Dict[str, Any],
    prediction_label: str,
    confidence: Optional[float],
    model_name: str,
    disclaimer: str,
) -> bytes:
    """
    Generates a structured PDF screening report using ReportLab.
    
    Returns:
        bytes: Raw byte stream of the generated PDF document.
    """
    buffer = io.BytesIO()
    
    # Page setup
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=0.5 * inch,
        leftMargin=0.5 * inch,
        topMargin=0.5 * inch,
        bottomMargin=0.5 * inch,
    )

    styles = getSampleStyleSheet()
    
    # Custom Paragraph Styles
    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#0F172A"),
        alignment=0,
    )
    
    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#64748B"),
    )
    
    section_header_style = ParagraphStyle(
        "SectionHeader",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=16,
        textColor=colors.HexColor("#1E293B"),
        spaceAfter=6,
    )
    
    body_style = ParagraphStyle(
        "BodyDark",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#334155"),
    )
    
    disclaimer_style = ParagraphStyle(
        "DisclaimerText",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#B45309"),
    )

    story = []

    # 1. Header Section
    story.append(Paragraph("Smart Water Quality Screening Report", title_style))
    story.append(Spacer(1, 4))
    story.append(
        Paragraph("Automated Computational Assessment & Parameter Analysis", subtitle_style)
    )
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0284C7"), spaceAfter=15))

    # 2. Disclaimer Callout Box
    disclaimer_p = Paragraph(f"<b>NOTICE:</b> {disclaimer}", disclaimer_style)
    disclaimer_table = Table([[disclaimer_p]], colWidths=[7.0 * inch])
    disclaimer_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FEF3C7")),
                ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#F59E0B")),
                ("PADDING", (0, 0), (-1, -1), 10),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ]
        )
    )
    story.append(disclaimer_table)
    story.append(Spacer(1, 15))

    # 3. Model Prediction Summary Card
    is_potable = "Potable" in prediction_label and "Non-Potable" not in prediction_label
    status_bg = colors.HexColor("#DCFCE7") if is_potable else colors.HexColor("#FEE2E2")
    status_border = colors.HexColor("#16A34A") if is_potable else colors.HexColor("#DC2626")
    text_color_hex = "#15803D" if is_potable else "#B91C1C"

    confidence_str = f"{confidence * 100:.1f}%" if confidence else "N/A"

    summary_text = f"""
    <b>Status Category:</b> <font color="{text_color_hex}">{prediction_label}</font><br/>
    <b>Prediction Confidence:</b> {confidence_str}<br/>
    <b>Evaluated By Model:</b> {model_name}
    """
    
    summary_p = Paragraph(summary_text, body_style)
    summary_table = Table([[summary_p]], colWidths=[7.0 * inch])
    summary_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), status_bg),
                ("BOX", (0, 0), (-1, -1), 1.5, status_border),
                ("PADDING", (0, 0), (-1, -1), 12),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ]
        )
    )
    
    story.append(Paragraph("Assessment Summary", section_header_style))
    story.append(summary_table)
    story.append(Spacer(1, 15))

    # 4. Input Water Quality Parameters Table
    story.append(Paragraph("Evaluated Water Quality Parameters", section_header_style))

    table_data = [["Parameter Name", "Input Value", "Standard Guidance Range"]]
    
    # Pre-defined WHO/EPA reference thresholds for common parameters
    guidance_ranges = {
        "ph": "6.5 - 8.5",
        "Hardness": "< 300 mg/L",
        "Solids": "< 500 ppm (TDS)",
        "Chloramines": "< 4.0 ppm",
        "Sulfate": "< 250 mg/L",
        "Conductivity": "< 400 µS/cm",
        "Organic_carbon": "< 2.0 ppm",
        "Trihalomethanes": "< 80 µg/L",
        "Turbidity": "< 5.0 NTU",
    }

    for param, val in sample_data.items():
        ref_range = guidance_ranges.get(param, "N/A")
        val_formatted = f"{val:.2f}" if isinstance(val, (int, float)) else str(val)
        table_data.append([param, val_formatted, ref_range])

    param_table = Table(table_data, colWidths=[2.5 * inch, 2.0 * inch, 2.5 * inch])
    param_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0284C7")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 10),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 6),
                ("TOPPADDING", (0, 0), (-1, 0), 6),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#F8FAFC"), colors.white]),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
                ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
                ("FONTSIZE", (0, 1), (-1, -1), 9),
                ("PADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    
    story.append(param_table)
    story.append(Spacer(1, 20))

    # Build PDF
    doc.build(story)
    
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
