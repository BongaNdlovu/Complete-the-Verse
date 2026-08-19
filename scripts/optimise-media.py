"""
Asset optimization pipeline for Complete the Verse.
Resizes and compresses images to production dimensions:
- Artifacts: 512x512 max (saves ~14MB)
- Character Portraits: 512x512 max (saves ~2MB)
- Character Tokens: 128x128 max (saves ~3MB)
- Judge burst sheets: Optimized PNG
"""
import os
import sys
from PIL import Image

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ASSETS_DIR = os.path.join(BASE_DIR, "assets")

def optimize_image(filepath, max_size, quality=85):
    try:
        with Image.open(filepath) as img:
            orig_size = os.path.getsize(filepath)
            orig_dim = img.size
            
            # Check if resize is needed
            if orig_dim[0] > max_size[0] or orig_dim[1] > max_size[1]:
                img.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Save optimized
            if filepath.lower().endswith(".png"):
                img.save(filepath, format="PNG", optimize=True)
            elif filepath.lower().endswith((".jpg", ".jpeg")):
                img.save(filepath, format="JPEG", quality=quality, optimize=True)
            
            new_size = os.path.getsize(filepath)
            ratio = (1 - new_size / orig_size) * 100 if orig_size > 0 else 0
            print(f"Optimized: {os.path.relpath(filepath, BASE_DIR)}: {orig_dim} -> {img.size}, {orig_size//1024}KB -> {new_size//1024}KB (-{ratio:.1f}%)")
    except Exception as e:
        print(f"Error processing {filepath}: {e}", file=sys.stderr)

def main():
    print("--- Starting Asset Optimization ---")
    
    # 1. Artifacts -> 512x512
    artifacts_dir = os.path.join(ASSETS_DIR, "artifacts")
    print(f"\nProcessing Artifacts in {artifacts_dir}...")
    if os.path.exists(artifacts_dir):
        for f in os.listdir(artifacts_dir):
            if f.lower().endswith(".png"):
                optimize_image(os.path.join(artifacts_dir, f), (512, 512))
    
    # 2. Characters -> Portraits (512x512) and Tokens (128x128)
    chars_dir = os.path.join(ASSETS_DIR, "characters")
    print(f"\nProcessing Characters in {chars_dir}...")
    if os.path.exists(chars_dir):
        for root, _, files in os.walk(chars_dir):
            for f in files:
                p = os.path.join(root, f)
                if f.lower() == "portrait.png":
                    optimize_image(p, (512, 512))
                elif f.lower() == "token.png":
                    optimize_image(p, (128, 128))
    
    # 3. Judge Sheets -> Optimize PNG
    judge_dir = os.path.join(ASSETS_DIR, "judge")
    print(f"\nProcessing Judge sheets in {judge_dir}...")
    if os.path.exists(judge_dir):
        for f in ["up.png", "down.png"]:
            p = os.path.join(judge_dir, f)
            if os.path.exists(p):
                try:
                    with Image.open(p) as img:
                        orig_size = os.path.getsize(p)
                        img.save(p, format="PNG", optimize=True)
                        new_size = os.path.getsize(p)
                        print(f"Optimized {f}: {orig_size//1024}KB -> {new_size//1024}KB")
                except Exception as e:
                    print(f"Error optimizing {p}: {e}")

    print("\n--- Asset Optimization Complete ---")

if __name__ == "__main__":
    main()
