import os
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math

def create_gemini_infj_icon(size, output_path):
    # Create a new image with RGBA mode (transparent background)
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Colors
    # INFJ: Deep, intuitive, mystical -> Indigo/Deep Purple
    # Gemini: Air, duality, intellect -> Silver/Light Blue/Teal
    
    # Gradient-like background (Deep Indigo to Violet)
    # Since PIL is limited, we'll use concentric circles for a gradient effect
    center = size // 2
    radius = size // 2 - (size // 10)
    
    # Draw shadow
    shadow_layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow_layer)
    shadow_bbox = (size//10, size//10, size - size//10, size - size//10)
    shadow_draw.ellipse(shadow_bbox, fill=(0, 0, 0, 80))
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(radius=size//15))
    img = Image.alpha_composite(img, shadow_layer)
    
    draw = ImageDraw.Draw(img)
    
    # Main circle background (Deep Indigo)
    bg_color = (46, 16, 101) # Deep Indigo #2e1065
    draw.ellipse((center - radius, center - radius, center + radius, center + radius), fill=bg_color)
    
    # Inner glow/duality (Gemini aspect)
    # Draw two intersecting subtle circles or a yin-yang like curve?
    # Let's do a "Twin Pillars" abstract design that forms an "S"
    
    # Draw a lighter violet circle slightly smaller
    inner_radius = radius * 0.95
    # draw.ellipse((center - inner_radius, center - inner_radius, center + inner_radius, center + inner_radius), outline=(139, 92, 246), width=size//40)

    # The Symbol: Stylized "II" (Gemini) merging into "S"
    # We will draw two vertical curved strokes
    
    stroke_width = size // 8
    accent_color_1 = (167, 139, 250) # Light Violet
    accent_color_2 = (45, 212, 191)  # Teal (INFJ secondary)
    
    # Left curve (Top part of S / Left Twin)
    # Arc from top-center to center-left
    # Bounding box for arc
    
    # Let's keep it simple and elegant. A stylized "S" made of two disconnected strokes.
    
    # Top stroke
    # Start at top right, curve to center
    # Draw an arc
    margin = size // 4
    
    # Draw a custom shape for "S"
    # We'll use a font if possible, but drawing is safer for portability
    # Let's draw two circles representing the twins, connected by a flow
    
    # Twin 1 (Top Right)
    t1_x = center + size//6
    t1_y = center - size//6
    t1_r = size // 6
    draw.ellipse((t1_x - t1_r, t1_y - t1_r, t1_x + t1_r, t1_y + t1_r), fill=accent_color_1)
    
    # Twin 2 (Bottom Left)
    t2_x = center - size//6
    t2_y = center + size//6
    t2_r = size // 6
    draw.ellipse((t2_x - t2_r, t2_y - t2_r, t2_x + t2_r, t2_y + t2_r), fill=accent_color_2)
    
    # Connecting Flow (The "S" curve)
    # Bezier-like curve?
    # Let's just draw a thick line connecting them with round caps
    draw.line([(t2_x, t2_y), (t1_x, t1_y)], fill=(255, 255, 255, 100), width=size//12)
    
    # Overlay a white "S" or "Gemini" symbol?
    # Let's try to draw a clean "S" in white over the deep background, 
    # but make it split or dual.
    
    # Clear the previous shapes, let's try a different approach for the symbol.
    # Re-draw background to clear
    draw.ellipse((center - radius, center - radius, center + radius, center + radius), fill=bg_color)
    
    # Dual "S"
    # One S in Teal, One S in Violet, slightly offset
    
    font_size = int(size * 0.7)
    try:
        font = ImageFont.truetype("arial.ttf", font_size)
    except IOError:
        font = ImageFont.load_default()

    text = "S"
    left, top, right, bottom = font.getbbox(text)
    w = right - left
    h = bottom - top
    
    tx = (size - w) // 2 - left
    ty = (size - h) // 2 - top
    
    # Shadow S
    draw.text((tx + size//20, ty + size//20), text, font=font, fill=(0,0,0, 100))
    
    # Teal S (Left/Bottom)
    draw.text((tx - size//30, ty), text, font=font, fill=accent_color_2)
    
    # Violet S (Right/Top) - partially overlapping to create the duality
    # We need to mask it or just draw it.
    # Let's draw it slightly offset
    draw.text((tx + size//30, ty), text, font=font, fill=accent_color_1)
    
    # White intersection? 
    # Just the two colors represents the Gemini duality well.
    
    # Save
    img.save(output_path)
    print(f"Generated {output_path}")
    return img

def main():
    assets_dir = os.path.join(os.path.dirname(__file__), 'assets')
    if not os.path.exists(assets_dir):
        os.makedirs(assets_dir)

    sizes = [16, 32, 48, 64, 128, 256, 512]
    
    # Generate main icon
    large_icon = create_gemini_infj_icon(1024, os.path.join(assets_dir, 'icon.png'))
    
    for size in sizes:
        create_gemini_infj_icon(size, os.path.join(assets_dir, f'icon-{size}.png'))

    # Tray Icon
    tray_size = 32
    tray_img = Image.new('RGBA', (tray_size, tray_size), (0, 0, 0, 0))
    tray_draw = ImageDraw.Draw(tray_img)
    
    # Simple "S"
    try:
        font = ImageFont.truetype("arial.ttf", 24)
    except:
        font = ImageFont.load_default()
        
    tray_draw.text((8, 0), "S", font=font, fill=(255, 255, 255))
    
    tray_img.save(os.path.join(assets_dir, 'tray-icon.png'))
    print("Generated tray-icon.png")

    # ICO
    large_icon.save(os.path.join(assets_dir, 'icon.ico'), format='ICO', sizes=[(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)])
    print("Generated icon.ico")

if __name__ == "__main__":
    main()
