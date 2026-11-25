import os
import io
import uuid
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
)
from app.core.config import settings


def generate_village_pdf_report(village_data: dict, priorities: list) -> str:
    """
    Generates a presentation-ready Gram Panchayat Development Plan (GPDP) PDF report.
    Returns relative URL path to the generated PDF.
    """
    reports_dir = os.path.join(settings.UPLOAD_DIR, "reports")
    os.makedirs(reports_dir, exist_ok=True)

    filename = f"GPDP_Report_{village_data.get('village_name', 'Village')}_{uuid.uuid4().hex[:8]}.pdf"
    file_path = os.path.join(reports_dir, filename)

    doc = SimpleDocTemplate(
        file_path,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Heading1"],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#1e3a8a"),  # Deep Navy Blue
        spaceAfter=6,
    )
    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontSize=11,
        textColor=colors.HexColor("#4b5563"),
        spaceAfter=15,
    )
    heading2_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontSize=14,
        leading=18,
        textColor=colors.HexColor("#0f766e"),  # Teal
        spaceBefore=12,
        spaceAfter=8,
    )
    body_style = ParagraphStyle(
        "BodyDark",
        parent=styles["Normal"],
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor("#1f2937"),
    )

    elements = []

    # 1. Header Title & Subtitle
    elements.append(Paragraph("GRAMVERSE AI — RURAL GOVERNANCE PLATFORM", subtitle_style))
    elements.append(Paragraph(f"Gram Panchayat Development Plan (GPDP) — {village_data.get('village_name', 'Village')}", title_style))
    elements.append(Paragraph(
        f"Block: <b>{village_data.get('block', 'N/A')}</b> | District: <b>{village_data.get('district', 'N/A')}</b> | State: <b>{village_data.get('state', 'Madhya Pradesh')}</b> | Generated: {datetime.now().strftime('%d %B %Y')}",
        subtitle_style
    ))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#1e3a8a"), spaceAfter=15))

    # 2. Demographic & Baseline Profile Table
    elements.append(Paragraph("1. Village Demographic & Civic Coverage Baseline", heading2_style))

    cov = village_data.get("coverage", {})
    demo_data = [
        ["Total Population", str(village_data.get("population", 0)), "Households Surveyed", str(village_data.get("households_surveyed", 0))],
        ["Literacy Rate", f"{village_data.get('literacy_rate', 0)}%", "Pucca House Coverage", f"{cov.get('pucca_house_pct', 0)}%"],
        ["Piped Tap Water (JJM)", f"{cov.get('water_tap_pct', 0)}%", "Sanitary Toilets (SBM)", f"{cov.get('toilet_pct', 0)}%"],
        ["Grid Electricity Coverage", f"{cov.get('electricity_pct', 0)}%", "Total Infrastructure Assets", str(village_data.get("total_infrastructure_assets", 0))]
    ]

    t_demo = Table(demo_data, colWidths=[140, 120, 140, 120])
    t_demo.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#1e293b")),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ("PADDING", (0, 0), (-1, -1), 6),
    ]))
    elements.append(t_demo)
    elements.append(Spacer(1, 15))

    # 3. Prioritized Interventions Table
    elements.append(Paragraph("2. AI-Prioritized Development Works (Backed by Data & Formula)", heading2_style))
    elements.append(Paragraph("<i>Ranking Formula: Priority Score = (Severity [1-5] × Population Affected) ÷ Estimated Cost in Lakhs</i>", subtitle_style))

    p_data = [["Rank", "Civic Work Proposal", "Category", "Severity", "Affected", "Cost (₹)", "Score", "Matching Scheme"]]
    for p in priorities[:5]:  # Top 5 priorities
        p_data.append([
            f"#{p.get('rank', 1)}",
            Paragraph(p.get("issue", "Intervention"), body_style),
            p.get("category", "General"),
            f"{p.get('severity', 3)}/5",
            str(p.get("population_affected", 0)),
            f"₹{p.get('estimated_cost_lakhs', 1.0)}L",
            f"{p.get('priority_score', 0):.1f}",
            Paragraph(p.get("matching_scheme", "State Plan"), body_style),
        ])

    t_priorities = Table(p_data, colWidths=[35, 145, 60, 45, 50, 50, 45, 90])
    t_priorities.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e3a8a")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8.5),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ("ALIGN", (0, 0), (0, -1), "CENTER"),
        ("ALIGN", (3, 0), (6, -1), "CENTER"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f1f5f9")]),
        ("PADDING", (0, 0), (-1, -1), 5),
    ]))
    elements.append(t_priorities)
    elements.append(Spacer(1, 15))

    # 4. Grievance Redressal Summary
    elements.append(Paragraph("3. Citizen Grievance Redressal Snapshot", heading2_style))
    cmpl = village_data.get("complaints", {})
    comp_text = (
        f"Total Grievances Registered: <b>{cmpl.get('total', 0)}</b> | "
        f"Open / Triaged: <b>{cmpl.get('open', 0)}</b> | "
        f"Successfully Resolved: <b>{cmpl.get('resolved', 0)}</b>"
    )
    elements.append(Paragraph(comp_text, body_style))
    elements.append(Spacer(1, 20))

    # Footer note
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#94a3b8"), spaceAfter=8))
    elements.append(Paragraph("Generated by GramVerse AI Intelligent Rural Governance Engine • Verifiable via PostGIS spatial logs.", subtitle_style))

    doc.build(elements)
    return f"/uploads/reports/{filename}"
