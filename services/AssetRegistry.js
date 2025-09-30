// Scans, validates, registers pet/action assets (GIFs/images) on startup

class AssetRegistry {
  // ...define asset scanning, manifest mapping, error logging
}

module.exports = AssetRegistry;

// AssetRegistry.js
// Scans, validates, registers pet/action assets (GIFs/images) on startup

const fs = require('fs');
const path = require('path');

class AssetRegistry {
  constructor() {
    this.assets = {};
  }

  scanAssets(assetPath) {
    if (!fs.existsSync(assetPath)) return;
    const files = fs.readdirSync(assetPath);
    files.forEach(file => {
      if (file.endsWith('.gif')) {
        this.assets[file] = path.join(assetPath, file);
      }
    });
    // ...log missing/duplicate assets
  }

  getAsset(name) {
    return this.assets[name];
  }
}

module.exports = new AssetRegistry();
