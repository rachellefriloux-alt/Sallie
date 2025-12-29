#!/usr/bin/env python3
"""Create ELEGANT, sophisticated icons - Apple-quality design!"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math

def create_elegant_icon(size, filename):
    """Create clean, elegant, stunning icon - simple but beautiful."""
    print(f"✨ Creating elegant {size}x{size} icon...")
    
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    center = size // 2
    
    # Elegant gradient background - smooth radial
    for radius in range(size // 2, 0, -1):
        progress = 1 - (radius / (size // 2))
        
        # Sophisticated purple gradient
        # Dark purple edges -> bright violet center
        r = int(85 + progress * 120)   # 85 -> 205
        g = int(35 + progress * 125)   # 35 -> 160  
        b = int(140 + progress * 115)  # 140 -> 255
        
        draw.ellipse([center - radius, center - radius,
                     center + radius, center + radius],
                    fill=(r, g, b, 255))
    
    # Subtle inner glow at center
    glow_size = max(size // 10, 5)
    for radius in range(glow_size, 0, -1):
        alpha = int(40 * (radius / glow_size))
        draw.ellipse([center - radius, center - radius,
                     center + radius, center + radius],
                    fill=(255, 255, 255, alpha))
    
    # Clean border - thin and elegant
    border_width = max(2, size // 100)
    margin = max(size // 20, 2)
    
    # Outer subtle glow
    for i in range(5, 0, -1):
        alpha = int(30 * (i / 5))
        offset = i * max(2, size // 200)
        draw.ellipse([margin - offset, margin - offset,
                     size - margin + offset, size - margin + offset],
                    outline=(255, 255, 255, alpha), width=border_width)
    
    # Main crisp border
    draw.ellipse([margin, margin, size - margin, size - margin],
                outline=(255, 255, 255, 220), width=border_width)
    
    # Inner border for depth
    inner_margin = margin + border_width + 2
    if inner_margin < size // 2:
        draw.ellipse([inner_margin, inner_margin, 
                     size - inner_margin, size - inner_margin],
                    outline=(255, 255, 255, 80), width=1)
    
    # Add subtle highlight arc (top-left) only for larger sizes
    if size >= 64:
        for i in range(min(8, size // 16)):
            alpha = int(20 * (1 - i / 8))
            arc_margin = margin + 10 + i * max(3, size // 100)
            if arc_margin < size // 2:
                draw.arc([arc_margin, arc_margin, 
                         size - arc_margin, size - arc_margin],
                        start=200, end=340, fill=(255, 255, 255, alpha), width=2)
    
    # Draw the 'S' - clean and bold
    try:
        font_size = int(size * 0.55)
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
        except:
            try:
                font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", font_size)
            except:
                try:
                    font = ImageFont.truetype("C:\\Windows\\Fonts\\arialbd.ttf", font_size)
                except:
                    font = ImageFont.load_default()
    except:
        font = ImageFont.load_default()
    
    text = "S"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = (size - text_width) // 2 - bbox[0]
    y = (size - text_height) // 2 - bbox[1]
    
    # Subtle shadow for depth
    shadow_offset = max(2, size // 150)
    for i in range(min(6, size // 20), 0, -1):
        shadow_alpha = int(120 * (i / 6))
        draw.text((x + shadow_offset, y + shadow_offset), text,
                 fill=(30, 10, 50, shadow_alpha), font=font)
    
    # Main text - pure white, crisp
    draw.text((x, y), text, fill=(255, 255, 255, 255), font=font)
    
    # Subtle highlight on top
    if size >= 32:
        draw.text((x - 1, y - 1), text, fill=(255, 255, 255, 60), font=font)
    
    # Apply subtle smoothing for polish
    img = img.filter(ImageFilter.SMOOTH)
    
    img.save(filename)
    print(f"✅ Created elegant {filename}")

def create_elegant_tray_icon(filename):
    """Create clean, simple tray icon."""
    size = 16
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    center = size // 2
    
    # Simple gradient circle
    for radius in range(size // 2, 0, -1):
        progress = 1 - (radius / (size // 2))
        r = int(85 + progress * 120)
        g = int(35 + progress * 125)
        b = int(140 + progress * 115)
        draw.ellipse([center - radius, center - radius,
                     center + radius, center + radius],
                    fill=(r, g, b, 255))
    
    # Border
    draw.ellipse([1, 1, size-2, size-2], outline=(255, 255, 255, 255), width=1)
    
    # Simple 'S'
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 11)
    except:
        font = ImageFont.load_default()
    
    bbox = draw.textbbox((0, 0), "S", font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (size - text_width) // 2 - bbox[0]
    y = (size - text_height) // 2 - bbox[1]
    
    draw.text((x, y), "S", fill=(255, 255, 255, 255), font=font)
    
    img.save(filename)
    print(f"✅ Created {filename}")

# Create elegant icons
print()
print("=" * 70)
print("💎 CREATING ELEGANT, SOPHISTICATED ICONS FOR SALLIE 💎")
print("=" * 70)
print()
print("Design Philosophy:")
print("  ✨ Clean and uncluttered")
print("  🎨 Beautiful gradients")
print("  💜 Sophisticated purple tones")
print("  🌟 Subtle depth and glow")
print("  ⚪ Crisp white 'S'")
print("  🎯 Apple-quality polish")
print()
print("Simple. Elegant. Stunning.")
print()

create_elegant_icon(512, 'icon.png')
create_elegant_icon(256, 'icon-256.png')
create_elegant_icon(128, 'icon-128.png')
create_elegant_icon(64, 'icon-64.png')
create_elegant_icon(32, 'icon-32.png')
create_elegant_tray_icon('tray-icon.png')

print()
print("=" * 70)
print("✅ ELEGANT ICONS COMPLETE!")
print("=" * 70)
print()
print("These icons are:")
print("  💎 ELEGANT - Not busy or chaotic")
print("  🎨 SOPHISTICATED - Professional quality")
print("  ✨ BEAUTIFUL - Stunning gradients")
print("  🌟 POLISHED - Apple-level refinement")
print("  💜 MEMORABLE - Distinctive but tasteful")
print()
print("Less is more. Elegance over chaos. 💎")
print()
