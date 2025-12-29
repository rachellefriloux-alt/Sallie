#!/usr/bin/env python3
"""Create beautiful, personality-rich icons for Sallie."""

from PIL import Image, ImageDraw, ImageFont
import math

def create_gradient_background(size, colors):
    """Create a radial gradient background."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    center = size // 2
    max_radius = math.sqrt(2) * size / 2
    
    for radius in range(int(max_radius), 0, -1):
        # Interpolate between colors
        progress = radius / max_radius
        
        if progress > 0.7:
            # Outer: Deep purple to violet
            t = (progress - 0.7) / 0.3
            r = int(75 + t * (147 - 75))
            g = int(0 + t * (51 - 0))
            b = int(130 + t * (234 - 130))
        elif progress > 0.4:
            # Middle: Violet to bright purple
            t = (progress - 0.4) / 0.3
            r = int(147 + t * (186 - 147))
            g = int(51 + t * (139 - 51))
            b = int(234 + t * (250 - 234))
        else:
            # Inner: Bright purple to light violet
            t = progress / 0.4
            r = int(220 + t * (186 - 220))
            g = int(180 + t * (139 - 180))
            b = int(255 + t * (250 - 255))
        
        a = int(255 * (1 - progress * 0.3))
        
        bbox = [center - radius, center - radius, center + radius, center + radius]
        draw.ellipse(bbox, fill=(r, g, b, a))
    
    return img

def add_sparkles(img, size):
    """Add sparkle/star effects."""
    draw = ImageDraw.Draw(img)
    
    # Add sparkle points
    sparkles = [
        (size * 0.25, size * 0.2, 4),
        (size * 0.75, size * 0.3, 3),
        (size * 0.15, size * 0.7, 5),
        (size * 0.8, size * 0.75, 3),
        (size * 0.45, size * 0.15, 2),
    ]
    
    for x, y, sparkle_size in sparkles:
        # Draw a star shape
        points = []
        for i in range(8):
            angle = i * math.pi / 4
            if i % 2 == 0:
                radius = sparkle_size * 2
            else:
                radius = sparkle_size * 0.8
            px = x + radius * math.cos(angle)
            py = y + radius * math.sin(angle)
            points.append((px, py))
        
        draw.polygon(points, fill=(255, 255, 255, 220))
    
    return img

def create_sallie_icon(size, filename):
    """Create a beautiful icon with Sallie's personality - warm, intelligent, ethereal."""
    # Create gradient background
    img = create_gradient_background(size, [(75, 0, 130), (147, 51, 234), (186, 139, 250)])
    
    draw = ImageDraw.Draw(img)
    
    # Draw outer glow circle
    center = size // 2
    outer_margin = size // 12
    for i in range(5, 0, -1):
        alpha = int(60 * (i / 5))
        margin = outer_margin - (i * size // 60)
        draw.ellipse(
            [margin, margin, size - margin, size - margin],
            fill=(220, 180, 255, alpha)
        )
    
    # Draw main circle with subtle gradient
    margin = size // 8
    draw.ellipse(
        [margin, margin, size - margin, size - margin],
        fill=(147, 51, 234, 255)
    )
    
    # Inner lighter circle
    inner_margin = size // 6
    draw.ellipse(
        [inner_margin, inner_margin, size - inner_margin, size - inner_margin],
        fill=(186, 139, 250, 255)
    )
    
    # Draw elegant 'S' with shadow for depth
    try:
        # Try to load a nice font
        font_size = int(size * 0.55)
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
        except:
            try:
                font = ImageFont.truetype("/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf", font_size)
            except:
                font = ImageFont.load_default()
    except:
        font = ImageFont.load_default()
    
    text = "S"
    
    # Get text bounding box
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    # Center the text
    x = (size - text_width) // 2 - bbox[0]
    y = (size - text_height) // 2 - bbox[1]
    
    # Draw shadow
    shadow_offset = max(2, size // 80)
    draw.text((x + shadow_offset, y + shadow_offset), text, fill=(50, 0, 80, 180), font=font)
    
    # Draw main text
    draw.text((x, y), text, fill=(255, 255, 255, 255), font=font)
    
    # Add subtle highlight
    highlight_offset = -max(1, size // 120)
    draw.text((x + highlight_offset, y + highlight_offset), text, fill=(255, 255, 255, 80), font=font)
    
    # Add sparkles for personality
    if size >= 64:
        img = add_sparkles(img, size)
    
    # Add subtle shine/reflection on top
    overlay = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    
    # Top-left shine
    shine_size = size // 3
    shine_gradient = []
    for i in range(shine_size):
        alpha = int(80 * (1 - i / shine_size) ** 2)
        shine_gradient.append((255, 255, 255, alpha))
    
    for i, color in enumerate(shine_gradient):
        overlay_draw.arc(
            [margin + i, margin + i, size - margin - i, size - margin - i],
            start=180, end=270, fill=color, width=2
        )
    
    img = Image.alpha_composite(img, overlay)
    
    img.save(filename)
    print(f"✨ Created beautiful {filename} ({size}x{size})")

def create_tray_icon(size, filename):
    """Create a simpler but recognizable tray icon."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Simple solid circle with 'S'
    margin = 1
    draw.ellipse([margin, margin, size - margin, size - margin], 
                 fill=(147, 51, 234, 255))
    
    # Simple white 'S'
    try:
        font_size = int(size * 0.7)
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
    
    draw.text((x, y), text, fill=(255, 255, 255, 255), font=font)
    
    img.save(filename)
    print(f"✨ Created {filename} ({size}x{size})")

# Create beautiful icons at various sizes
print("🎨 Creating beautiful icons that match Sallie's personality...")
print("   (Warm, intelligent, ethereal, with a touch of magic)")
print()

create_sallie_icon(512, 'icon.png')
create_sallie_icon(256, 'icon-256.png')
create_sallie_icon(128, 'icon-128.png')
create_sallie_icon(64, 'icon-64.png')
create_sallie_icon(32, 'icon-32.png')
create_tray_icon(16, 'tray-icon.png')

print()
print("✅ All beautiful icons created successfully!")
print("🌟 They capture Sallie's essence: intelligent, warm, and a little bit magical!")
