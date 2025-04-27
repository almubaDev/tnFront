const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 64, 192, 512];
const inputImage = path.join(__dirname, '../icon.png');
const outputDir = path.join(__dirname, '../public');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  try {
    // Generate favicon.ico (multiple sizes in one file)
    const faviconSizes = [16, 32, 64];
    const faviconBuffers = await Promise.all(
      faviconSizes.map(size => 
        sharp(inputImage)
          .resize(size, size)
          .toBuffer()
      )
    );
    
    await sharp(faviconBuffers[0])
      .toFile(path.join(outputDir, 'favicon.ico'));

    // Generate PNG icons
    for (const size of sizes) {
      if (size > 64) { // Skip sizes already in favicon
        await sharp(inputImage)
          .resize(size, size)
          .toFile(path.join(outputDir, `logo${size}.png`));
      }
    }

    console.log('PWA assets generated successfully!');
  } catch (error) {
    console.error('Error generating PWA assets:', error);
  }
}

generateIcons(); 