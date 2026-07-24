import json
import shutil
from pathlib import Path

from pypdf import PdfReader
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "src" / "data" / "portfolio.json"
OUTPUT_DIR = ROOT / "output" / "pdf"
OUTPUT_PATH = OUTPUT_DIR / "Vipin-Neekamparambath-Resume.pdf"
PUBLIC_PATH = ROOT / "site-public" / "Vipin-Neekamparambath-Resume.pdf"

BLUE = colors.HexColor("#236fc2")
INK = colors.HexColor("#172033")
MUTED = colors.HexColor("#4c5870")
PALE = colors.HexColor("#eef5fc")
LINE = colors.HexColor("#d7e2ef")

with DATA_PATH.open(encoding="utf-8") as handle:
    portfolio = json.load(handle)

styles = getSampleStyleSheet()
styles.add(
    ParagraphStyle(
        name="ResumeName",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=23,
        leading=26,
        textColor=BLUE,
        spaceAfter=2,
    )
)
styles.add(
    ParagraphStyle(
        name="ResumeHeadline",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=10.5,
        leading=13,
        textColor=INK,
        spaceAfter=5,
    )
)
styles.add(
    ParagraphStyle(
        name="Contact",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.2,
        leading=10,
        textColor=MUTED,
        spaceAfter=9,
    )
)
styles.add(
    ParagraphStyle(
        name="Section",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=11.5,
        leading=14,
        textColor=BLUE,
        spaceBefore=5,
        spaceAfter=5,
        keepWithNext=True,
    )
)
styles.add(
    ParagraphStyle(
        name="BodySmall",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=8.3,
        leading=10.6,
        textColor=INK,
        spaceAfter=3,
    )
)
styles.add(
    ParagraphStyle(
        name="Role",
        parent=styles["BodyText"],
        fontName="Helvetica-Bold",
        fontSize=9.2,
        leading=11,
        textColor=INK,
        keepWithNext=True,
    )
)
styles.add(
    ParagraphStyle(
        name="RoleMeta",
        parent=styles["BodyText"],
        fontName="Helvetica-Oblique",
        fontSize=8.1,
        leading=9.6,
        textColor=MUTED,
        spaceAfter=2.5,
        keepWithNext=True,
    )
)
styles.add(
    ParagraphStyle(
        name="BulletSmall",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=8.15,
        leading=10.2,
        leftIndent=10,
        firstLineIndent=-6,
        bulletIndent=3,
        textColor=INK,
        spaceAfter=1.5,
    )
)
styles.add(
    ParagraphStyle(
        name="Project",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=8.05,
        leading=9.8,
        textColor=INK,
        spaceAfter=2.4,
    )
)
styles.add(
    ParagraphStyle(
        name="MetricValue",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=14,
        leading=15,
        alignment=TA_LEFT,
        textColor=BLUE,
    )
)
styles.add(
    ParagraphStyle(
        name="MetricLabel",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=7,
        leading=8.2,
        textColor=MUTED,
    )
)
styles.add(
    ParagraphStyle(
        name="Footer",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=7.2,
        leading=8,
        alignment=TA_RIGHT,
        textColor=MUTED,
    )
)


def section_title(text):
    return [
        Paragraph(text, styles["Section"]),
        Table([[""]], colWidths=[100 * mm], rowHeights=[0.35], style=TableStyle([("BACKGROUND", (0, 0), (-1, -1), BLUE)])),
        Spacer(1, 3),
    ]


def role_block(item):
    parts = [
        Paragraph(f"{item['company']} - {item['role']}", styles["Role"]),
        Paragraph(f"{item['location']} | {item['period']}", styles["RoleMeta"]),
    ]
    for highlight in item["highlights"]:
        parts.append(Paragraph(highlight, styles["BulletSmall"], bulletText="•"))
    parts.append(
        Paragraph(
            f"<b>Outcome:</b> {item['outcome']}",
            styles["BulletSmall"],
            bulletText="•",
        )
    )
    parts.append(Spacer(1, 3.5))
    return KeepTogether(parts)


