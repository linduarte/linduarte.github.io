This project includes a helper script to generate responsive WebP variants for images used by the site.

Usage (Windows PowerShell):

# Install required package (Node.js/npm must be installed)
npm install sharp

# Generate variants for the under-construction image
node scripts/generate_responsive_images.js app/static/images/under-construction.webp --widths=150,300,600

# The script will write files next to the source image with suffixes like -150.webp, -300.webp, -600.webp

Notes:
- The script uses sharp and will fail if libvips/native dependencies are missing; on Windows npm usually builds them automatically but if you encounter errors install the prebuilt binaries or follow sharp's installation docs.
- After generating images, commit the generated files and the HTML template changes.
