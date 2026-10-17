// Progressive synchronized line drawing & node reveal
function updateTimelineScroll() {
  const windowHeight = window.innerHeight;
  // Trigger line roughly 75% down the viewport
  const triggerPoint = windowHeight * 0.75;

  // 1. Synchronized Timeline Line & Node Reveals
  document.querySelectorAll('.timeline-vertical').forEach((timeline) => {
    const line = timeline.querySelector('.timeline-line');
    const nodes = timeline.querySelectorAll('.timeline-node');
    if (!line) return;

    const timelineRect = timeline.getBoundingClientRect();
    const timelineTop = timelineRect.top;
    const timelineHeight = timelineRect.height;

    // Track scroll depth relative to the timeline start
    let drawnPx = 0;
    if (timelineTop < triggerPoint) {
      drawnPx = Math.max(0, triggerPoint - timelineTop);
      const maxHeight = timelineHeight - 30;
      const progressPercent = Math.min(100, (drawnPx / maxHeight) * 100);
      line.style.height = `${progressPercent}%`;
    } else {
      line.style.height = '0%';
    }

    // Reveal each card/node only when the drawn line reaches its top offset
    nodes.forEach((node) => {
      const nodeTopRelative = node.offsetTop;
      if (drawnPx >= nodeTopRelative - 20) {
        node.classList.add('in-view');
      } else {
        node.classList.remove('in-view'); // Re-hides smoothly if scrolling up
      }
    });
  });

  // 2. "What I Love Building" cards reveal
  document.querySelectorAll('.stack-item-card').forEach((card) => {
    const rect = card.getBoundingClientRect();
    if (rect.top < triggerPoint + 40) {
      card.classList.add('in-view');
    } else {
      card.classList.remove('in-view');
    }
  });
}

// Attach listeners
window.addEventListener('scroll', updateTimelineScroll, { passive: true });
window.addEventListener('resize', updateTimelineScroll);
window.addEventListener('DOMContentLoaded', updateTimelineScroll);

