const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');

async function rmDir(dir) {
  if (!fs.existsSync(dir)) return;
  await fs.promises.rm(dir, { recursive: true, force: true });
}

async function copyDir(src, dest) {
  await fs.promises.mkdir(dest, { recursive: true });
  const entries = await fs.promises.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      await fs.promises.copyFile(srcPath, destPath);
    }
  }
}

async function main() {
  try {
    await rmDir(dist);
    await fs.promises.mkdir(dist, { recursive: true });

    const files = ['index.html', 'landing.html'];
    for (const file of files) {
      const src = path.join(root, file);
      if (fs.existsSync(src)) {
        await fs.promises.copyFile(src, path.join(dist, file));
      }
    }

    const appDir = path.join(root, 'app');
    if (fs.existsSync(appDir)) {
      await copyDir(appDir, path.join(dist, 'app'));
    }

    console.log('Build complete. dist/ created.');
  } catch (err) {
    console.error('Build failed:', err);
    process.exit(2);
  }
}

main();
