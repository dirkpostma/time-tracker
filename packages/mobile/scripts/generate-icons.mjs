import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(__dirname, '..', 'assets');

async function generateIcons() {
  console.log('Generating app icons from SVG...\n');

  // Icon: 1024x1024 for App Store
  const iconSvg = readFileSync(join(assetsDir, 'icon.svg'));
  await sharp(iconSvg)
    .resize(1024, 1024)
    .png()
    .toFile(join(assetsDir, 'icon.png'));
  console.log('✓ icon.png (1024x1024)');

  // Splash icon: 512x512 (transparent background)
  const splashSvg = readFileSync(join(assetsDir, 'splash-icon.svg'));
  await sharp(splashSvg)
    .resize(512, 512)
    .png()
    .toFile(join(assetsDir, 'splash-icon.png'));
  console.log('✓ splash-icon.png (512x512)');

  // Adaptive icon for Android: 1024x1024 (transparent background)
  const adaptiveSvg = readFileSync(join(assetsDir, 'adaptive-icon.svg'));
  await sharp(adaptiveSvg)
    .resize(1024, 1024)
    .png()
    .toFile(join(assetsDir, 'adaptive-icon.png'));
  console.log('✓ adaptive-icon.png (1024x1024)');

  // Favicon: 48x48
  await sharp(iconSvg)
    .resize(48, 48)
    .png()
    .toFile(join(assetsDir, 'favicon.png'));
  console.log('✓ favicon.png (48x48)');

  console.log('\nAll icons generated successfully!');
}

generateIcons().catch(console.error);