def header_footer(canvas, document):
    canvas.saveState()
    width, height = A4
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.5)
    canvas.line(document.leftMargin, 13 * mm, width - document.rightMargin, 13 * mm)
    canvas.setFont("Helvetica", 7.2)
    canvas.setFillColor(MUTED)
    canvas.drawString(document.leftMargin, 8.5 * mm, "Vipin Neekamparambath | Agentic AI Engineer")
    canvas.drawRightString(width - document.rightMargin, 8.5 * mm, f"Page {document.page}")
    canvas.restoreState()


OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
doc = SimpleDocTemplate(
    str(OUTPUT_PATH),
    pagesize=A4,
    rightMargin=16 * mm,
    leftMargin=16 * mm,
    topMargin=13 * mm,
    bottomMargin=17 * mm,
    title="Vipin Neekamparambath - Agentic AI Engineer",
    author="Vipin Neekamparambath",
    subject="Resume",
)

story = []
profile = portfolio["profile"]

story.extend(
    [
        Paragraph(profile["name"], styles["ResumeName"]),
        Paragraph(
            "Agentic AI Engineer | Senior Analyst, Accenture DACH | Engineering Digitization",
            styles["ResumeHeadline"],
        ),
        Paragraph(
            'Munich, Germany | +49 160 96815049 | '
            '<link href="mailto:nvipin63@gmail.com" color="#236fc2">nvipin63@gmail.com</link> | '
            '<link href="https://www.linkedin.com/in/vipin-n" color="#236fc2">linkedin.com/in/vipin-n</link>',
            styles["Contact"],
        ),
    ]
)

story.extend(section_title("Professional Summary"))
story.append(Paragraph(profile["about"], styles["BodySmall"]))

story.extend(section_title("Evidence at a Glance"))
metric_summary = " | ".join(
    f"<b>{metric['value']}</b> {metric['label']}" for metric in portfolio["metrics"]
)
story.extend([Paragraph(metric_summary, styles["BodySmall"]), Spacer(1, 3)])

story.extend(section_title("Professional Experience"))
for experience in portfolio["experience"]:
    story.append(role_block(experience))

story.append(PageBreak())

story.extend(section_title("Selected Agentic AI and Automation Work"))
for project in (item for item in portfolio["projects"] if item["featured"]):
    stack = " | ".join(project["stack"][:3])
    story.append(
        Paragraph(
            f"<b>{project['title']}</b> <font color='#4c5870'>| {stack}</font><br/>"
            f"{project['oneLine']} <font color='#4c5870'>Impact: {project['impact'][0]}</font>",
            styles["Project"],
        )
    )
story.append(
    Paragraph(
        'Additional case studies and evidence trails: '
        '<link href="https://cv-vipin.vercel.app" color="#236fc2">cv-vipin.vercel.app</link>',
        styles["BodySmall"],
    )
)

story.extend(section_title("Capabilities"))
for group in portfolio["skillGroups"]:
    if group["title"] == "AI-assisted development":
        continue
    skills = " | ".join(item["name"] for item in group["items"])
    story.append(Paragraph(f"<b>{group['title']}:</b> {skills}", styles["BodySmall"]))
story.append(
    Paragraph(
        "<b>Delivery and leadership:</b> Agile delivery | Project planning | Stakeholder management | "
        "Cross-functional collaboration | Technical leadership | Training delivery",
        styles["BodySmall"],
    )
)

story.extend(section_title("Education and Languages"))
education = portfolio["education"]
story.append(
    Paragraph(
        f"<b>{education['degree']}, {education['specialization']}</b> | {education['institution']} | {education['period']}<br/>"
        f"Publication: {education['publication']} | CGPA: {education['cgpa']}/10",
        styles["BodySmall"],
    )
)
story.append(Paragraph(f"<b>Languages:</b> {' | '.join(portfolio['languages'])}", styles["BodySmall"]))

doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)

page_count = len(PdfReader(str(OUTPUT_PATH)).pages)
if page_count != 2:
    raise RuntimeError(f"Expected a two-page resume, generated {page_count} pages")

shutil.copy2(OUTPUT_PATH, PUBLIC_PATH)
print(f"Wrote {OUTPUT_PATH} and synchronized {PUBLIC_PATH}")
