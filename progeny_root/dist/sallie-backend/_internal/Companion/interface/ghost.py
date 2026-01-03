import os
import sys
import webbrowser

import pystray
from PIL import Image, ImageDraw
from pystray import MenuItem as item


def create_image():
    # Generate an image for the icon
    width = 64
    height = 64
    color1 = (0, 0, 0)
    color2 = (0, 128, 255)  # Progeny Blue

    image = Image.new("RGB", (width, height), color1)
    dc = ImageDraw.Draw(image)
    dc.rectangle((width // 2, 0, width, height // 2), fill=color2)
    dc.rectangle((0, height // 2, width // 2, height), fill=color2)

    return image


def on_open_dashboard(icon, item):
    webbrowser.open("http://localhost:8000/docs")


def on_exit(icon, item):
    icon.stop()
    sys.exit(0)


def setup_tray():
    image = create_image()
    menu = (item("Open Dashboard", on_open_dashboard), item("Exit", on_exit))
    icon = pystray.Icon("name", image, "Digital Progeny", menu)
    icon.run()


if __name__ == "__main__":
    setup_tray()
