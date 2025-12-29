#!/usr/bin/env python3
"""Create SPECTACULAR icons - futuristic, AI-inspired, visually stunning!"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math
import random

def create_cosmic_background(size):
    """Create a deep space / cosmic background."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    
    # Multiple gradient layers for depth
    for y in range(size):
        for x in range(size):
            # Distance from center
            dx = x - size // 2
            dy = y - size // 2
            dist = math.sqrt(dx*dx + dy*dy) / (size // 2)
            
            # Angle for spiral effect
            angle = math.atan2(dy, dx)
            
            # Create swirling color pattern
            spiral = math.sin(angle * 3 + dist * 5) * 0.5 + 0.5
            
            # Deep purple to violet to cyan gradient
            if dist < 0.3:
                # Center: bright violet-cyan
                r = int(140 + spiral * 60)
                g = int(80 + spiral * 120)
                b = int(220 + spiral * 35)
            elif dist < 0.6:
                # Middle: purple-violet
                r = int(100 + spiral * 80)
                g = int(40 + spiral * 80)
                b = int(180 + spiral * 70)
            else:
                # Outer: deep purple to dark
                fade = 1 - (dist - 0.6) / 0.4
                r = int((30 + spiral * 50) * fade)
                g = int((10 + spiral * 30) * fade)
                b = int((60 + spiral * 80) * fade)
            
            alpha = 255 if dist < 1 else 0
            
            img.putpixel((x, y), (r, g, b, alpha))
    
    return img

def add_neural_web(img, size):
    """Add complex neural network web."""
    overlay = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    center = size // 2
    
    # Create multiple interconnected node layers
    layers = [
        {'radius': size // 8, 'nodes': 6, 'color': (100, 255, 255)},
        {'radius': size // 5, 'nodes': 8, 'color': (150, 200, 255)},
        {'radius': size // 3.5, 'nodes': 12, 'color': (180, 150, 255)},
        {'radius': size // 2.8, 'nodes': 16, 'color': (200, 120, 255)},
    ]
    
    all_nodes = []
    
    for layer_idx, layer in enumerate(layers):
        layer_nodes = []
        for i in range(layer['nodes']):
            angle = (2 * math.pi * i) / layer['nodes'] + layer_idx * 0.2
            x = center + layer['radius'] * math.cos(angle)
            y = center + layer['radius'] * math.sin(angle)
            layer_nodes.append((x, y, layer['color']))
        all_nodes.extend(layer_nodes)
        
        # Draw connections within layer
        for i in range(len(layer_nodes)):
            x1, y1, color = layer_nodes[i]
            x2, y2, _ = layer_nodes[(i + 1) % len(layer_nodes)]
            
            # Glowing lines
            for width in range(3, 0, -1):
                alpha = 80 // width
                draw.line([(x1, y1), (x2, y2)], 
                         fill=(*color, alpha), width=width)
    
    # Draw cross-layer connections
    for i, (x1, y1, color1) in enumerate(all_nodes):
        for j, (x2, y2, color2) in enumerate(all_nodes):
            if i < j:
                dist = math.sqrt((x2-x1)**2 + (y2-y1)**2)
                if random.random() < 0.15 and dist < size // 2.5:
                    alpha = int(60 * (1 - dist / (size // 2.5)))
                    # Blend colors
                    r = (color1[0] + color2[0]) // 2
                    g = (color1[1] + color2[1]) // 2
                    b = (color1[2] + color2[2]) // 2
                    
                    draw.line([(x1, y1), (x2, y2)], 
                             fill=(r, g, b, alpha), width=1)
    
    # Draw glowing nodes
    for x, y, color in all_nodes:
        for radius in range(5, 0, -1):
            alpha = 200 // radius
            draw.ellipse([x-radius, y-radius, x+radius, y+radius],
                        fill=(*color, alpha))
    
    return Image.alpha_composite(img, overlay)

def add_energy_field(img, size):
    """Add flowing energy field effects."""
    overlay = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    center = size // 2
    
    # Create flowing energy bands
    for band in range(8):
        radius_base = size // 6 + band * size // 20
        
        for angle_deg in range(0, 360, 3):
            angle = math.radians(angle_deg)
            
            # Wave effect
            wave = math.sin(angle * 5 + band * 0.5) * (size // 40)
            radius = radius_base + wave
            
            x = center + radius * math.cos(angle)
            y = center + radius * math.sin(angle)
            
            # Color shifts through spectrum
            hue = (angle_deg + band * 20) % 360
            if hue < 120:
                r, g, b = 100 + hue, 100, 255
            elif hue < 240:
                r, g, b = 220 - (hue - 120), 100 + (hue - 120), 255
            else:
                r, g, b = 100, 220 - (hue - 240), 255 - (hue - 240) // 2
            
            alpha = 40 - band * 4
            point_size = 2
            
            draw.ellipse([x-point_size, y-point_size, x+point_size, y+point_size],
                        fill=(r, g, b, alpha))
    
    return Image.alpha_composite(img, overlay)

def add_data_streams(img, size):
    """Add flowing data stream effects."""
    overlay = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    center = size // 2
    
    # Flowing streams in spiral patterns
    for stream in range(12):
        angle_offset = (2 * math.pi * stream) / 12
        
        for i in range(30):
            t = i / 30
            radius = (size // 10) + t * (size // 2.5)
            angle = angle_offset + t * math.pi * 2
            
            x = center + radius * math.cos(angle)
            y = center + radius * math.sin(angle)
            
            # Fading trail effect
            alpha = int(120 * (1 - t))
            size_dot = int(3 * (1 - t * 0.5))
            
            # Cyan to magenta gradient
            r = int(100 + t * 150)
            g = int(200 - t * 100)
            b = 255
            
            draw.ellipse([x-size_dot, y-size_dot, x+size_dot, y+size_dot],
                        fill=(r, g, b, alpha))
    
    return Image.alpha_composite(img, overlay)

def add_light_rays(img, size):
    """Add dramatic light ray effects."""
    overlay = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    center = size // 2
    
    # Radiating light beams
    for beam in range(16):
        angle = (2 * math.pi * beam) / 16
        
        # Draw beam as gradient
        for dist in range(0, size // 2, 2):
            x = center + dist * math.cos(angle)
            y = center + dist * math.sin(angle)
            
            alpha = int(40 * (1 - dist / (size // 2)) ** 2)
            width = int(size // 30 * (1 - dist / (size // 2)))
            
            # Alternate colors
            if beam % 2 == 0:
                color = (200, 180, 255, alpha)
            else:
                color = (150, 220, 255, alpha)
            
            x2 = center + (dist + size // 60) * math.cos(angle)
            y2 = center + (dist + size // 60) * math.sin(angle)
            
            draw.line([(x, y), (x2, y2)], fill=color, width=width)
    
    return Image.alpha_composite(img, overlay)

def add_holographic_effects(img, size):
    """Add holographic interference patterns."""
    overlay = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    
    for y in range(size):
        for x in range(size):
            # Create interference pattern
            dx = x - size // 2
            dy = y - size // 2
            dist = math.sqrt(dx*dx + dy*dy)
            
            # Multiple interference waves
            pattern = (math.sin(dist / 5) + math.sin(dist / 7 + math.pi/4)) / 2
            
            if pattern > 0.6:
                alpha = int((pattern - 0.6) * 100)
                overlay.putpixel((x, y), (255, 240, 255, alpha))
    
    return Image.alpha_composite(img, overlay)

def create_spectacular_icon(size, filename):
    """Create TRULY spectacular icon!"""
    print(f"🎨 Creating SPECTACULAR {size}x{size} icon...")
    
    # Build up layers
    img = create_cosmic_background(size)
    img = add_light_rays(img, size)
    img = add_data_streams(img, size)
    img = add_energy_field(img, size)
    img = add_neural_web(img, size)
    img = add_holographic_effects(img, size)
    
    # Add main circular frame with thickness and glow
    draw = ImageDraw.Draw(img)
    center = size // 2
    margin = size // 6
    
    # Multi-colored glowing border
    for ring in range(15, 0, -1):
        alpha = int(180 * (ring / 15))
        offset = ring // 2
        
        # Shift through cyan-purple-magenta
        progress = ring / 15
        r = int(100 + progress * 155)
        g = int(200 - progress * 120)
        b = 255
        
        draw.ellipse([margin - offset, margin - offset,
                     size - margin + offset, size - margin + offset],
                    outline=(r, g, b, alpha), width=3)
    
    # Main solid border
    draw.ellipse([margin, margin, size - margin, size - margin],
                outline=(220, 200, 255, 255), width=int(size // 60))
    
    # Inner circle with gradient
    for radius in range(size // 2 - margin, 0, -1):
        progress = 1 - (radius / (size // 2 - margin))
        
        # Gradient from center
        r = int(140 + progress * 50)
        g = int(80 + progress * 50)
        b = int(220 + progress * 20)
        alpha = 255
        
        draw.ellipse([center - radius, center - radius,
                     center + radius, center + radius],
                    fill=(r, g, b, alpha))
    
    # Draw the 'S' with dramatic effects
    try:
        font_size = int(size * 0.45)
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
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
    
    # Deep shadow for depth
    for offset in range(12, 0, -1):
        shadow_alpha = int(200 * (offset / 12))
        draw.text((x + offset, y + offset), text,
                 fill=(20, 0, 40, shadow_alpha), font=font)
    
    # Colored glow around text
    for glow in range(8, 0, -1):
        glow_alpha = int(100 * (glow / 8))
        for gx in range(-glow, glow + 1):
            for gy in range(-glow, glow + 1):
                if gx*gx + gy*gy <= glow*glow:
                    draw.text((x + gx, y + gy), text,
                             fill=(150, 200, 255, glow_alpha // 2), font=font)
    
    # Main text in white with slight gradient
    draw.text((x + 1, y + 1), text, fill=(220, 220, 255, 255), font=font)
    draw.text((x, y), text, fill=(255, 255, 255, 255), font=font)
    
    # Bright highlight
    draw.text((x - 2, y - 2), text, fill=(255, 255, 255, 120), font=font)
    
    # Apply smoothing
    img = img.filter(ImageFilter.SMOOTH_MORE)
    
    img.save(filename)
    print(f"✨ SPECTACULAR {filename} created!")

# Create spectacular icons
print("=" * 70)
print("🚀 CREATING SPECTACULAR, NEXT-LEVEL ICONS FOR SALLIE! 🚀")
print("=" * 70)
print()
print("✨ Features:")
print("  🌌 Cosmic swirling background (deep space aesthetic)")
print("  🕸️  Complex neural web (AI brain visualization)")
print("  ⚡ Energy fields (consciousness flows)")
print("  💫 Data streams (information processing)")
print("  ☀️  Light rays (dramatic lighting)")
print("  🌈 Holographic effects (futuristic tech)")
print("  💜 Cyan-to-magenta spectrum (electric & alive)")
print("  🎨 Multi-layer depth (professional quality)")
print()

create_spectacular_icon(512, 'icon.png')
create_spectacular_icon(256, 'icon-256.png')
create_spectacular_icon(128, 'icon-128.png')
create_spectacular_icon(64, 'icon-64.png')
create_spectacular_icon(32, 'icon-32.png')

# Simple but glowing tray icon
print("🎨 Creating tray icon...")
img = Image.new('RGBA', (16, 16), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Glowing circle
for r in range(8, 0, -1):
    alpha = 255 - r * 20
    draw.ellipse([8-r, 8-r, 8+r, 8+r], fill=(140, 100, 220, alpha))

draw.ellipse([3, 3, 13, 13], outline=(200, 180, 255, 255), width=1)

try:
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 11)
except:
    font = ImageFont.load_default()

draw.text((5, 2), "S", fill=(255, 255, 255, 255), font=font)
img.save('tray-icon.png')
print("✨ tray-icon.png created!")

print()
print("=" * 70)
print("🎆 SPECTACULAR ICONS COMPLETE! 🎆")
print("=" * 70)
print()
print("These icons are:")
print("  ⚡ DYNAMIC with energy and motion")
print("  🎨 DETAILED with multiple visual layers")
print("  🚀 FUTURISTIC and technological")
print("  🧠 AI-THEMED with neural networks")
print("  💜 VIBRANT with beautiful colors")
print("  ✨ EYE-CATCHING and memorable")
print("  🌟 PROFESSIONAL quality")
print()
print("NOT bland. NOT simple. SPECTACULAR! 🎉")
print()
