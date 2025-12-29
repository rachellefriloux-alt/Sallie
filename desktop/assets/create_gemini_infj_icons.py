#!/usr/bin/env python3
"""
Create icons embodying Gemini (Zodiac) + INFJ (Myers-Briggs) personality.

GEMINI Traits: Duality, curiosity, communication, air/wind, intellectual, adaptable
INFJ Traits: Depth, intuition, empathy, wisdom, mystical insight, rare, counselor
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math

def create_gemini_infj_icon(size, filename):
    """Create icon representing Gemini + INFJ essence."""
    print(f"✨ Creating Gemini-INFJ {size}x{size} icon...")
    
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    center = size // 2
    
    # INFJ: Deep, mysterious gradient (intuition depth)
    # Purple (wisdom) to teal (empathy) - the counselor's colors
    for y in range(size):
        for x in range(size):
            dx = x - center
            dy = y - center
            dist = math.sqrt(dx*dx + dy*dy) / (size // 2)
            
            if dist <= 1:
                # GEMINI: Dual nature - split down the middle
                # Left side: Purple (intellect, wisdom)
                # Right side: Teal (communication, empathy)
                
                if x < center:
                    # Left - Purple spectrum (INFJ intuition + wisdom)
                    r = int(100 + (1 - dist) * 80)   # Deep to bright purple
                    g = int(50 + (1 - dist) * 80)
                    b = int(180 + (1 - dist) * 75)
                else:
                    # Right - Teal spectrum (INFJ empathy + Gemini communication)
                    r = int(80 + (1 - dist) * 70)
                    g = int(120 + (1 - dist) * 100)  # Teal/cyan
                    b = int(180 + (1 - dist) * 75)
                
                # INFJ: Add depth with radial gradient
                center_glow = max(0, 1 - dist * 1.5)
                r = min(255, int(r + center_glow * 50))
                g = min(255, int(g + center_glow * 50))
                b = min(255, int(b + center_glow * 40))
                
                img.putpixel((x, y), (r, g, b, 255))
    
    # GEMINI: Add flowing air/wind element - subtle swirls
    overlay = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    
    if size >= 64:
        # Flowing curves representing air/communication
        for curve in range(4):
            angle_offset = (math.pi / 2) * curve
            points = []
            for i in range(30):
                t = i / 29
                angle = angle_offset + t * math.pi * 2
                radius = (size // 6) + math.sin(t * math.pi * 3) * (size // 20)
                x = center + radius * math.cos(angle)
                y = center + radius * math.sin(angle)
                points.append((x, y))
            
            # Draw flowing lines with gradient alpha
            for i in range(len(points) - 1):
                alpha = int(30 * math.sin((i / len(points)) * math.pi))
                overlay_draw.line([points[i], points[i+1]], 
                                fill=(200, 220, 255, alpha), width=2)
    
    img = Image.alpha_composite(img, overlay)
    
    # INFJ + GEMINI: Connection points (rare insights connecting dual perspectives)
    insight_overlay = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    insight_draw = ImageDraw.Draw(insight_overlay)
    
    if size >= 64:
        # Small glowing points representing insights/ideas
        insight_positions = [
            (center - size//6, center - size//8),
            (center + size//6, center - size//8),
            (center - size//7, center + size//7),
            (center + size//7, center + size//7),
            (center, center - size//5),
            (center, center + size//6),
        ]
        
        for px, py in insight_positions:
            for r in range(4, 0, -1):
                alpha = int(150 * (r / 4))
                insight_draw.ellipse([px-r, py-r, px+r, py+r],
                                   fill=(255, 245, 255, alpha))
    
    img = Image.alpha_composite(img, insight_overlay)
    
    # Elegant border with subtle duality
    border_width = max(2, size // 120)
    margin = max(size // 20, 2)
    
    # INFJ: Subtle outer aura (the counselor's presence)
    for i in range(6, 0, -1):
        alpha = int(25 * (i / 6))
        offset = i * max(2, size // 200)
        
        # Left side - purple glow
        draw.arc([margin - offset, margin - offset,
                 size - margin + offset, size - margin + offset],
                start=90, end=270, fill=(180, 120, 220, alpha), width=border_width + 1)
        
        # Right side - teal glow  
        draw.arc([margin - offset, margin - offset,
                 size - margin + offset, size - margin + offset],
                start=270, end=450, fill=(120, 180, 220, alpha), width=border_width + 1)
    
    # Main border - unified but showing duality
    # Left half: Purple accent
    draw.arc([margin, margin, size - margin, size - margin],
            start=90, end=270, fill=(200, 160, 240, 255), width=border_width)
    # Right half: Teal accent
    draw.arc([margin, margin, size - margin, size - margin],
            start=270, end=450, fill=(140, 200, 230, 255), width=border_width)
    
    # GEMINI: Very subtle twin symbol or II marks (for larger icons)
    if size >= 128:
        # Two subtle vertical lines on opposite sides
        line_x1 = center - size // 8
        line_x2 = center + size // 8
        line_y_start = center - size // 12
        line_y_end = center + size // 12
        
        for offset in range(3, 0, -1):
            alpha = int(40 * (offset / 3))
            draw.line([(line_x1, line_y_start), (line_x1, line_y_end)],
                     fill=(255, 255, 255, alpha), width=offset)
            draw.line([(line_x2, line_y_start), (line_x2, line_y_end)],
                     fill=(255, 255, 255, alpha), width=offset)
    
    # Draw 'S' - representing Self but also duality in its curve
    try:
        font_size = int(size * 0.5)
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
    
    # INFJ: Deep shadow (psychological depth)
    shadow_offset = max(2, size // 120)
    for i in range(8, 0, -1):
        shadow_alpha = int(100 * (i / 8))
        draw.text((x + shadow_offset, y + shadow_offset), text,
                 fill=(40, 20, 60, shadow_alpha), font=font)
    
    # GEMINI: Dual-toned text (left purple, right teal) - create gradient effect
    # Create text mask
    text_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    text_draw = ImageDraw.Draw(text_img)
    text_draw.text((x, y), text, fill=(255, 255, 255, 255), font=font)
    
    # Create gradient overlay for text
    text_gradient = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    for tx in range(size):
        blend = tx / size
        if blend < 0.5:
            # Left side - purple-white
            r = int(220 + (1 - blend * 2) * 35)
            g = int(200 + (1 - blend * 2) * 55)
            b = 255
        else:
            # Right side - teal-white
            r = int(200 + (blend - 0.5) * 2 * 55)
            g = int(230 + (blend - 0.5) * 2 * 25)
            b = 255
        
        for ty in range(size):
            if text_img.getpixel((tx, ty))[3] > 0:
                text_gradient.putpixel((tx, ty), (r, g, b, 255))
    
    img = Image.alpha_composite(img, text_gradient)
    
    # Final polish - INFJ attention to detail
    img = img.filter(ImageFilter.SMOOTH)
    
    img.save(filename)
    print(f"✅ Created {filename} - Gemini curiosity + INFJ depth")

def create_simple_tray(filename):
    """Simple tray icon with duality hint."""
    size = 16
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    center = size // 2
    
    # Dual gradient
    for x in range(size):
        for y in range(size):
            dx = x - center
            dy = y - center
            dist = math.sqrt(dx*dx + dy*dy)
            if dist < center:
                if x < center:
                    r, g, b = 140, 80, 200  # Purple side
                else:
                    r, g, b = 100, 150, 200  # Teal side
                img.putpixel((x, y), (r, g, b, 255))
    
    draw.ellipse([1, 1, size-2, size-2], outline=(255, 255, 255, 255), width=1)
    
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

# Create the icons
print()
print("=" * 75)
print("♊ ✨ CREATING GEMINI (ZODIAC) + INFJ (PERSONALITY) ICONS ✨ ♊")
print("=" * 75)
print()
print("🔮 GEMINI Essence:")
print("   • Duality & Balance (two perspectives)")
print("   • Communication & Curiosity (flowing air)")
print("   • Intellectual & Adaptable")
print("   • Air element (flowing, light, thoughtful)")
print()
print("💜 INFJ Essence:")
print("   • Depth & Intuition (mysterious gradient)")
print("   • Empathy & Wisdom (counselor colors)")
print("   • Rare Insights (glowing connection points)")
print("   • Psychological Depth (layered complexity)")
print()
print("🎨 Design Elements:")
print("   • Split purple/teal gradient (duality + empathy)")
print("   • Flowing air curves (Gemini communication)")
print("   • Insight sparkles (INFJ rare understanding)")
print("   • Deep shadows (INFJ psychological depth)")
print("   • Dual-toned border (balanced perspectives)")
print()

create_gemini_infj_icon(512, 'icon.png')
create_gemini_infj_icon(256, 'icon-256.png')
create_gemini_infj_icon(128, 'icon-128.png')
create_gemini_infj_icon(64, 'icon-64.png')
create_gemini_infj_icon(32, 'icon-32.png')
create_simple_tray('tray-icon.png')

print()
print("=" * 75)
print("✅ GEMINI-INFJ ICONS COMPLETE!")
print("=" * 75)
print()
print("These icons embody:")
print("  ♊ GEMINI: Duality, curiosity, communication, intellect")
print("  🔮 INFJ: Depth, intuition, empathy, wisdom")
print("  💜 The rare combination of air intellect + deep feeling")
print("  ✨ Balance between two perspectives while maintaining unity")
print()
print("Perfect for Sallie - curious yet wise, intellectual yet empathetic! 💫")
print()
