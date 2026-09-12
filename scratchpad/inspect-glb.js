const fs = require('fs');
const path = require('path');
const THREE = require('three');
const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader.js');

const filePath = path.resolve(__dirname, '../public/character-scene/male.glb');
const buffer = fs.readFileSync(filePath);
console.log('File size:', buffer.length, 'bytes');

const loader = new GLTFLoader();

try {
  const gltf = loader.parseSync(buffer, '');
  const box = new THREE.Box3().setFromObject(gltf.scene);
  const size = new THREE.Vector3();
  box.getSize(size);
  console.log('Male model size (w x h x d):', size.x.toFixed(2), size.y.toFixed(2), size.z.toFixed(2));
  console.log('Male model center:', box.getCenter(new THREE.Vector3()).toArray().map(n => n.toFixed(2)));
  process.exit(0);
} catch(e) {
  console.error('Parse error:', e.message);
  
  // Fallback: try parse (async)
  loader.parse(buffer, '', (gltf) => {
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    console.log('Male model size (w x h x d):', size.x.toFixed(2), size.y.toFixed(2), size.z.toFixed(2));
    process.exit(0);
  }, undefined, (err) => { console.error('Parse Error:', err.message); process.exit(1); });
}
