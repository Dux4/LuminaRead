const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// 1x1 transparent PNG buffer
const minimalPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

const files = ['icon.png', 'splash.png', 'adaptive-icon.png', 'favicon.png'];

files.forEach(file => {
  const filePath = path.join(assetsDir, file);
  fs.writeFileSync(filePath, minimalPng);
  console.log(`Created ${filePath}`);
});
