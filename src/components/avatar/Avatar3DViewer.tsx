import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ZoomIn, ZoomOut, RotateCcw, Play, Pause, Compass, Eye } from 'lucide-react';
import { AvatarConfiguration } from '../../types';

interface Avatar3DViewerProps {
  config: AvatarConfiguration;
  className?: string;
  animate?: boolean;
  showControls?: boolean;
}

export const Avatar3DViewer: React.FC<Avatar3DViewerProps> = ({
  config,
  className = 'w-full h-80',
  animate = true,
  showControls = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Local state for zoom and auto-rotation toggles
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(animate);

  // References for imperative camera/rotation control from UI buttons
  const zoomControlRef = useRef<(delta: number) => void>(() => {});
  const resetControlRef = useRef<() => void>(() => {});
  const setPresetAngleRef = useRef<(angle: 'front' | 'side' | 'face') => void>(() => {});

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    // SCENE
    const scene = new THREE.Scene();

    // CAMERA with Orbit Radius
    const defaultRadius = 4.2;
    let cameraRadius = defaultRadius;
    let cameraPitch = 0.15; // Vertical tilt angle in radians
    let cameraTargetY = 1.35; // Looking target height

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);

    const updateCameraPosition = () => {
      // Clamped radius between 2.0 (close-up) and 6.8 (wide view)
      cameraRadius = Math.max(2.0, Math.min(6.8, cameraRadius));
      const effectiveRadius = cameraRadius * Math.cos(cameraPitch);
      const effectiveY = cameraTargetY + cameraRadius * Math.sin(cameraPitch);

      camera.position.set(0, effectiveY, effectiveRadius);
      camera.lookAt(0, cameraTargetY, 0);

      // Compute display zoom % (100% is defaultRadius)
      const currentPct = Math.round((defaultRadius / cameraRadius) * 100);
      setZoomLevel(currentPct);
    };

    updateCameraPosition();

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // LIGHTS
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.25);
    dirLight.position.set(4, 6, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0x00e5ff, 0.65);
    backLight.position.set(-4, 3, -4);
    scene.add(backLight);

    const rimLight = new THREE.PointLight(0xa855f7, 0.8, 10);
    rimLight.position.set(0, 3, -2.5);
    scene.add(rimLight);

    // PEDESTAL PLATFORM
    const platformGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.22, 36);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3,
      metalness: 0.7,
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = 0.11;
    platform.receiveShadow = true;
    scene.add(platform);

    const ringGeo = new THREE.TorusGeometry(1.55, 0.035, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.23;
    scene.add(ring);

    // AVATAR GROUP
    const avatarGroup = new THREE.Group();
    avatarGroup.position.y = 0.23;
    scene.add(avatarGroup);

    // MATERIALS BASED ON CONFIG
    const skinColorInt = parseInt(config.skinColor.replace('#', '0x'), 16) || 0xffc107;
    const torsoColorInt = parseInt(config.torsoColor.replace('#', '0x'), 16) || 0x1e88e5;
    const legsColorInt = parseInt(config.legsColor.replace('#', '0x'), 16) || 0x263238;
    const hairColorInt = parseInt(config.hairColor.replace('#', '0x'), 16) || 0x212121;

    const skinMat = new THREE.MeshStandardMaterial({ color: skinColorInt, roughness: 0.35 });
    const torsoMat = new THREE.MeshStandardMaterial({ color: torsoColorInt, roughness: 0.45 });
    const legsMat = new THREE.MeshStandardMaterial({ color: legsColorInt, roughness: 0.55 });
    const hairMat = new THREE.MeshStandardMaterial({ color: hairColorInt, roughness: 0.3 });

    // BODY SHAPE SCALE & PROPORTIONS
    // 'standard' | 'slim' | 'heavy' | 'tall' | 'chibi'
    const bodyShape = config.bodyShape || 'standard';

    let legWidth = 0.38;
    let legHeight = 0.82;
    let legDepth = 0.38;
    let legSpacing = 0.24;

    let torsoWidth = 0.85;
    let torsoHeight = 0.95;
    let torsoDepth = 0.45;

    let armWidth = 0.32;
    let armHeight = 0.85;
    let armDepth = 0.35;
    let armOffset = 0.56;

    let headScale = 1.0;

    if (bodyShape === 'slim') {
      torsoWidth = 0.70;
      torsoHeight = 0.98;
      torsoDepth = 0.36;
      armWidth = 0.24;
      armDepth = 0.28;
      armOffset = 0.46;
      legWidth = 0.29;
      legDepth = 0.30;
      legSpacing = 0.18;
    } else if (bodyShape === 'heavy') {
      torsoWidth = 1.15;
      torsoHeight = 0.95;
      torsoDepth = 0.60;
      armWidth = 0.42;
      armDepth = 0.42;
      armOffset = 0.72;
      legWidth = 0.46;
      legDepth = 0.46;
      legSpacing = 0.28;
      headScale = 0.95;
    } else if (bodyShape === 'tall') {
      torsoWidth = 0.78;
      torsoHeight = 1.15;
      torsoDepth = 0.40;
      legHeight = 1.05;
      armHeight = 1.0;
      armOffset = 0.52;
    } else if (bodyShape === 'chibi') {
      torsoWidth = 0.65;
      torsoHeight = 0.60;
      torsoDepth = 0.42;
      legHeight = 0.50;
      legWidth = 0.30;
      armHeight = 0.52;
      armWidth = 0.24;
      armOffset = 0.42;
      headScale = 1.35; // Big cute head
    }

    const legBaseY = legHeight / 2;
    const torsoCenterY = legHeight + torsoHeight / 2;
    const torsoTopY = legHeight + torsoHeight;
    const headCenterY = torsoTopY + (0.42 * headScale);

    // 1. LEGS
    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(-legSpacing, legBaseY, 0);
    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(legSpacing, legBaseY, 0);

    const legGeo = new THREE.BoxGeometry(legWidth, legHeight, legDepth);
    const leftLeg = new THREE.Mesh(legGeo, legsMat);
    const rightLeg = new THREE.Mesh(legGeo, legsMat);
    leftLeg.castShadow = true;
    rightLeg.castShadow = true;

    leftLegGroup.add(leftLeg);
    rightLegGroup.add(rightLeg);
    avatarGroup.add(leftLegGroup);
    avatarGroup.add(rightLegGroup);

    // 2. TORSO
    const torsoGeo = new THREE.BoxGeometry(torsoWidth, torsoHeight, torsoDepth);
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.set(0, torsoCenterY, 0);
    torso.castShadow = true;
    torso.receiveShadow = true;
    avatarGroup.add(torso);

    // Belt / waistband detail
    const beltGeo = new THREE.BoxGeometry(torsoWidth + 0.02, 0.08, torsoDepth + 0.02);
    const beltMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 });
    const belt = new THREE.Mesh(beltGeo, beltMat);
    belt.position.set(0, legHeight + 0.05, 0);
    avatarGroup.add(belt);

    // 3. ARMS & HANDS
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-armOffset, torsoTopY - 0.1, 0);
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(armOffset, torsoTopY - 0.1, 0);

    // Sleeves (top 65% torso color)
    const sleeveHeight = armHeight * 0.65;
    const sleeveGeo = new THREE.BoxGeometry(armWidth, sleeveHeight, armDepth);
    const leftSleeve = new THREE.Mesh(sleeveGeo, torsoMat);
    leftSleeve.position.y = -sleeveHeight / 2;
    leftArmGroup.add(leftSleeve);

    const rightSleeve = new THREE.Mesh(sleeveGeo, torsoMat);
    rightSleeve.position.y = -sleeveHeight / 2;
    rightArmGroup.add(rightSleeve);

    // Hands / Forearms (Skin Tone)
    const handHeight = armHeight * 0.35;
    const handGeo = new THREE.BoxGeometry(armWidth * 0.92, handHeight, armDepth * 0.92);
    const leftHand = new THREE.Mesh(handGeo, skinMat);
    leftHand.position.y = -sleeveHeight - (handHeight / 2);
    leftArmGroup.add(leftHand);

    const rightHand = new THREE.Mesh(handGeo, skinMat);
    rightHand.position.y = -sleeveHeight - (handHeight / 2);
    rightArmGroup.add(rightHand);

    avatarGroup.add(leftArmGroup);
    avatarGroup.add(rightArmGroup);

    // 4. HEAD (Dynamic Shape Selection)
    // 'block' | 'round' | 'cyber' | 'diamond' | 'flat'
    const headStyle = config.headStyle || 'block';
    const headGroup = new THREE.Group();
    headGroup.position.set(0, headCenterY, 0);
    headGroup.scale.set(headScale, headScale, headScale);
    avatarGroup.add(headGroup);

    let headMesh: THREE.Mesh;

    if (headStyle === 'round') {
      // Smooth Spherical Head
      const roundGeo = new THREE.SphereGeometry(0.42, 32, 32);
      headMesh = new THREE.Mesh(roundGeo, skinMat);
    } else if (headStyle === 'cyber') {
      // Cybernetic Beveled / Octagonal Helmet Head
      const cyberGeo = new THREE.CylinderGeometry(0.40, 0.44, 0.74, 8);
      headMesh = new THREE.Mesh(cyberGeo, skinMat);

      // Cyber Visor Stripe
      const cyberVisorGeo = new THREE.BoxGeometry(0.72, 0.16, 0.32);
      const cyberVisorMat = new THREE.MeshStandardMaterial({
        color: 0x00e5ff,
        emissive: 0x00e5ff,
        emissiveIntensity: 0.9,
      });
      const cyberVisor = new THREE.Mesh(cyberVisorGeo, cyberVisorMat);
      cyberVisor.position.set(0, 0.05, 0.28);
      headGroup.add(cyberVisor);

      // Antenna
      const antennaGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8);
      const antennaMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
      const antenna = new THREE.Mesh(antennaGeo, antennaMat);
      antenna.position.set(0.38, 0.45, 0);
      headGroup.add(antenna);
    } else if (headStyle === 'diamond') {
      // Faceted Geometric Diamond Head
      const diamondGeo = new THREE.OctahedronGeometry(0.50, 0);
      headMesh = new THREE.Mesh(diamondGeo, skinMat);
    } else if (headStyle === 'flat') {
      // Broad / Flat-Top Head
      const flatGeo = new THREE.BoxGeometry(0.92, 0.62, 0.75);
      headMesh = new THREE.Mesh(flatGeo, skinMat);
    } else {
      // Classic Block Head (Default)
      const blockGeo = new THREE.BoxGeometry(0.75, 0.75, 0.70);
      headMesh = new THREE.Mesh(blockGeo, skinMat);
    }

    headMesh.castShadow = true;
    headGroup.add(headMesh);

    // EYES & MOUTH (Faces)
    if (headStyle !== 'cyber') {
      const eyeGeo = new THREE.BoxGeometry(0.11, 0.11, 0.02);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
      const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
      leftEye.position.set(-0.17, 0.08, 0.36);
      headGroup.add(leftEye);

      const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
      rightEye.position.set(0.17, 0.08, 0.36);
      headGroup.add(rightEye);

      // Expression mouth
      const mouthGeo = new THREE.BoxGeometry(0.22, 0.045, 0.02);
      const mouthMat = new THREE.MeshBasicMaterial({ color: 0x27272a });
      const mouth = new THREE.Mesh(mouthGeo, mouthMat);
      mouth.position.set(0, -0.12, 0.36);
      headGroup.add(mouth);
    }

    // HAIR / HAT ACCESSORIES
    if (config.hatId?.includes('visor')) {
      const visorGeo = new THREE.BoxGeometry(0.82, 0.20, 0.32);
      const visorMat = new THREE.MeshStandardMaterial({
        color: 0x00e5ff,
        emissive: 0x00e5ff,
        emissiveIntensity: 0.8,
      });
      const visor = new THREE.Mesh(visorGeo, visorMat);
      visor.position.set(0, 0.08, 0.28);
      headGroup.add(visor);
    } else if (config.hairStyle === 'spiky') {
      for (let i = -0.25; i <= 0.25; i += 0.18) {
        const spikeGeo = new THREE.ConeGeometry(0.12, 0.32, 4);
        const spike = new THREE.Mesh(spikeGeo, hairMat);
        spike.position.set(i, 0.48, (i * i * -0.3));
        headGroup.add(spike);
      }
    } else if (config.hairStyle === 'cap') {
      const capGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.2, 16);
      const capMat = new THREE.MeshStandardMaterial({ color: hairColorInt });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.set(0, 0.42, 0);
      headGroup.add(cap);

      const brimGeo = new THREE.BoxGeometry(0.65, 0.04, 0.45);
      const brim = new THREE.Mesh(brimGeo, capMat);
      brim.position.set(0, 0.35, 0.38);
      headGroup.add(brim);
    }

    // BACK ACCESSORIES (WINGS)
    if (config.backAccessoryId?.includes('wings')) {
      const wingGeo = new THREE.BoxGeometry(1.2, 0.52, 0.05);
      const wingMat = new THREE.MeshStandardMaterial({
        color: 0xa855f7,
        emissive: 0xa855f7,
        emissiveIntensity: 0.85,
      });
      const leftWing = new THREE.Mesh(wingGeo, wingMat);
      leftWing.position.set(-0.72, torsoCenterY + 0.1, -torsoDepth / 2 - 0.05);
      leftWing.rotation.z = 0.35;
      avatarGroup.add(leftWing);

      const rightWing = new THREE.Mesh(wingGeo, wingMat);
      rightWing.position.set(0.72, torsoCenterY + 0.1, -torsoDepth / 2 - 0.05);
      rightWing.rotation.z = -0.35;
      avatarGroup.add(rightWing);
    }

    // MOUSE & TOUCH ORBIT ROTATION + ZOOM HANDLERS
    let isDragging = false;
    let previousMouseX = 0;
    let previousMouseY = 0;

    const onPointerDown = (clientX: number, clientY: number) => {
      isDragging = true;
      previousMouseX = clientX;
      previousMouseY = clientY;
    };

    const onPointerMove = (clientX: number, clientY: number) => {
      if (!isDragging) return;
      const deltaX = clientX - previousMouseX;
      const deltaY = clientY - previousMouseY;

      // Horizontal Rotation (Yaw)
      avatarGroup.rotation.y += deltaX * 0.012;

      // Vertical Camera Pitch (Clamped tilt)
      cameraPitch = Math.max(-0.25, Math.min(0.65, cameraPitch + deltaY * 0.006));
      updateCameraPosition();

      previousMouseX = clientX;
      previousMouseY = clientY;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    // Wheel Zoom
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomStep = e.deltaY * 0.0035;
      cameraRadius = Math.max(2.0, Math.min(6.8, cameraRadius + zoomStep));
      updateCameraPosition();
    };

    // DOM LISTENERS
    const domElement = renderer.domElement;

    const handleMouseDown = (e: MouseEvent) => onPointerDown(e.clientX, e.clientY);
    const handleMouseMove = (e: MouseEvent) => onPointerMove(e.clientX, e.clientY);
    const handleMouseUp = () => onPointerUp();

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleTouchEnd = () => onPointerUp();

    domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    domElement.addEventListener('wheel', onWheel, { passive: false });

    domElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    // Imperative UI Control Callbacks
    zoomControlRef.current = (delta: number) => {
      cameraRadius = Math.max(2.0, Math.min(6.8, cameraRadius + delta));
      updateCameraPosition();
    };

    resetControlRef.current = () => {
      avatarGroup.rotation.y = 0;
      cameraPitch = 0.15;
      cameraRadius = defaultRadius;
      updateCameraPosition();
    };

    setPresetAngleRef.current = (preset: 'front' | 'side' | 'face') => {
      if (preset === 'front') {
        avatarGroup.rotation.y = 0;
        cameraPitch = 0.15;
        cameraRadius = defaultRadius;
      } else if (preset === 'side') {
        avatarGroup.rotation.y = Math.PI / 2;
        cameraPitch = 0.15;
        cameraRadius = defaultRadius;
      } else if (preset === 'face') {
        avatarGroup.rotation.y = 0;
        cameraPitch = 0.05;
        cameraRadius = 2.4;
      }
      updateCameraPosition();
    };

    // ANIMATION LOOP
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animateLoop = () => {
      animationFrameId = requestAnimationFrame(animateLoop);
      const elapsedTime = clock.getElapsedTime();

      // Continuous turntable rotation if enabled and not currently dragging
      if (isAutoRotating && !isDragging) {
        avatarGroup.rotation.y += 0.008;
      }

      // Idle subtle breathing animation
      if (animate) {
        avatarGroup.position.y = 0.23 + Math.sin(elapsedTime * 2.5) * 0.025;
        leftArmGroup.rotation.x = Math.sin(elapsedTime * 2) * 0.08;
        rightArmGroup.rotation.x = -Math.sin(elapsedTime * 2) * 0.08;
      }

      renderer.render(scene, camera);
    };

    animateLoop();

    // RESIZE LISTENER
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      domElement.removeEventListener('wheel', onWheel);
      domElement.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
    };
  }, [config, animate, isAutoRotating]);

  return (
    <div
      id="avatar-3d-preview-container"
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-slate-800 shadow-2xl ${className}`}
    >
      {/* 3D WebGL Canvas container */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none select-none"
        title="Click & drag to rotate • Scroll to zoom"
      />

      {/* Floating Header Badges */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-800 text-[11px] font-bold text-slate-300">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>3D Live Model</span>
        </div>

        <div className="bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-800 text-[11px] font-mono font-bold text-cyan-400">
          Zoom: {zoomLevel}%
        </div>
      </div>

      {/* On-Screen Interactive Rotation & Zoom Toolbar */}
      {showControls && (
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
          {/* Preset Angle Buttons */}
          <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-2xl border border-slate-800 shadow-lg">
            <button
              id="avatar-btn-view-front"
              onClick={() => setPresetAngleRef.current('front')}
              className="px-2.5 py-1 text-[10px] font-black rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Front View"
            >
              Front
            </button>
            <button
              id="avatar-btn-view-side"
              onClick={() => setPresetAngleRef.current('side')}
              className="px-2.5 py-1 text-[10px] font-black rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Side View"
            >
              Side
            </button>
            <button
              id="avatar-btn-view-face"
              onClick={() => setPresetAngleRef.current('face')}
              className="px-2.5 py-1 text-[10px] font-black rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
              title="Close-up Head View"
            >
              <Eye className="w-3 h-3" />
              Face
            </button>
          </div>

          {/* Zoom & Camera Controls */}
          <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-2xl border border-slate-800 shadow-lg">
            {/* Toggle Auto Rotation */}
            <button
              id="avatar-btn-toggle-rotate"
              onClick={() => setIsAutoRotating(!isAutoRotating)}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                isAutoRotating
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
              title={isAutoRotating ? 'Pause Turntable' : 'Auto Rotate'}
            >
              {isAutoRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            {/* Zoom In (+) */}
            <button
              id="avatar-btn-zoom-in"
              onClick={() => zoomControlRef.current(-0.6)}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
              title="Zoom In (Scroll Up)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            {/* Zoom Out (-) */}
            <button
              id="avatar-btn-zoom-out"
              onClick={() => zoomControlRef.current(0.6)}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
              title="Zoom Out (Scroll Down)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            {/* Reset Camera */}
            <button
              id="avatar-btn-reset-view"
              onClick={() => resetControlRef.current()}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
              title="Reset View & Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Helper Guidance Text */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 pointer-events-none opacity-60 hover:opacity-100 transition-opacity">
        <span className="text-[10px] text-slate-400 font-medium px-2 py-0.5 rounded-full bg-slate-950/70 border border-slate-800/80 whitespace-nowrap">
          Drag to rotate • Scroll to zoom
        </span>
      </div>
    </div>
  );
};
