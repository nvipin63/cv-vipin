from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "site-public" / "og-vipin.png"

WIDTH, HEIGHT = 1200, 630
background = Image.new("RGB", (WIDTH, HEIGHT), "#18181b")
draw = ImageDraw.Draw(background)

for x in range(0, WIDTH, 32):
    for y in range(0, HEIGHT, 32):
        draw.ellipse((x, y, x + 2, y + 2), fill="#303036")

draw.ellipse((730, -300, 1370, 340), fill="#12373d")
draw.ellipse((870, 230, 1370, 730), fill="#30203d")

font_candidates = [
    "/System/Library/Fonts/SFNS.ttf",
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
]
bold_candidates = [
    "/System/Library/Fonts/SFNSDisplay-Bold.otf",
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
]

def load_font(candidates, size):
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size=size)
    return ImageFont.load_default()

regular = load_font(font_candidates, 30)
small = load_font(font_candidates, 22)
title = load_font(bold_candidates, 74)
monogram = load_font(bold_candidates, 120)

draw.rounded_rectangle((70, 64, 250, 174), radius=28, fill="#202024", outline="#31d7e7", width=2)
draw.text((83, 55), "VN", font=monogram, fill="#5fe5ef")
draw.text((70, 230), "VIPIN NEEKAMPARAMBATH", font=small, fill="#9ca3af")
draw.text((70, 280), "Agentic AI Engineer", font=title, fill="#f4f4f5")
draw.text((70, 375), "for complex engineering work.", font=title, fill="#c084fc")
draw.text((70, 505), "Multi-agent systems  /  Engineering digitization  /  Munich", font=regular, fill="#c5c7ce")

background.save(OUTPUT, optimize=True)
print(f"Wrote {OUTPUT}")
