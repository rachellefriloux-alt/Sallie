import os
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_modern_icon(size, output_path):
    # Create a new image with RGBA mode (transparent background)
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Define colors (Modern Purple/Blue Gradient feel)
    # Gradient simulation by drawing concentric circles or just a solid modern color
    # Let's do a rounded rectangle with a gradient-like fill
    
    padding = size // 8
    shape_bbox = (padding, padding, size - padding, size - padding)
    
    # Draw main background (Rounded Rectangle)
    # Since PIL doesn't support gradients easily on shapes, we'll use a solid vibrant color
    # Deep Purple to Bright Blue
    primary_color = (124, 58, 237) # Violet-600
    secondary_color = (139, 92, 246) # Violet-500
    
    # Draw a shadow/glow
    shadow_layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow_layer)
    shadow_bbox = (padding + size//20, padding + size//20, size - padding + size//20, size - padding + size//20)
    shadow_draw.rounded_rectangle(shadow_bbox, radius=size//4, fill=(0, 0, 0, 60))
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(radius=size//20))
    img = Image.alpha_composite(img, shadow_layer)
    
    # Draw main shape
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle(shape_bbox, radius=size//5, fill=primary_color)
    
    # Add a subtle highlight (top-left)
    highlight_bbox = (padding, padding, size - padding, size//2 + padding)
    # This is tricky with basic PIL, let's keep it simple and clean.
    
    # Draw the "S" logo or a symbol
    # We'll draw a stylized "S" using a font if available, or simple geometric shapes.
    # Let's draw a geometric abstract "S" using lines/arcs for a tech feel.
    
    center = size // 2
    stroke_width = size // 8
    white = (255, 255, 255, 255)
    
    # Draw a circle outline
    # draw.ellipse((center - size//4, center - size//4, center + size//4, center + size//4), outline=white, width=stroke_width)
    
    # Let's try to draw a text "S"
    try:
        # Try to load a default font, or use a path to a font if known. 
        # On Windows, arial.ttf is usually available.
        font_size = int(size * 0.6)
        try:
            font = ImageFont.truetype("arial.ttf", font_size)
        except IOError:
            # Fallback to default if arial not found
            font = ImageFont.load_default()
            
        text = "S"
        # Get text size to center it
        # getbbox returns (left, top, right, bottom)
        left, top, right, bottom = font.getbbox(text)
        text_width = right - left
        text_height = bottom - top
        
        text_x = (size - text_width) // 2 - left
        text_y = (size - text_height) // 2 - top
        
        draw.text((text_x, text_y), text, font=font, fill=white)
        
    except Exception as e:
        print(f"Could not draw text: {e}")
        # Fallback geometric shape (Diamond)
        mid = size // 2
        p = size // 4
        points = [
            (mid, p), # Top
            (size - p, mid), # Right
            (mid, size - p), # Bottom
            (p, mid) # Left
        ]
        draw.polygon(points, fill=white)

    # Save
    img.save(output_path)
    print(f"Generated {output_path}")
    return img

def main():
    assets_dir = os.path.join(os.path.dirname(__file__), 'assets')
    if not os.path.exists(assets_dir):
        os.makedirs(assets_dir)

    # Generate standard sizes
    sizes = [16, 32, 48, 64, 128, 256, 512]
    
    # Generate main icon (largest)
    large_icon = create_modern_icon(1024, os.path.join(assets_dir, 'icon.png'))
    
    # Generate specific sizes
    for size in sizes:
        create_modern_icon(size, os.path.join(assets_dir, f'icon-{size}.png'))

    # Generate Tray Icon (Simple, white/transparent for dark mode compatibility)
    tray_size = 32 # Standard tray size usually 16x16 or 32x32 for high dpi
    tray_img = Image.new('RGBA', (tray_size, tray_size), (0, 0, 0, 0))
    tray_draw = ImageDraw.Draw(tray_img)
    
    # Simple "S" or Circle for tray
    padding = 4
    tray_draw.ellipse((padding, padding, tray_size-padding, tray_size-padding), fill=(255, 255, 255, 255))
    # Cutout center
    tray_draw.ellipse((padding+4, padding+4, tray_size-padding-4, tray_size-padding-4), fill=(0, 0, 0, 0), outline=None)
    
    tray_img.save(os.path.join(assets_dir, 'tray-icon.png'))
    print("Generated tray-icon.png")

    # Generate .ico for Windows (requires multiple sizes)
    # PIL can save ICO if sizes are provided
    large_icon.save(os.path.join(assets_dir, 'icon.ico'), format='ICO', sizes=[(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)])
    print("Generated icon.ico")
    
    # Note: .icns usually requires specific tools (iconutil on mac), but we can leave the pngs for electron-builder to handle if configured, 
    # or just use the png. Electron-builder often handles png to icns conversion if on mac, or we can skip it for now.
    
if __name__ == "__main__":
    main()
