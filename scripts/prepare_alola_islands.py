"""Split the existing transparent Alola map into four independent PNGs."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "alola-islands-detailed.png"
TARGET = ROOT / "assets" / "islas"
REGIONS = {
    "melemele": (0.000, 0.000, 0.395, 0.309),
    "akala": (0.395, 0.000, 0.835, 0.519),
    "ula-ula": (0.000, 0.519, 0.563, 0.982),
    "poni": (0.563, 0.507, 1.000, 1.000),
}

def main():
    if not SOURCE.exists():
        raise FileNotFoundError(f"Missing map: {SOURCE}")
    source = Image.open(SOURCE).convert("RGBA")
    width, height = source.size
    if source.getchannel("A").getextrema()[0] == 255:
        raise ValueError("The source PNG is not transparent.")
    TARGET.mkdir(exist_ok=True, parents=True)
    for name, (left, top, right, bottom) in REGIONS.items():
        rect = tuple(round(v * length) for v, length in zip(
            (left, top, right, bottom), (width, height, width, height)
        ))
        cropped = source.crop(rect)
        bounds = cropped.getchannel("A").getbbox()
        if bounds is None:
            raise ValueError(f"No island pixels for {name}")
        cropped = cropped.crop(bounds)
        margin = max(6, round(width * 0.010))
        output = Image.new("RGBA", (cropped.width + margin * 2, cropped.height + margin * 2))
        output.paste(cropped, (margin, margin))
        path = TARGET / f"{name}.png"
        output.save(path, "PNG", optimize=True)
        print(f"Saved {path.relative_to(ROOT)}: {output.size}")

if __name__ == "__main__":
    main()
