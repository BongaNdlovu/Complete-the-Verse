import os
import sys
from PIL import Image
import numpy as np
from collections import deque

BRAIN_DIR = r"C:\Users\fanel\.gemini\antigravity\brain\bae03995-cb7b-4b39-b465-3126af92ec6e"
OUT_DIR = r"C:\Users\fanel\Downloads\Complete the verse\assets\rival"
os.makedirs(OUT_DIR, exist_ok=True)

sources = {
    "shadow-pursuer.png": os.path.join(BRAIN_DIR, "shadow_pursuer_white_1787248048639.jpg"),
    "previous-pilgrim.png": os.path.join(BRAIN_DIR, "previous_pilgrim_1787247998863.jpg"),
    "rival-mask.png": os.path.join(BRAIN_DIR, "rival_mask_1787248079541.jpg"),
}

def remove_white_background(img, min_dist=12.0, max_dist=45.0):
    img = img.convert("RGBA")
    arr = np.array(img, dtype=np.float32)
    
    r, g, b, a = arr[:,:,0], arr[:,:,1], arr[:,:,2], arr[:,:,3]
    
    # Distance from pure white (255, 255, 255)
    dist = np.sqrt((255.0 - r)**2 + (255.0 - g)**2 + (255.0 - b)**2)
    
    # Alpha curve based on distance from white
    alpha = np.clip((dist - min_dist) / (max_dist - min_dist), 0.0, 1.0) * 255.0
    
    # Flood-fill BFS from borders to ensure interior whites/highlights remain intact
    h, w = dist.shape
    visited = np.zeros((h, w), dtype=bool)
    q = deque()
    
    # Seed top, bottom, left, right edges
    for x in range(w):
        if dist[0, x] < 60.0:
            visited[0, x] = True
            q.append((0, x))
        if dist[h-1, x] < 60.0:
            visited[h-1, x] = True
            q.append((h-1, x))
    for y in range(h):
        if dist[y, 0] < 60.0:
            visited[y, 0] = True
            q.append((y, 0))
        if dist[y, w-1] < 60.0:
            visited[y, w-1] = True
            q.append((y, w-1))
            
    while q:
        cy, cx = q.popleft()
        for dy, dx in [(-1,0),(1,0),(0,-1),(0,1)]:
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx]:
                if dist[ny, nx] < max_dist:
                    visited[ny, nx] = True
                    q.append((ny, nx))
                    
    final_alpha = np.where(visited, alpha, 255.0)
    
    # Color decontamination (remove white fringe from semi-transparent edge pixels)
    alpha_norm = np.clip(final_alpha / 255.0, 0.001, 1.0)[:, :, np.newaxis]
    rgb_clean = np.clip((arr[:, :, :3] - (1.0 - alpha_norm) * 255.0) / alpha_norm, 0, 255)
    
    out_arr = np.dstack((rgb_clean.astype(np.uint8), final_alpha.astype(np.uint8)))
    return Image.fromarray(out_arr, "RGBA")

def process_image(in_path, out_path, target_size=(512, 512), padding=24):
    print(f"Processing {in_path} -> {out_path}...")
    img = Image.open(in_path)
    cutout = remove_white_background(img)
    
    # Crop to content bounding box
    bbox = cutout.getbbox()
    if bbox:
        cropped = cutout.crop(bbox)
    else:
        cropped = cutout
        
    # Scale to fit inside (target_size - 2*padding) preserving aspect ratio
    max_w = target_size[0] - (padding * 2)
    max_h = target_size[1] - (padding * 2)
    
    w, h = cropped.size
    ratio = min(max_w / w, max_h / h)
    new_size = (int(w * ratio), int(h * ratio))
    
    resized = cropped.resize(new_size, Image.Resampling.LANCZOS)
    
    # Paste onto 512x512 transparent canvas centered
    final_canvas = Image.new("RGBA", target_size, (0, 0, 0, 0))
    paste_x = (target_size[0] - new_size[0]) // 2
    paste_y = (target_size[1] - new_size[1]) // 2
    final_canvas.paste(resized, (paste_x, paste_y), resized)
    
    # Save optimized PNG (512x512, RGBA)
    final_canvas.save(out_path, format="PNG", optimize=True)
    
    size_kb = os.path.getsize(out_path) / 1024
    print(f"  -> Saved {out_path}: {final_canvas.size} RGBA, {size_kb:.1f} KB")

for name, src in sources.items():
    dest = os.path.join(OUT_DIR, name)
    process_image(src, dest)
