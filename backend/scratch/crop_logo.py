from PIL import Image

img_path = "/Users/macbook/dream/resaech/frontend/public/logo.png"
img = Image.open(img_path)
width, height = img.size
print("IMAGE SIZE:", width, "x", height)

# Crop the colorful icon at the center (approximate bounding box for the "A" and robot icon)
# Left, upper, right, lower
box = (int(width * 0.2), int(height * 0.15), int(width * 0.8), int(height * 0.58))
cropped = img.crop(box)
cropped.save("/Users/macbook/dream/resaech/frontend/public/logo-icon.png")
print("Cropped logo-icon.png successfully!")
