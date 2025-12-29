#!/usr/bin/env python3
"""Create truly AMAZING icons for Sallie - not bland, but spectacular!"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math
import random

def create_neural_network_bg(size):
    """Create an AI-inspired neural network background."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Create a dark purple to deep space gradient base
    for y in range(size):
        progress = y / size
        # Deep space purple to bright violet
        r = int(30 + progress * 120)
        g = int(0 + progress * 80)
        b = int(50 + progress * 200)
        draw.line([(0, y), (size, y)], fill=(r, g, b, 255))
    
    return img

def add_constellation_network(img, size):
    """Add constellation-like neural network connections."""
    draw = ImageDraw.Draw(img)
    overlay = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    
    # Create nodes in a brain-like pattern
    center_x, center_y = size // 2, size // 2
    nodes = []
    
    # Create circular arrangement of nodes
    num_rings = 3
    for ring in range(num_rings):
        radius = (size // 6) * (ring + 1)
        num_nodes = 6 + ring * 4
        for i in range(num_nodes):
            angle = (2 * math.pi * i) / num_nodes + (ring * 0.3)
            x = center_x + radius * math.cos(angle)
            y = center_y + radius * math.sin(angle)
            nodes.append((x, y))
    
    # Draw connections with glow
    for i, (x1, y1) in enumerate(nodes):
        for j, (x2, y2) in enumerate(nodes):
            if i < j:
                dist = math.sqrt((x2-x1)**2 + (y2-y1)**2)
                if dist < size // 3:
                    # Calculate alpha based on distance
                    alpha = int(80 * (1 - dist / (size // 3)))
                    # Draw glowing line
                    for thickness in range(3, 0, -1):
                        line_alpha = alpha // thickness
                        overlay_draw.line([(x1, y1), (x2, y2)], 
                                        fill=(186, 139, 250, line_alpha), 
                                        width=thickness)
    
    # Draw nodes as glowing points
    for x, y in nodes:
        for radius in range(6, 0, -1):
            alpha = int(200 * (radius / 6))
            overlay_draw.ellipse([x-radius, y-radius, x+radius, y+radius],
                                fill=(255, 200, 255, alpha))
    
    img = Image.alpha_composite(img, overlay)
    return img

def add_energy_waves(img, size):
    """Add flowing energy wave patterns."""
    overlay = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    center_x, center_y = size // 2, size // 2
    
    # Draw multiple wave rings
    for wave in range(5):
        radius = (size // 8) + wave * (size // 16)
        thickness = 3 - wave // 2
        
        # Create wave effect with varying alpha
        for angle in range(0, 360, 5):
            rad = math.radians(angle)
            # Varying radius for wave effect
            wave_offset = math.sin(rad * 3 + wave) * (size // 40)
            r = radius + wave_offset
            
            x1 = center_x + r * math.cos(rad)
            y1 = center_y + r * math.sin(rad)
            
            next_rad = math.radians(angle + 5)
            x2 = center_x + (radius + math.sin(next_rad * 3 + wave) * (size // 40)) * math.cos(next_rad)
            y2 = center_y + (radius + math.sin(next_rad * 3 + wave) * (size // 40)) * math.sin(next_rad)
            
            # Color cycles through spectrum
            alpha = int(100 - wave * 15)
            color = (147 + wave * 20, 51 + wave * 30, 234, alpha)
            
            draw.line([(x1, y1), (x2, y2)], fill=color, width=thickness)
    
    img = Image.alpha_composite(img, overlay)
    return img

def add_particle_field(img, size):
    """Add floating particle effect like thoughts."""
    overlay = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    # Seed for consistent pattern
    random.seed(42)
    
    # Create particles
    for _ in range(30):
        x = random.randint(size // 10, size - size // 10)
        y = random.randint(size // 10, size - size // 10)
        
        # Varying sizes and brightness
        particle_size = random.randint(1, 4)
        alpha = random.randint(100, 255)
        
        # Draw particle with glow
        for glow in range(particle_size + 2, 0, -1):
            glow_alpha = alpha // (particle_size + 3 - glow)
            draw.ellipse([x-glow, y-glow, x+glow, y+glow],
                        fill=(255, 220, 255, glow_alpha))
    
    img = Image.alpha_composite(img, overlay)
    return img

def add_holographic_shine(img, size):
    """Add holographic light reflections."""
    overlay = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    # Diagonal light streaks
    for i in range(3):
        start_x = size * (0.2 + i * 0.2)
        start_y = 0
        end_x = size
        end_y = size * (0.6 + i * 0.2)
        
        # Create gradient along the streak
        steps = 50
        for step in range(steps):
            t = step / steps
            x = start_x + (end_x - start_x) * t
            y = start_y + (end_y - start_y) * t
            
            alpha = int(40 * math.sin(t * math.pi))
            size_streak = int(size // 20 * (1 - abs(t - 0.5) * 2))
            
            draw.ellipse([x - size_streak, y - size_streak, 
                         x + size_streak, y + size_streak],
                        fill=(255, 240, 255, alpha))
    
    img = Image.alpha_composite(img, overlay)
    return img

def create_amazing_sallie_icon(size, filename):
    """Create a SPECTACULAR icon that captures Sallie's AI essence!"""
    print(f"🎨 Creating amazing {size}x{size} icon...")
    
    # Start with neural network background
    img = create_neural_network_bg(size)
    
    # Add constellation network (AI brain)
    img = add_constellation_network(img, size)
    
    # Add energy waves (consciousness)
    img = add_energy_waves(img, size)
    
    # Add particle field (thoughts)
    img = add_particle_field(img, size)
    
    # Add holographic shine (futuristic)
    img = add_holographic_shine(img, size)
    
    # Create main circular frame with depth
    center = size // 2
    
    # Outer glow rings
    for ring in range(8, 0, -1):
        alpha = int(40 * (ring / 8))
        margin = size // 8 - ring * (size // 100)
        draw = ImageDraw.Draw(img)
        draw.ellipse([margin, margin, size - margin, size - margin],
                    outline=(220, 180, 255, alpha), width=int(size // 40))
    
    # Main circle with gradient border
    margin = size // 7
    draw = ImageDraw.Draw(img)
    
    # Multi-colored glowing border
    for thickness in range(10, 0, -1):
        alpha = int(200 * (thickness / 10))
        # Color shifts from violet to cyan
        r = int(147 + thickness * 5)
        g = int(51 + thickness * 10)
        b = 234
        draw.ellipse([margin - thickness, margin - thickness, 
                     size - margin + thickness, size - margin + thickness],
                    outline=(r, g, b, alpha), width=2)
    
    # Inner filled circle with gradient
    inner_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    inner_draw = ImageDraw.Draw(inner_img)
    
    # Create radial gradient for inner circle
    for radius in range(size // 2 - margin, 0, -1):
        progress = radius / (size // 2 - margin)
        r = int(100 + progress * 86)
        g = int(40 + progress * 99)
        b = int(180 + progress * 70)
        alpha = 255
        
        inner_draw.ellipse([center - radius, center - radius, 
                          center + radius, center + radius],
                         fill=(r, g, b, alpha))
    
    img = Image.alpha_composite(img, inner_img)
    
    # Draw the 'S' with style
    draw = ImageDraw.Draw(img)
    
    try:
        font_size = int(size * 0.5)
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
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = (size - text_width) // 2 - bbox[0]
    y = (size - text_height) // 2 - bbox[1]
    
    # Multi-layer shadow for depth
    for offset in range(8, 0, -1):
        shadow_alpha = int(150 * (offset / 8))
        draw.text((x + offset//2, y + offset//2), text, 
                 fill=(30, 0, 50, shadow_alpha), font=font)
    
    # Main text with gradient effect (simulate with layers)
    # Bottom layer (darker)
    draw.text((x + 1, y + 1), text, fill=(200, 150, 240, 255), font=font)
    # Top layer (bright)
    draw.text((x, y), text, fill=(255, 255, 255, 255), font=font)
    
    # Highlight on top left of letter
    draw.text((x - 1, y - 1), text, fill=(255, 255, 255, 100), font=font)
    
    # Apply final blur for smoothness
    img = img.filter(ImageFilter.SMOOTH)
    
    img.save(filename)
    print(f"✅ Created AMAZING {filename}!")

def create_amazing_tray_icon(size, filename):
    """Create a stunning but simple tray icon."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    center = size // 2
    
    # Glowing background
    for radius in range(size // 2, 0, -1):
        alpha = int(255 * (1 - radius / (size // 2)) * 0.8)
        r = int(100 + (1 - radius / (size // 2)) * 86)
        g = int(40 + (1 - radius / (size // 2)) * 99)
        b = int(180 + (1 - radius / (size // 2)) * 70)
        draw.ellipse([center - radius, center - radius, 
                     center + radius, center + radius],
                    fill=(r, g, b, alpha))
    
    # Border
    draw.ellipse([1, 1, size-1, size-1], outline=(220, 180, 255, 255), width=1)
    
    # Simple 'S'
    try:
        font_size = int(size * 0.65)
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
    
    # Shadow
    draw.text((x + 1, y + 1), text, fill=(50, 0, 80, 200), font=font)
    # Main
    draw.text((x, y), text, fill=(255, 255, 255, 255), font=font)
    
    img.save(filename)
    print(f"✅ Created {filename}!")

# Create the AMAZING icons!
print("=" * 60)
print("🌟 CREATING TRULY AMAZING ICONS FOR SALLIE 🌟")
print("=" * 60)
print()
print("Features:")
print("  ✨ Neural network constellation (AI brain)")
print("  🌊 Energy waves (consciousness)")
print("  ✨ Particle field (flowing thoughts)")
print("  🌈 Holographic shine (futuristic)")
print("  💜 Deep space gradients (mysterious & intelligent)")
print("  🎨 Multi-layer depth (professional)")
print()

create_amazing_sallie_icon(512, 'icon.png')
create_amazing_sallie_icon(256, 'icon-256.png')
create_amazing_sallie_icon(128, 'icon-128.png')
create_amazing_sallie_icon(64, 'icon-64.png')
create_amazing_sallie_icon(32, 'icon-32.png')
create_amazing_tray_icon(16, 'tray-icon.png')

print()
print("=" * 60)
print("🎉 ALL AMAZING ICONS CREATED SUCCESSFULLY! 🎉")
print("=" * 60)
print()
print("These icons are:")
print("  🚀 NOT bland or plain")
print("  🎨 Full of detail and personality")
print("  🧠 AI-inspired with neural networks")
print("  ✨ Magical with particles and energy")
print("  💜 Beautiful with deep space gradients")
print("  🌟 Professional and eye-catching")
print()