// ==========================================
// INTERACTIVE 3D CHARACTER & SCROLL ENGINE
// ==========================================
(function init3DAvatar() {
  const stage = document.getElementById('avatar-stage');
  const bubble = document.getElementById('avatar-speech');
  if (!stage || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0.1, 5.5);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  stage.appendChild(renderer.domElement);

  // Studio Pixar-style Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const keyLight = new THREE.DirectionalLight(0xfff5e6, 1.4);
  keyLight.position.set(3, 4, 4);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.2);
  rimLight.position.set(-4, 2, -3);
  scene.add(rimLight);

  // Character Root Group
  const charGroup = new THREE.Group();
  charGroup.position.set(1.3, -0.2, 0);
  scene.add(charGroup);

  const headGroup = new THREE.Group();
  charGroup.add(headGroup);

  // Materials
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xe09f7d, roughness: 0.42 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.65 });
  const hoodieMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
  const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });

  // Head & Ears
  const headGeo = new THREE.SphereGeometry(1, 32, 32);
  headGeo.scale(0.88, 1.05, 0.92);
  headGroup.add(new THREE.Mesh(headGeo, skinMat));

  const earGeo = new THREE.SphereGeometry(0.22, 16, 16);
  const leftEar = new THREE.Mesh(earGeo, skinMat);
  leftEar.position.set(-0.88, 0, -0.05);
  const rightEar = leftEar.clone();
  rightEar.position.x = 0.88;
  headGroup.add(leftEar, rightEar);

  // Curly Stylized Hair
  const hairClusters = [
    [0, 0.95, 0.1, 0.55], [-0.45, 0.85, 0.2, 0.45], [0.45, 0.85, 0.2, 0.45],
    [-0.25, 1.0, 0.45, 0.42], [0.25, 1.0, 0.45, 0.42], [0, 0.8, -0.35, 0.65],
    [-0.65, 0.55, 0, 0.4], [0.65, 0.55, 0, 0.4]
  ];
  hairClusters.forEach(([x, y, z, r]) => {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 20), hairMat);
    puff.position.set(x, y, z);
    headGroup.add(puff);
  });

  // Eyes & Pupils (Grouped for blinking & tracking)
  const eyeGroup = new THREE.Group();
  const eyeGeo = new THREE.SphereGeometry(0.16, 20, 20);
  const leftEye = new THREE.Mesh(eyeGeo, eyeWhiteMat);
  leftEye.position.set(-0.32, 0.12, 0.82);
  const rightEye = leftEye.clone();
  rightEye.position.x = 0.32;

  const pupilGeo = new THREE.SphereGeometry(0.08, 16, 16);
  const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
  leftPupil.position.set(-0.32, 0.12, 0.96);
  const rightPupil = leftPupil.clone();
  rightPupil.position.x = 0.32;

  eyeGroup.add(leftEye, rightEye, leftPupil, rightPupil);
  headGroup.add(eyeGroup);

  // Eyebrows & Nose
  const browGeo = new THREE.BoxGeometry(0.32, 0.06, 0.08);
  const leftBrow = new THREE.Mesh(browGeo, hairMat);
  leftBrow.position.set(-0.32, 0.38, 0.86);
  leftBrow.rotation.z = 0.08;
  const rightBrow = leftBrow.clone();
  rightBrow.position.x = 0.32;
  rightBrow.rotation.z = -0.08;
  headGroup.add(leftBrow, rightBrow);

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), skinMat);
  nose.position.set(0, -0.05, 0.93);
  headGroup.add(nose);

  // Face Stickers (Sen's signature vibe)
  const stickerCyan = new THREE.Mesh(
    new THREE.PlaneGeometry(0.28, 0.14),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide })
  );
  stickerCyan.position.set(-0.48, -0.18, 0.84);
  stickerCyan.rotation.set(0, -0.45, 0.15);
  headGroup.add(stickerCyan);

  const stickerPink = new THREE.Mesh(
    new THREE.CircleGeometry(0.11, 20),
    new THREE.MeshBasicMaterial({ color: 0xf43f5e, side: THREE.DoubleSide })
  );
  stickerPink.position.set(0.48, -0.15, 0.84);
  stickerPink.rotation.y = 0.45;
  headGroup.add(stickerPink);

  // Neck & Hoodie Torso
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.6, 20), skinMat);
  neck.position.set(0, -1.0, 0);
  charGroup.add(neck);

  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 1.15, 1.4, 28), hoodieMat);
  torso.position.set(0, -1.8, 0);
  charGroup.add(torso);

  // Orbiting Tech Nodes (AI / Neural Network vibe)
  const orbGroup = new THREE.Group();
  charGroup.add(orbGroup);
  const orbColors = [0x38bdf8, 0x818cf8, 0xf43f5e];
  orbColors.forEach((col, idx) => {
    const orb = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.12, 0),
      new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.5, wireframe: true })
    );
    const angle = (idx / orbColors.length) * Math.PI * 2;
    orb.position.set(Math.cos(angle) * 1.6, 0.2 + idx * 0.3, Math.sin(angle) * 1.6);
    orbGroup.add(orb);
  });

  // --- INTERACTIVITY: MOUSE, SCROLL & CLICK ---
  let mouseX = 0, mouseY = 0;
  let targetPos = { x: 1.3, y: -0.2, z: 0 };
  let targetRotY = -0.3;
  let spinBoost = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  // React to Page Scroll!
  const quotes = [
    "👋 Hi! I'm Neil's 3D Twin. Click me!",
    "🎓 MCA @ MACE | State Rank 373!",
    "🧠 Building Deep Learning & CNN models!",
    "🚀 Let's build something awesome together!"
  ];

  window.addEventListener('scroll', () => {
    const scrollMax = document.body.scrollHeight - window.innerHeight || 1;
    const progress = window.scrollY / scrollMax;

    if (progress < 0.25) {
      // Hero Section: Right side, normal view
      targetPos = { x: 1.3, y: -0.2, z: 0 };
      targetRotY = -0.3;
      if (bubble) bubble.innerText = quotes[0];
    } else if (progress < 0.55) {
      // About Section: Zoom in closer to face & stickers!
      targetPos = { x: 1.1, y: -0.05, z: 1.4 };
      targetRotY = -0.45;
      if (bubble) bubble.innerText = quotes[1];
    } else if (progress < 0.8) {
      // Skills Section: Glide across to left side
      targetPos = { x: -1.3, y: -0.2, z: 0.4 };
      targetRotY = 0.4;
      if (bubble) bubble.innerText = quotes[2];
    } else {
      // Projects / Contact: Center-right dramatic angle
      targetPos = { x: 1.2, y: -0.15, z: 0.8 };
      targetRotY = -0.25;
      if (bubble) bubble.innerText = quotes[3];
    }
  });

  // Click on 3D canvas triggers spin + quote change
  let clickCount = 0;
  renderer.domElement.addEventListener('click', () => {
    spinBoost = Math.PI * 2; // 360 spin!
    clickCount = (clickCount + 1) % quotes.length;
    if (bubble) {
      bubble.innerText = quotes[clickCount];
      bubble.classList.add('pop');
      setTimeout(() => bubble.classList.remove('pop'), 400);
    }
  });

  // Automatic Eye Blinking every 3.5 seconds
  setInterval(() => {
    eyeGroup.scale.y = 0.05;
    setTimeout(() => { eyeGroup.scale.y = 1; }, 140);
  }, 3500);

  // --- ANIMATION LOOP ---
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Smooth position & floating effect
    charGroup.position.x += (targetPos.x - charGroup.position.x) * 0.05;
    charGroup.position.y += (targetPos.y + Math.sin(t * 2.2) * 0.05 - charGroup.position.y) * 0.05;
    charGroup.position.z += (targetPos.z - charGroup.position.z) * 0.05;

    // Spin decay on click
    spinBoost *= 0.88;

    // Head & Eye cursor tracking
    headGroup.rotation.y += (targetRotY + mouseX * 0.4 + spinBoost - headGroup.rotation.y) * 0.08;
    headGroup.rotation.x += (-mouseY * 0.25 - headGroup.rotation.x) * 0.08;

    // Orbit the 3D AI nodes
    orbGroup.rotation.y = t * 0.6;
    orbGroup.rotation.z = Math.sin(t * 0.5) * 0.15;

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();